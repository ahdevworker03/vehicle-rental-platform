import { describe, expect, it } from "vitest";
import {
  ALL_NAVIGATION_ITEMS,
  MOBILE_PRIMARY_NAVIGATION,
  isMobileMoreRoute,
  isNavigationRouteActive,
} from "./navigation";

describe("navigation route state", () => {
  it("keeps the root route exact while matching nested feature routes", () => {
    expect(isNavigationRouteActive("/", "/")).toBe(true);
    expect(isNavigationRouteActive("/vehicles", "/")).toBe(false);
    expect(isNavigationRouteActive("/vehicles/123", "/vehicles")).toBe(true);
  });

  it("uses every existing destination exactly once", () => {
    const routes = ALL_NAVIGATION_ITEMS.map((item) => item.route);

    expect(new Set(routes).size).toBe(routes.length);
    expect(MOBILE_PRIMARY_NAVIGATION.every((item) => routes.includes(item.route))).toBe(true);
  });

  it("marks More active only outside the pinned mobile destinations", () => {
    expect(isMobileMoreRoute("/rentals/new")).toBe(false);
    expect(isMobileMoreRoute("/maintenance")).toBe(true);
    expect(isMobileMoreRoute("/account")).toBe(true);
  });
});
