import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "./app";

const TUNNEL_ORIGIN = "https://x1gtk7w1-5173.uks1.devtunnels.ms";
const LOCAL_ORIGIN = "http://localhost:5173";

describe("CORS", () => {
  it.each([TUNNEL_ORIGIN, LOCAL_ORIGIN])(
    "allows %s to preflight auth requests",
    async (origin) => {
      const response = await request(app)
        .options("/api/auth/login")
        .set("Origin", origin)
        .set("Access-Control-Request-Method", "POST")
        .set("Access-Control-Request-Headers", "Content-Type, Authorization");

      expect(response.status).toBe(204);
      expect(response.headers["access-control-allow-origin"]).toBe(origin);
      expect(response.headers["access-control-allow-headers"])
        .toContain("Content-Type");
      expect(response.headers["access-control-allow-headers"])
        .toContain("Authorization");
    },
  );

  it("allows a tunneled login request to reach the auth route", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Origin", TUNNEL_ORIGIN)
      .set("Authorization", "Bearer test-token")
      .send({});

    expect(response.status).toBe(422);
    expect(response.headers["access-control-allow-origin"]).toBe(TUNNEL_ORIGIN);
  });

  it("does not allow unconfigured origins", async () => {
    const response = await request(app)
      .options("/api/auth/login")
      .set("Origin", "https://untrusted.devtunnels.ms")
      .set("Access-Control-Request-Method", "POST");

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
