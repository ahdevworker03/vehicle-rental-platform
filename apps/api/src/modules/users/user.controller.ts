import type { Request, Response, NextFunction } from "express";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "./user.service";
import { ok, created, noContent } from "../../shared";
import type { CreateUserInput, UpdateUserInput } from "./user.validation";

async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await listUsers(req.user!.org);
    ok(res, users);
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
    const user = await getUser(id, req.user!.org);
    ok(res, user);
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
    const input = req.body as CreateUserInput;
    const user = await createUser(req.user!.org, input);
    created(res, user);
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
    const input = req.body as UpdateUserInput;
    const user = await updateUser(id, req.user!.org, input);
    ok(res, user);
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
    await deleteUser(id, req.user!.org, req.user!.sub);
    noContent(res);
  } catch (err) {
    next(err);
  }
}

export { list, get, create, update, remove };
