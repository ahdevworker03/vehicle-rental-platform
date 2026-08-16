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
