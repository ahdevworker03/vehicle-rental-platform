import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  customFetch,
  setAuthRefreshHandler,
  setAuthTokenGetter,
} from "@workspace/api-client-react";

describe("authenticated request refresh", () => {
  beforeEach(() => {
    setAuthTokenGetter(null);
    setAuthRefreshHandler(null);
    vi.restoreAllMocks();
  });

  it("refreshes once and retries the original request with the rotated token", async () => {
    let token = "expired-token";
    const refresh = vi.fn(async () => {
      token = "rotated-token";
      return true;
    });
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    setAuthTokenGetter(() => token);
    setAuthRefreshHandler(refresh);

    await expect(customFetch("/api/protected", { responseType: "json" })).resolves.toEqual({ ok: true });
    expect(refresh).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ headers: expect.any(Headers) });
    expect((fetchMock.mock.calls[1]?.[1]?.headers as Headers).get("authorization")).toBe("Bearer rotated-token");
  });

  it("shares one refresh operation across concurrent expired requests", async () => {
    let token = "expired-token";
    let resolveRefresh!: (value: boolean) => void;
    const refresh = vi.fn(() => new Promise<boolean>((resolve) => { resolveRefresh = (value) => { token = "rotated-token"; resolve(value); }; }));
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (_input, init) => {
        const authorization = new Headers(init?.headers).get("authorization");
        if (authorization === "Bearer expired-token") return new Response(null, { status: 401 });
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
      });
    setAuthTokenGetter(() => token);
    setAuthRefreshHandler(refresh);

    const first = customFetch("/api/one", { responseType: "json" });
    const second = customFetch("/api/two", { responseType: "json" });
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    resolveRefresh(true);

    await expect(Promise.all([first, second])).resolves.toEqual([{ ok: true }, { ok: true }]);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
