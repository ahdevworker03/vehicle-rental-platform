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

    const response = await request(app).post("/api/auth/register").send({
      email,
      password: "Password123!",
      organizationName: "Role test organization",
    });

    expect(response.status).toBe(201);

    const user = await prisma.user.findUniqueOrThrow({
      where: { email },
      select: { role: true },
    });

    expect(user.role).toBe("OWNER");
  });
});
