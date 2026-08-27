import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../database";
import { generateAccessToken } from "../auth";
import { cleanup } from "../../test/helpers";

describe("employee invitation routes", () => {
  let organizationId: string;
  let ownerId: string;
  let ownerToken: string;

  beforeEach(async () => {
    await cleanup();

    const organization = await prisma.organization.create({
      data: { name: "Invitation organization" },
    });
    organizationId = organization.id;

    const owner = await prisma.user.create({
      data: {
        organization_id: organizationId,
        email: `invitation-owner-${Date.now()}@example.com`,
        password_hash: "hash",
        role: "OWNER",
      },
    });
    ownerId = owner.id;
    ownerToken = generateAccessToken({
      sub: owner.id,
      org: organizationId,
      role: "OWNER",
    });
  });

  async function createInvitation(email = `employee-${Date.now()}@example.com`) {
    return request(app)
      .post("/api/users/invitations")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ email });
  }

  it("creates an EMPLOYEE invitation with only a token hash persisted", async () => {
    const email = `employee-${Date.now()}@example.com`;
    const response = await createInvitation(email);

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      email,
      role: "EMPLOYEE",
      acceptanceToken: expect.any(String),
    });

    const invitation = await prisma.employeeInvitation.findUniqueOrThrow({
      where: {
        organization_id_email: { organization_id: organizationId, email },
      },
    });
    expect(invitation.token_hash).not.toBe(response.body.data.acceptanceToken);
    expect(invitation.expires_at.getTime()).toBeGreaterThan(Date.now());
    await expect(
      prisma.auditLog.findFirst({
        where: {
          actor_user_id: ownerId,
          action: "EMPLOYEE_INVITATION_CREATED",
          target_id: invitation.id,
        },
      }),
    ).resolves.toBeTruthy();
  });

  it("accepts a valid invitation once and creates an employee in the invited organization", async () => {
    const email = `accepted-${Date.now()}@example.com`;
    const invited = await createInvitation(email);

    const accepted = await request(app).post("/api/auth/invitations/accept").send({
      token: invited.body.data.acceptanceToken,
      password: "Password123!",
    });

    expect(accepted.status).toBe(201);
    expect(accepted.body.data.accessToken).toEqual(expect.any(String));

    const employee = await prisma.user.findUniqueOrThrow({
      where: { email },
      select: { organization_id: true, role: true },
    });
    expect(employee).toEqual({ organization_id: organizationId, role: "EMPLOYEE" });

    const replay = await request(app).post("/api/auth/invitations/accept").send({
      token: invited.body.data.acceptanceToken,
      password: "Password123!",
    });
    expect(replay.status).toBe(409);
    expect(replay.body.error.code).toBe("INVALID_OR_EXPIRED_INVITATION");

    await expect(
      prisma.auditLog.findFirst({
        where: { action: "EMPLOYEE_INVITATION_ACCEPTED" },
      }),
    ).resolves.toBeTruthy();
  });

  it("resend invalidates the prior token and retains one invitation per organization email", async () => {
    const email = `resend-${Date.now()}@example.com`;
    const first = await createInvitation(email);
    const second = await createInvitation(email);

    expect(second.status).toBe(201);
    expect(second.body.data.id).toBe(first.body.data.id);
    expect(second.body.data.acceptanceToken).not.toBe(
      first.body.data.acceptanceToken,
    );
    await expect(
      prisma.employeeInvitation.count({ where: { organization_id: organizationId, email } }),
    ).resolves.toBe(1);

    const oldToken = await request(app).post("/api/auth/invitations/accept").send({
      token: first.body.data.acceptanceToken,
      password: "Password123!",
    });
    expect(oldToken.status).toBe(409);

    const accepted = await request(app).post("/api/auth/invitations/accept").send({
      token: second.body.data.acceptanceToken,
      password: "Password123!",
    });
    expect(accepted.status).toBe(201);
  });

  it("rejects expired invitations without creating a user", async () => {
    const email = `expired-${Date.now()}@example.com`;
    const invited = await createInvitation(email);
    await prisma.employeeInvitation.update({
      where: { id: invited.body.data.id },
      data: { expires_at: new Date(Date.now() - 1) },
    });

    const response = await request(app).post("/api/auth/invitations/accept").send({
      token: invited.body.data.acceptanceToken,
      password: "Password123!",
    });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("INVALID_OR_EXPIRED_INVITATION");
    await expect(prisma.user.findUnique({ where: { email } })).resolves.toBeNull();
  });

  it("does not allow employees or platform owners to issue tenant invitations", async () => {
    const [employee, platformOwner] = await Promise.all([
      prisma.user.create({
        data: {
          organization_id: organizationId,
          email: `employee-issuer-${Date.now()}@example.com`,
          password_hash: "hash",
          role: "EMPLOYEE",
        },
      }),
      prisma.user.create({
        data: {
          organization_id: organizationId,
          email: `platform-issuer-${Date.now()}@example.com`,
          password_hash: "hash",
          role: "PLATFORM_OWNER",
        },
      }),
    ]);

    for (const user of [employee, platformOwner]) {
      const token = generateAccessToken({
        sub: user.id,
        org: organizationId,
        role: user.role,
      });
      const response = await request(app)
        .post("/api/users/invitations")
        .set("Authorization", `Bearer ${token}`)
        .send({ email: `blocked-${user.id}@example.com` });
      expect(response.status).toBe(403);
    }
  });

  it("allows only one concurrent acceptance to create the employee", async () => {
    const email = `concurrent-${Date.now()}@example.com`;
    const invited = await createInvitation(email);
    const payload = {
      token: invited.body.data.acceptanceToken,
      password: "Password123!",
    };

    const responses = await Promise.all([
      request(app).post("/api/auth/invitations/accept").send(payload),
      request(app).post("/api/auth/invitations/accept").send(payload),
    ]);

    expect(responses.filter((response) => response.status === 201)).toHaveLength(1);
    expect(responses.filter((response) => response.status === 409)).toHaveLength(1);
    await expect(prisma.user.count({ where: { email } })).resolves.toBe(1);
  });
});
