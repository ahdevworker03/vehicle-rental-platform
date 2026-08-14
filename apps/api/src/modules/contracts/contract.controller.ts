import type { Request, Response, NextFunction } from "express";
import { getContract, generateContract, deleteContract } from "./contract.service";
import { ok, created, noContent } from "../../shared";

async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rentalId = req.params.id as string;
    const contract = await getContract(rentalId, req.user!.org);
    ok(res, contract);
  } catch (err) {
    next(err);
  }
}

async function generate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rentalId = req.params.id as string;
    const contract = await generateContract(rentalId, req.user!.org);
    created(res, contract);
  } catch (err) {
    next(err);
  }
}

async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rentalId = req.params.id as string;
    await deleteContract(rentalId, req.user!.org);
    noContent(res);
  } catch (err) {
    next(err);
  }
}

export { get, generate, remove };
