import type { MaintenanceResponse } from "@workspace/api-client-react";

export type MaintenanceDisplayStatus = "upcoming" | "overdue" | "completed";

/** Derive the display state from the persisted status + maintenance date. */
export function getDisplayStatus(
  record: MaintenanceResponse,
  now: () => Date = () => new Date(),
): MaintenanceDisplayStatus {
  if (record.status === "COMPLETED") return "completed";
  const due = new Date(record.maintenanceDate).getTime();
  const today = now();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  return due < startOfToday ? "overdue" : "upcoming";
}

export function getOverdueMaintenance(
  records: MaintenanceResponse[],
  now?: () => Date,
): MaintenanceResponse[] {
  return records.filter((m) => getDisplayStatus(m, now) === "overdue");
}

export function getUpcomingMaintenance(
  records: MaintenanceResponse[],
  daysFromToday: (dateStr: string) => number,
  withinDays: number,
  now?: () => Date,
): MaintenanceResponse[] {
  return records
    .filter((m) => getDisplayStatus(m, now) === "upcoming")
    .filter((m) => daysFromToday(m.maintenanceDate) <= withinDays)
    .sort(
      (a, b) =>
        new Date(a.maintenanceDate).getTime() -
        new Date(b.maintenanceDate).getTime(),
    );
}

export function getOverdueCount(
  records: MaintenanceResponse[],
  now?: () => Date,
): number {
  return getOverdueMaintenance(records, now).length;
}

/** Total maintenance records returned by the API (already excludes soft-deleted). */
export function getMaintenanceCount(records: MaintenanceResponse[]): number {
  return records.length;
}

/**
 * Total maintenance cost per vehicle, keyed by vehicle id.
 * Uses `Maintenance.cost` only (the authoritative amount); records without a
 * finalized cost (null) do not contribute.
 */
export function getMaintenanceCostPerVehicle(
  records: MaintenanceResponse[],
): Record<string, number> {
  const costs: Record<string, number> = {};
  for (const record of records) {
    if (record.cost == null) continue;
    costs[record.vehicleId] = (costs[record.vehicleId] ?? 0) + record.cost;
  }
  return costs;
}
