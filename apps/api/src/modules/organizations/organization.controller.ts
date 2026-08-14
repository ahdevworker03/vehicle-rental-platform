import type { Request, Response, NextFunction } from "express";
import {
  getOrganization,
  updateOrganization,
  deleteOrganization,
} from "./organization.service";
import { ok, noContent } from "../../shared";
import type { UpdateOrganizationInput } from "./organization.validation";

async function get(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const org = await getOrganization(req.user!.org);
    ok(res, org);
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
    const input = req.body as UpdateOrganizationInput;
    const org = await updateOrganization(req.user!.org, input);
    ok(res, org);
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
    await deleteOrganization(req.user!.org);
    noContent(res);
  } catch (err) {
    next(err);
  }
}

export { get, update, remove };
