import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../database";
import { cleanup } from "../../test/helpers";
import { hashPassword } from "./auth.hash";
import {
  clearPasswordResetDeliveriesForTest,
  getLatestPasswordResetDeliveryForTest,
} from "./password-reset.delivery";

describe("password reset routes", () => {
  let email: string;
  let userId: string;

  beforeEach(async () => {
    await cleanup();
    clearPasswordResetDeliveriesForTest();

    const organization = await prisma.organization.create({
      data: { name: "Password reset organization" },
    });
    email = `reset-${Date.now()}@example.com`;
    const user = await prisma.user.create({
      data: {
        organization_id: organization.id,
        email,
        password_hash: await hashPassword("Original123!"),
        role: "OWNER",
      },
    });
    userId = user.id;
  });

  async function requestReset() {
    const response = await request(app)
      .post("/api/auth/password-reset/request")
      .send({ email });
    expect(response.status).toBe(204);
    const delivery = getLatestPasswordResetDeliveryForTest(email);
    expect(delivery).toBeDefined();
    return delivery!.token;
  }

  it("returns a generic response for known and unknown emails", async () => {
    const known = await request(app)
      .post("/api/auth/password-reset/request")
      .send({ email });
    const unknown = await request(app)
      .post("/api/auth/password-reset/request")
      .send({ email: `unknown-${Date.now()}@example.com` });

    expect(known.status).toBe(204);
    expect(unknown.status).toBe(204);
    expect(known.text).toBe(unknown.text);
    expect(getLatestPasswordResetDeliveryForTest(email)).toBeDefined();
  });

  it("stores only a token hash and resets the password atomically", async () => {
    const token = await requestReset();
    const stored = await prisma.passwordResetToken.findFirstOrThrow({
      where: { user_id: userId },
    });
    expect(stored.token_hash).not.toBe(token);

    await prisma.refreshToken.create({
      data: {
        token: `refresh-${Date.now()}`,
        user_id: userId,
        expires_at: new Date(Date.now() + 60_000),
      },
    });

    const confirmed = await request(app)
      .post("/api/auth/password-reset/confirm")
      .send({ token, password: "Changed123!" });

    expect(confirmed.status).toBe(204);
    await expect(
      prisma.refreshToken.count({ where: { user_id: userId } }),
    ).resolves.toBe(0);
    await expect(
      prisma.passwordResetToken.findUniqueOrThrow({ where: { id: stored.id } }),
    ).resolves.toMatchObject({ consumed_at: expect.any(Date) });
    await expect(
      prisma.auditLog.findFirst({
        where: {
          action: "PASSWORD_RESET_COMPLETED",
          actor_user_id: userId,
          target_id: userId,
        },
      }),
    ).resolves.toBeTruthy();

    const oldLogin = await request(app).post("/api/auth/login").send({
      email,
      password: "Original123!",
    });
    const newLogin = await request(app).post("/api/auth/login").send({
      email,
      password: "Changed123!",
    });
    expect(oldLogin.status).toBe(401);
    expect(newLogin.status).toBe(200);
  });

  it("invalidates prior active tokens when a reset is requested again", async () => {
    const first = await requestReset();
    const second = await requestReset();

    const firstConfirmation = await request(app)
      .post("/api/auth/password-reset/confirm")
      .send({ token: first, password: "Changed123!" });
    const secondConfirmation = await request(app)
      .post("/api/auth/password-reset/confirm")
      .send({ token: second, password: "Changed123!" });

    expect(firstConfirmation.status).toBe(409);
    expect(secondConfirmation.status).toBe(204);
  });

  it("rejects expired, invalid, and replayed tokens", async () => {
    const expired = await requestReset();
    await prisma.passwordResetToken.updateMany({
      where: { user_id: userId, consumed_at: null },
      data: { expires_at: new Date(Date.now() - 1) },
    });

    for (const token of [expired, "x".repeat(43)]) {
      const response = await request(app)
        .post("/api/auth/password-reset/confirm")
        .send({ token, password: "Changed123!" });
      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe(
        "INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN",
      );
    }

    const valid = await requestReset();
    const first = await request(app)
      .post("/api/auth/password-reset/confirm")
      .send({ token: valid, password: "Changed123!" });
    const replay = await request(app)
      .post("/api/auth/password-reset/confirm")
      .send({ token: valid, password: "Changed123!" });
    expect(first.status).toBe(204);
    expect(replay.status).toBe(409);
  });

  it("allows only one concurrent confirmation to consume a token", async () => {
    const token = await requestReset();
    const payload = { token, password: "Changed123!" };
    const responses = await Promise.all([
      request(app).post("/api/auth/password-reset/confirm").send(payload),
      request(app).post("/api/auth/password-reset/confirm").send(payload),
    ]);

    expect(responses.filter((response) => response.status === 204)).toHaveLength(1);
    expect(responses.filter((response) => response.status === 409)).toHaveLength(1);
  });
});
