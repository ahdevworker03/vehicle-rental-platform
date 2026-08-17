import type { Request, Response, NextFunction } from "express";
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} from "./task.service";
import { ok, created, noContent } from "../../shared";
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "./task.validation";

async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tasks = await listTasks(req.user!.org);
    ok(res, tasks);
  } catch (err) {
    next(err);
  }
}

async function get(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const task = await getTask(id, req.user!.org);
    ok(res, task);
  } catch (err) {
    next(err);
  }
}

async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as CreateTaskInput;
    const task = await createTask(req.user!.org, input);
    created(res, task);
  } catch (err) {
    next(err);
  }
}

async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const input = req.body as UpdateTaskInput;
    const task = await updateTask(id, req.user!.org, input);
    ok(res, task);
  } catch (err) {
    next(err);
  }
}

async function complete(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const task = await completeTask(id, req.user!.org);
    ok(res, task);
  } catch (err) {
    next(err);
  }
}

async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    await deleteTask(id, req.user!.org);
    noContent(res);
  } catch (err) {
    next(err);
  }
}

export {
  list,
  get,
  create,
  update,
  complete,
  remove,
};
