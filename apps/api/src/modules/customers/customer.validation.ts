import {
  CreateCustomerBody,
  UpdateCustomerBody,
  ListCustomersQueryParams,
} from "@workspace/api-zod";

export const createCustomerSchema = CreateCustomerBody;
export const updateCustomerSchema = UpdateCustomerBody;
export const listCustomersQuerySchema = ListCustomersQueryParams;

export type CreateCustomerInput = {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  national_id: string;
  license_number: string;
  license_expiry_date: string;
};

export type UpdateCustomerInput = {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  national_id: string;
  license_number: string;
  license_expiry_date: string;
};

export type ListCustomersQuery = { search?: string };
