import { describe, it, expect } from "vitest";
import type { TaskResponse } from "@workspace/api-client-react";
import {
  matchesStatusFilter,
  matchesSearch,
  filterTasks,
  isTaskDueToday,
  isTaskOverdue,
  getPendingTaskCount,
} from "./selectors";

function makeTask(overrides: Partial<TaskResponse>): TaskResponse {
  return {
    id: `t-${Math.random()}`,
    dueDate: "2026-09-01T12:00:00Z",
    status: "PENDING",
    recurrenceInterval: null,
    recurrenceUnit: null,
    recurrenceEndDate: null,
    recurrenceEndCount: null,
    occurrenceNumber: 1,
    predecessorId: null,
    notes: null,
    createdAt: "2026-08-01T12:00:00Z",
    updatedAt: "2026-08-01T12:00:00Z",
    ...overrides,
    title: overrides.title ?? "مهمة تجريبية",
  };
}

describe("matchesStatusFilter", () => {
  it("matches the persisted status", () => {
    expect(matchesStatusFilter(makeTask({ status: "PENDING" }), "pending")).toBe(true);
    expect(matchesStatusFilter(makeTask({ status: "PENDING" }), "completed")).toBe(false);
    expect(matchesStatusFilter(makeTask({ status: "COMPLETED" }), "completed")).toBe(true);
  });

  it("always matches the all filter", () => {
    expect(matchesStatusFilter(makeTask({ status: "PENDING" }), "all")).toBe(true);
    expect(matchesStatusFilter(makeTask({ status: "COMPLETED" }), "all")).toBe(true);
  });
});

describe("matchesSearch", () => {
  it("matches the title field", () => {
    expect(matchesSearch(makeTask({ title: "تذكير التأمين" }), "تأمين")).toBe(true);
  });

  it("returns true for an empty search term", () => {
    expect(matchesSearch(makeTask({ notes: null }), "")).toBe(true);
    expect(matchesSearch(makeTask({ notes: null }), "   ")).toBe(true);
  });

  it("does not match when the term is absent", () => {
    expect(matchesSearch(makeTask({ title: "زيت" }), "إطارات")).toBe(false);
  });
});

describe("filterTasks", () => {
  const tasks = [
    makeTask({ id: "t1", status: "PENDING", title: "تجديد التأمين" }),
    makeTask({ id: "t2", status: "COMPLETED", title: "تجديد التأمين" }),
    makeTask({ id: "t3", status: "PENDING", title: "فحص السيارة" }),
  ];

  it("applies the status filter only", () => {
    const result = filterTasks(tasks, "pending", "");
    expect(result.map((t) => t.id)).toEqual(["t1", "t3"]);
  });

  it("applies search only", () => {
    const result = filterTasks(tasks, "all", "تأمين");
    expect(result.map((t) => t.id)).toEqual(["t1", "t2"]);
  });

  it("combines search and status filter", () => {
    const result = filterTasks(tasks, "pending", "تأمين");
    expect(result.map((t) => t.id)).toEqual(["t1"]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterTasks(tasks, "completed", "فحص")).toEqual([]);
  });
});

describe("isTaskOverdue", () => {
  const now = () => new Date("2026-09-05T10:00:00Z");

  it("is false for a completed task regardless of due date", () => {
    expect(
      isTaskOverdue(makeTask({ status: "COMPLETED", dueDate: "2026-01-01T12:00:00Z" }), now),
    ).toBe(false);
  });

  it("is true for a pending task whose due date is before today", () => {
    expect(
      isTaskOverdue(makeTask({ status: "PENDING", dueDate: "2026-09-01T12:00:00Z" }), now),
    ).toBe(true);
  });

  it("is false for a pending task due today or later", () => {
    expect(
      isTaskOverdue(makeTask({ status: "PENDING", dueDate: "2026-09-05T12:00:00Z" }), now),
    ).toBe(false);
    expect(
      isTaskOverdue(makeTask({ status: "PENDING", dueDate: "2026-09-10T12:00:00Z" }), now),
    ).toBe(false);
  });

  it("uses the Beirut business date across a UTC calendar boundary", () => {
    const task = makeTask({ dueDate: "2026-09-05T12:00:00Z" });
    const beforeBeirutMidnight = () => new Date("2026-09-05T20:30:00Z");
    const afterBeirutMidnight = () => new Date("2026-09-05T22:30:00Z");

    expect(isTaskDueToday(task, beforeBeirutMidnight)).toBe(true);
    expect(isTaskOverdue(task, beforeBeirutMidnight)).toBe(false);
    expect(isTaskDueToday(task, afterBeirutMidnight)).toBe(false);
    expect(isTaskOverdue(task, afterBeirutMidnight)).toBe(true);
  });
});

describe("getPendingTaskCount", () => {
  it("counts only PENDING tasks", () => {
    const tasks = [
      makeTask({ status: "PENDING" }),
      makeTask({ status: "PENDING" }),
      makeTask({ status: "COMPLETED" }),
    ];
    expect(getPendingTaskCount(tasks)).toBe(2);
  });

  it("returns zero for an empty list", () => {
    expect(getPendingTaskCount([])).toBe(0);
  });
});
