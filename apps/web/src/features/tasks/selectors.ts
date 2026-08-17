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
 * Free-text search over the fields actually available on the Task model.
 * There is no title field; search matches the task notes only (and the id as a
 * fallback so a task is reachable by its identifier). An empty term matches all.
 */
export function matchesSearch(task: TaskResponse, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (task.notes ?? "").toLowerCase().includes(q) || task.id.toLowerCase().includes(q);
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

/**
 * Derived overdue presentation state from `due_date`, without persisting any
 * new status. A pending task whose due date is before today is overdue.
 */
export function isTaskOverdue(task: TaskResponse, now: () => Date = () => new Date()): boolean {
  if (task.status === "COMPLETED") return false;
  const due = new Date(task.dueDate).getTime();
  const today = now();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  return due < startOfToday;
}

export function getPendingTaskCount(tasks: TaskResponse[]): number {
  return tasks.filter((t) => t.status === "PENDING").length;
}
