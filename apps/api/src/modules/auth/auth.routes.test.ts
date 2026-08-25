import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../database";
import { cleanup } from "../../test/helpers";

describe("auth routes", () => {
  beforeEach(async () => {
    await cleanup();
  });

  it("registers a new organization with an owner", async () => {
    const email = `owner-${Date.now()}@example.com`;
    const organizationName = `Role test organization ${Date.now()}`;

    const response = await request(app).post("/api/auth/register").send({
      email,
      password: "Password123!",
      organizationName,
    });

    expect(response.status).toBe(201);

    const user = await prisma.user.findUniqueOrThrow({
      where: { email },
      select: { id: true, role: true, organization_id: true },
    });

    expect(user.role).toBe("OWNER");
    await expect(
      prisma.organization.count({ where: { id: user.organization_id } }),
    ).resolves.toBe(1);
    await expect(
      prisma.refreshToken.count({ where: { user_id: user.id } }),
    ).resolves.toBe(1);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));
  });

  it("rejects a duplicate email without creating another organization", async () => {
    const email = `duplicate-${Date.now()}@example.com`;
    const first = await request(app).post("/api/auth/register").send({
      email,
      password: "Password123!",
      organizationName: "First registration organization",
    });
    const second = await request(app).post("/api/auth/register").send({
      email,
      password: "Password123!",
      organizationName: "Duplicate registration organization",
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
    await expect(prisma.organization.count()).resolves.toBe(1);
    await expect(prisma.user.count({ where: { email } })).resolves.toBe(1);
  });

  it("keeps concurrent duplicate registrations to one tenant owner", async () => {
    const email = `concurrent-${Date.now()}@example.com`;
    const responses = await Promise.all([
      request(app).post("/api/auth/register").send({
        email,
        password: "Password123!",
        organizationName: "Concurrent registration A",
      }),
      request(app).post("/api/auth/register").send({
        email,
        password: "Password123!",
        organizationName: "Concurrent registration B",
      }),
    ]);

    expect(responses.filter((response) => response.status === 201)).toHaveLength(1);
    expect(responses.filter((response) => response.status === 409)).toHaveLength(1);
    expect(
      responses.find((response) => response.status === 409)?.body.error.code,
    ).toBe("EMAIL_ALREADY_EXISTS");

    const [organizationCount, owners] = await Promise.all([
      prisma.organization.count(),
      prisma.user.findMany({
        where: { email },
        select: { organization_id: true, role: true },
      }),
    ]);
    expect(organizationCount).toBe(1);
    expect(owners).toEqual([
      expect.objectContaining({ role: "OWNER" }),
    ]);
  });
});
