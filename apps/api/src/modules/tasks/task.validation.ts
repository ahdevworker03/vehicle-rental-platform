import {
  CreateTaskBody,
  UpdateTaskBody,
} from "@workspace/api-zod";
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "./task.types";

export const createTaskSchema = CreateTaskBody;
export const updateTaskSchema = UpdateTaskBody;

export type {
  CreateTaskInput,
  UpdateTaskInput,
};
