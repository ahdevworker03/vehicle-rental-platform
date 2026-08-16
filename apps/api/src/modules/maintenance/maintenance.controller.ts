import type { Request, Response, NextFunction } from "express";
import {
  listMaintenance,
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  completeMaintenance,
  listVehicleMaintenance,
  deleteMaintenance,
} from "./maintenance.service";
import { ok, created, noContent } from "../../shared";
import type {
  CreateMaintenanceInput,
  UpdateMaintenanceInput,
  CompleteMaintenanceInput,
  ListMaintenanceQuery,
} from "./maintenance.validation";

async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = req.query as ListMaintenanceQuery;
    const records = await listMaintenance(req.user!.org, query.vehicleId);
    ok(res, records);
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
    const record = await getMaintenance(id, req.user!.org);
    ok(res, record);
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
    const input = req.body as CreateMaintenanceInput;
    const record = await createMaintenance(req.user!.org, input);
    created(res, record);
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
    const input = req.body as UpdateMaintenanceInput;
    const record = await updateMaintenance(id, req.user!.org, input);
    ok(res, record);
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
    const input = req.body as CompleteMaintenanceInput;
    const record = await completeMaintenance(id, req.user!.org, input);
    ok(res, record);
  } catch (err) {
    next(err);
  }
}

async function listByVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const vehicleId = req.params.vehicleId as string;
    const records = await listVehicleMaintenance(vehicleId, req.user!.org);
    ok(res, records);
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
    await deleteMaintenance(id, req.user!.org);
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
  listByVehicle,
  remove,
};
