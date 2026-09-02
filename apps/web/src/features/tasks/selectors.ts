import type { TaskResponse } from "@workspace/api-client-react";

export type TaskStatusFilter = "all" | "pending" | "completed";

/**
 * Filter tasks by persisted status. Only `PENDING`/`COMPLETED` exist.
 */
export function matchesStatusFilter(
  task: TaskResponse,
  filter: TaskStatusFilter,
): boolean {
  if (filter === "all") return true;
  return task.status === filter.toUpperCase();
}

/**
 * Free-text search over the task identity, optional notes, and identifier.
 */
export function matchesSearch(task: TaskResponse, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return task.title.toLowerCase().includes(q) || (task.notes ?? "").toLowerCase().includes(q) || task.id.toLowerCase().includes(q);
}

/**
 * Apply the persisted-status filter first, then the search term.
 */
export function filterTasks(
  tasks: TaskResponse[],
  filter: TaskStatusFilter,
  search: string,
): TaskResponse[] {
  return tasks.filter(
    (task) => matchesStatusFilter(task, filter) && matchesSearch(task, search),
  );
}

function beirutDateKey(value: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    numberingSystem: "latn",
    timeZone: "Asia/Beirut",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function isTaskDueToday(task: TaskResponse, now: () => Date = () => new Date()): boolean {
  return task.status !== "COMPLETED" && beirutDateKey(new Date(task.dueDate)) === beirutDateKey(now());
}

/**
 * Derived overdue presentation state from `due_date`, without persisting any
 * new status. A pending task whose due date is before today is overdue.
 */
export function isTaskOverdue(task: TaskResponse, now: () => Date = () => new Date()): boolean {
  if (task.status === "COMPLETED") return false;
  return beirutDateKey(new Date(task.dueDate)) < beirutDateKey(now());
}

export function getPendingTaskCount(tasks: TaskResponse[]): number {
  return tasks.filter((t) => t.status === "PENDING").length;
}
