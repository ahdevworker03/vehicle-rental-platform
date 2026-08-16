import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts"],
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      PORT: "4001",
      LOG_LEVEL: "fatal",
      DATABASE_URL:
        "postgresql://postgres:postgres@localhost:5432/vehicle_rental_test?schema=public",
      JWT_SECRET: "test-jwt-secret",
      REFRESH_TOKEN_SECRET: "test-refresh-token-secret",
    },
  },
});
