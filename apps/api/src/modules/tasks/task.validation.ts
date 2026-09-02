import { CreateTaskBody, UpdateTaskBody } from "@workspace/api-zod";
import { z } from "zod";
import type { CreateTaskInput, UpdateTaskInput } from "./task.types";

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  })
  .transform((value) => new Date(`${value}T00:00:00.000Z`))
  .nullable()
  .optional();

const positiveIntegerSchema = z.number().int().min(1).nullable().optional();
const titleSchema = z.string().trim().min(1);

function recurrenceIssue(
  input: {
    recurrence_interval?: number | null;
    recurrence_unit?: string | null;
    recurrence_end_date?: Date | null;
    recurrence_end_count?: number | null;
  },
  requireCompletePair: boolean,
): boolean {
  const hasInterval = input.recurrence_interval != null;
  const hasUnit = input.recurrence_unit != null;
  const hasEndDate = input.recurrence_end_date != null;
  const hasEndCount = input.recurrence_end_count != null;

  return (
    (requireCompletePair && hasInterval !== hasUnit) ||
    (hasEndDate && hasEndCount) ||
    ((hasEndDate || hasEndCount) &&
      (input.recurrence_interval === null || input.recurrence_unit === null))
  );
}

export const createTaskSchema = CreateTaskBody.extend({
  title: titleSchema,
  recurrence_interval: positiveIntegerSchema,
  recurrence_end_date: dateOnlySchema,
  recurrence_end_count: positiveIntegerSchema,
}).superRefine((input, ctx) => {
  if (recurrenceIssue(input, true)) {
    ctx.addIssue({
      code: "custom",
      message: "Invalid task recurrence configuration.",
      path: ["recurrence_interval"],
    });
  }
});

export const updateTaskSchema = UpdateTaskBody.extend({
  title: titleSchema.optional(),
  recurrence_interval: positiveIntegerSchema,
  recurrence_end_date: dateOnlySchema,
  recurrence_end_count: positiveIntegerSchema,
}).superRefine((input, ctx) => {
  if (recurrenceIssue(input, false)) {
    ctx.addIssue({
      code: "custom",
      message: "Invalid task recurrence configuration.",
      path: ["recurrence_interval"],
    });
  }
});

export type { CreateTaskInput, UpdateTaskInput };
