import type { Request, Response, NextFunction } from "express";
import { listVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } from "./vehicle.service";
import { ok, created, noContent } from "../../shared";
import type { CreateVehicleInput, UpdateVehicleInput } from "./vehicle.validation";

async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicles = await listVehicles(req.user!.org);
    ok(res, vehicles);
  } catch (err) {
    next(err);
  }
}

async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const vehicle = await getVehicle(id, req.user!.org);
    ok(res, vehicle);
  } catch (err) {
    next(err);
  }
}

async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as CreateVehicleInput;
    const vehicle = await createVehicle(req.user!.org, input);
    created(res, vehicle);
  } catch (err) {
    next(err);
  }
}

async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const input = req.body as UpdateVehicleInput;
    const vehicle = await updateVehicle(id, req.user!.org, input);
    ok(res, vehicle);
  } catch (err) {
    next(err);
  }
}

async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await deleteVehicle(id, req.user!.org);
    noContent(res);
  } catch (err) {
    next(err);
  }
}

export { list, get, create, update, remove };
