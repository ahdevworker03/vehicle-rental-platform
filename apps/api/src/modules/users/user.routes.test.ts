import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../database";
import { generateAccessToken } from "../auth";
import { cleanup } from "../../test/helpers";

describe("user routes", () => {
  let organizationId: string;
  let ownerToken: string;

  beforeEach(async () => {
    await cleanup();

    const organization = await prisma.organization.create({
      data: { name: "Role test organization" },
    });
    organizationId = organization.id;

    const owner = await prisma.user.create({
      data: {
        organization_id: organizationId,
        email: `owner-${Date.now()}@example.com`,
        password_hash: "hash",
        role: "OWNER",
      },
    });

    ownerToken = generateAccessToken({
      sub: owner.id,
      org: organizationId,
      role: "OWNER",
    });
  });

  it("allows an owner to create an employee in the same organization", async () => {
    const response = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        email: `employee-${Date.now()}@example.com`,
        password: "Password123!",
        role: "EMPLOYEE",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.role).toBe("EMPLOYEE");
  });

  it("rejects legacy and platform roles from tenant user creation", async () => {
    for (const role of ["MANAGER", "PLATFORM_OWNER"]) {
      const response = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          email: `${role.toLowerCase()}-${Date.now()}@example.com`,
          password: "Password123!",
          role,
        });

      expect(response.status).toBe(422);
    }
  });

  it("does not grant a platform owner tenant user-management access", async () => {
    const platformOwner = await prisma.user.create({
      data: {
        organization_id: organizationId,
        email: `platform-owner-${Date.now()}@example.com`,
        password_hash: "hash",
        role: "PLATFORM_OWNER",
      },
    });
    const platformOwnerToken = generateAccessToken({
      sub: platformOwner.id,
      org: organizationId,
      role: "PLATFORM_OWNER",
    });

    const response = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${platformOwnerToken}`)
      .send({
        email: `employee-${Date.now()}@example.com`,
        password: "Password123!",
        role: "EMPLOYEE",
      });

    expect(response.status).toBe(403);
  });
});
