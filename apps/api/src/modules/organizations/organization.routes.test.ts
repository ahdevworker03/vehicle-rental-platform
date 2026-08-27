import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../database";
import { generateAccessToken } from "../auth";
import { cleanup } from "../../test/helpers";

describe("organization lifecycle routes", () => {
  let organizationId: string;
  let ownerToken: string;
  let platformOwnerToken: string;

  beforeEach(async () => {
    await cleanup();

    const organization = await prisma.organization.create({
      data: { name: "Tenant organization" },
    });
    const platformOrganization = await prisma.organization.create({
      data: { name: "Platform organization", status: "ACTIVE" },
    });
    const [owner, platformOwner] = await Promise.all([
      prisma.user.create({
        data: {
          email: "owner@example.com",
          password_hash: "hash",
          role: "OWNER",
          organization_id: organization.id,
        },
      }),
      prisma.user.create({
        data: {
          email: "platform@example.com",
          password_hash: "hash",
          role: "PLATFORM_OWNER",
          organization_id: platformOrganization.id,
        },
      }),
    ]);

    organizationId = organization.id;
    ownerToken = generateAccessToken({
      sub: owner.id,
      org: organization.id,
      role: owner.role,
    });
    platformOwnerToken = generateAccessToken({
      sub: platformOwner.id,
      org: platformOrganization.id,
      role: platformOwner.role,
    });
  });

  it("creates registrations in TRIAL", async () => {
    const email = `trial-${Date.now()}@example.com`;
    const response = await request(app).post("/api/auth/register").send({
      email,
      password: "Password123!",
      organizationName: "Trial organization",
    });

    expect(response.status).toBe(201);

    const user = await prisma.user.findUniqueOrThrow({
      where: { email },
      select: { organization: { select: { status: true } } },
    });
    expect(user.organization.status).toBe("TRIAL");

    const businessResponse = await request(app)
      .get("/api/customers")
      .set("Authorization", `Bearer ${response.body.data.accessToken}`);
    expect(businessResponse.status).toBe(200);
  });

  it("lets an owner manage its organization profile", async () => {
    const response = await request(app)
      .patch("/api/organizations/me")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        legalName: "Tenant Rentals LLC",
        phone: "+961 1 234 567",
        email: "info@tenant.example",
        address: "Beirut",
        contractFooterText: "Approved rental terms apply.",
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: organizationId,
      name: "Tenant organization",
      status: "TRIAL",
      legalName: "Tenant Rentals LLC",
      phone: "+961 1 234 567",
      email: "info@tenant.example",
      address: "Beirut",
      contractFooterText: "Approved rental terms apply.",
    });
  });

  it("allows a platform owner to suspend a tenant and blocks tenant business routes", async () => {
    const statusResponse = await request(app)
      .patch(`/api/platform/organizations/${organizationId}/status`)
      .set("Authorization", `Bearer ${platformOwnerToken}`)
      .send({ status: "SUSPENDED" });

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.data.status).toBe("SUSPENDED");

    const businessResponse = await request(app)
      .get("/api/customers")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(businessResponse.status).toBe(403);
    expect(businessResponse.body.error.code).toBe("ORGANIZATION_NOT_OPERATIONAL");

    const [organizationResponse, currentUserResponse] = await Promise.all([
      request(app)
        .get("/api/organizations/me")
        .set("Authorization", `Bearer ${ownerToken}`),
      request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${ownerToken}`),
    ]);

    expect(organizationResponse.status).toBe(200);
    expect(organizationResponse.body.data.status).toBe("SUSPENDED");
    expect(currentUserResponse.status).toBe(200);
    expect(currentUserResponse.body.data.organizationStatus).toBe("SUSPENDED");
  });

  it("does not let tenant owners manage lifecycle status", async () => {
    const response = await request(app)
      .patch(`/api/platform/organizations/${organizationId}/status`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ status: "ACTIVE" });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("INSUFFICIENT_PERMISSIONS");
  });

  it("does not let employees manage lifecycle status", async () => {
    const employee = await prisma.user.create({
      data: {
        email: "employee@example.com",
        password_hash: "hash",
        role: "EMPLOYEE",
        organization_id: organizationId,
      },
    });
    const employeeToken = generateAccessToken({
      sub: employee.id,
      org: organizationId,
      role: employee.role,
    });

    const response = await request(app)
      .patch(`/api/platform/organizations/${organizationId}/status`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ status: "ACTIVE" });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("INSUFFICIENT_PERMISSIONS");
  });

  it("blocks cancelled organizations from tenant business operations", async () => {
    await request(app)
      .patch(`/api/platform/organizations/${organizationId}/status`)
      .set("Authorization", `Bearer ${platformOwnerToken}`)
      .send({ status: "CANCELLED" })
      .expect(200);

    const response = await request(app)
      .get("/api/customers")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("ORGANIZATION_NOT_OPERATIONAL");
  });

  it("does not grant platform owners ordinary tenant business access", async () => {
    const response = await request(app)
      .get("/api/customers")
      .set("Authorization", `Bearer ${platformOwnerToken}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("TENANT_ACCESS_REQUIRED");
  });

  it("rejects malformed organization IDs on lifecycle updates", async () => {
    const response = await request(app)
      .patch("/api/platform/organizations/not-a-uuid/status")
      .set("Authorization", `Bearer ${platformOwnerToken}`)
      .send({ status: "ACTIVE" });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
