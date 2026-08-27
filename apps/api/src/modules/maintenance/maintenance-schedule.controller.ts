import type { NextFunction, Request, Response } from "express";
import { created, noContent, ok } from "../../shared";
import {
  createMaintenanceSchedule,
  deleteMaintenanceSchedule,
  getMaintenanceSchedule,
  listMaintenanceSchedules,
  updateMaintenanceSchedule,
} from "./maintenance-schedule.service";
import type {
  CreateMaintenanceScheduleInput,
  ListMaintenanceSchedulesQuery,
  UpdateMaintenanceScheduleInput,
} from "./maintenance-schedule.validation";

async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query as ListMaintenanceSchedulesQuery;
    ok(res, await listMaintenanceSchedules(req.user!.org, query.vehicleId));
  } catch (error) {
    next(error);
  }
}

async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ok(res, await getMaintenanceSchedule(req.params.id as string, req.user!.org));
  } catch (error) {
    next(error);
  }
}

async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    created(
      res,
      await createMaintenanceSchedule(
        req.user!.org,
        req.body as CreateMaintenanceScheduleInput,
      ),
    );
  } catch (error) {
    next(error);
  }
}

async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ok(
      res,
      await updateMaintenanceSchedule(
        req.params.id as string,
        req.user!.org,
        req.body as UpdateMaintenanceScheduleInput,
      ),
    );
  } catch (error) {
    next(error);
  }
}

async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteMaintenanceSchedule(req.params.id as string, req.user!.org);
    noContent(res);
  } catch (error) {
    next(error);
  }
}

export { list, get, create, update, remove };
