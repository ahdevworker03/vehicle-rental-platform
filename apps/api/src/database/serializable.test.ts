import { PrismaClientKnownRequestError } from "@workspace/db";
import { describe, expect, it, vi } from "vitest";
import { retrySerializable } from "./serializable";

describe("retrySerializable", () => {
  it("retries a serializable transaction conflict once", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(
        new PrismaClientKnownRequestError("serialization conflict", {
          code: "P2034",
          clientVersion: "test",
        }),
      )
      .mockResolvedValueOnce("completed");

    await expect(retrySerializable(operation)).resolves.toBe("completed");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("does not retry a non-conflict failure", async () => {
    const failure = new Error("operation failed");
    const operation = vi.fn<() => Promise<void>>().mockRejectedValue(failure);

    await expect(retrySerializable(operation)).rejects.toBe(failure);
    expect(operation).toHaveBeenCalledTimes(1);
  });
});
