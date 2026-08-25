import {
  CreateCustomerBody,
  UpdateCustomerBody,
  ListCustomersQueryParams,
} from "@workspace/api-zod";
import { z } from "zod";

const minimumLicenseExpiryDate = new Date("1900-01-01T00:00:00.000Z");
const maximumLicenseExpiryDate = new Date("2100-12-31T23:59:59.999Z");

function isSupportedLicenseExpiryDate(value: unknown): value is Date {
  return (
    value instanceof Date &&
    !Number.isNaN(value.getTime()) &&
    value >= minimumLicenseExpiryDate &&
    value <= maximumLicenseExpiryDate
  );
}

function addLicenseExpiryDateRangeIssue(
  value: { license_expiry_date: Date },
  ctx: z.RefinementCtx,
): void {
  if (isSupportedLicenseExpiryDate(value.license_expiry_date)) {
    return;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ["license_expiry_date"],
    message: "License expiry date must be between 1900-01-01 and 2100-12-31.",
  });
}

export const createCustomerSchema = CreateCustomerBody.superRefine(
  addLicenseExpiryDateRangeIssue,
);
export const updateCustomerSchema = UpdateCustomerBody.superRefine(
  addLicenseExpiryDateRangeIssue,
);
export const listCustomersQuerySchema = ListCustomersQueryParams;

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export type ListCustomersQuery = { search?: string };

export { isSupportedLicenseExpiryDate };
