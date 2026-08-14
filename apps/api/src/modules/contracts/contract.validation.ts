import { GetRentalContractParams } from "@workspace/api-zod";

export const getRentalContractParamsSchema = GetRentalContractParams;

export type GetRentalContractParams = { id: string };
