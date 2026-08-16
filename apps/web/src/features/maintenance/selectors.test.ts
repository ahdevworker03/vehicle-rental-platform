import { describe, it, expect } from "vitest";
import type { MaintenanceResponse } from "@workspace/api-client-react";
import { getOverdueCount, getUpcomingMaintenance, getDisplayStatus } from "./selectors";

function makeRecord(overrides: Partial<MaintenanceResponse>): MaintenanceResponse {
  return {
    id: `m-${Math.random()}`,
    vehicleId: "v1",
    type: "PREVENTIVE_SERVICE",
    status: "SCHEDULED",
    maintenanceDate: "2025-01-20T12:00:00.000Z",
    createdAt: "2025-01-10T12:00:00.000Z",
    updatedAt: "2025-01-10T12:00:00.000Z",
    ...overrides,
  };
}

// days-from-today relative to a fixed anchor (2025-01-15)
const daysFromToday = (dateStr: string) =>
  Math.ceil(
    (new Date(dateStr).getTime() - new Date("2025-01-15T12:00:00Z").getTime()) /
      86_400_000
  );

const now = () => new Date("2025-01-15T12:00:00Z");

describe("getDisplayStatus", () => {
  it("returns completed for completed records regardless of date", () => {
    expect(getDisplayStatus(makeRecord({ status: "COMPLETED" }), now)).toBe("completed");
  });

  it("returns overdue when the maintenance date is before today", () => {
    expect(
      getDisplayStatus(makeRecord({ maintenanceDate: "2025-01-10T12:00:00.000Z" }), now),
    ).toBe("overdue");
  });

  it("returns upcoming when the maintenance date is today or later", () => {
    expect(
      getDisplayStatus(makeRecord({ maintenanceDate: "2025-01-15T12:00:00.000Z" }), now),
    ).toBe("upcoming");
    expect(
      getDisplayStatus(makeRecord({ maintenanceDate: "2025-01-20T12:00:00.000Z" }), now),
    ).toBe("upcoming");
  });
});

describe("getOverdueCount", () => {
  it("counts only overdue records", () => {
    const records = [
      makeRecord({ status: "COMPLETED" }),
      makeRecord({ maintenanceDate: "2025-01-10T12:00:00.000Z" }),
      makeRecord({ maintenanceDate: "2025-01-12T12:00:00.000Z" }),
      makeRecord({ maintenanceDate: "2025-01-20T12:00:00.000Z" }),
    ];
    expect(getOverdueCount(records, now)).toBe(2);
  });
});

describe("getUpcomingMaintenance", () => {
  it("returns upcoming records due within the window, sorted by maintenance date", () => {
    const records = [
      makeRecord({ maintenanceDate: "2025-01-22T12:00:00.000Z" }),
      makeRecord({ maintenanceDate: "2025-01-18T12:00:00.000Z" }),
      makeRecord({ maintenanceDate: "2025-03-01T12:00:00.000Z" }),
      makeRecord({ maintenanceDate: "2025-01-10T12:00:00.000Z" }),
    ];
    const result = getUpcomingMaintenance(records, daysFromToday, 7, now);
    expect(result.map((r) => r.maintenanceDate)).toEqual([
      "2025-01-18T12:00:00.000Z",
      "2025-01-22T12:00:00.000Z",
    ]);
  });

  it("excludes records due beyond the window", () => {
    const records = [
      makeRecord({ maintenanceDate: "2025-01-30T12:00:00.000Z" }),
    ];
    expect(getUpcomingMaintenance(records, daysFromToday, 7, now)).toEqual([]);
  });
});
