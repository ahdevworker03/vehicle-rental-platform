import { CreatePaymentBody } from "@workspace/api-zod";
import type { CreatePaymentInput } from "./payment.types";

export const createPaymentSchema = CreatePaymentBody;

export type { CreatePaymentInput };
