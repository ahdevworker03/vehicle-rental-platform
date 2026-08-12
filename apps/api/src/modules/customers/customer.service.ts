import { AppError } from "../../shared";
import { isUniqueConstraintError } from "../../database";
import * as repo from "./customer.repository";
import type { CustomerResponse, CreateCustomerInput, UpdateCustomerInput } from "./customer.types";

function toResponse(record: {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  national_id: string;
  license_number: string;
  license_expiry_date: Date;
  created_at: Date;
  updated_at: Date;
}): CustomerResponse {
  return {
    id: record.id,
    firstName: record.first_name,
    lastName: record.last_name,
    phone: record.phone,
    address: record.address,
    nationalId: record.national_id,
    licenseNumber: record.license_number,
    licenseExpiryDate: record.license_expiry_date.toISOString(),
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

async function listCustomers(orgId: string): Promise<CustomerResponse[]> {
  const customers = await repo.findByOrg(orgId);
  return customers.map(toResponse);
}

async function getCustomer(customerId: string, orgId: string): Promise<CustomerResponse> {
  const customer = await repo.findById(customerId, orgId);

  if (!customer || customer.deleted_at) {
    throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer not found.");
  }

  return toResponse(customer);
}

async function createCustomer(
  orgId: string,
  input: CreateCustomerInput,
): Promise<CustomerResponse> {
  try {
    const customer = await repo.create(
      {
        first_name: input.first_name,
        last_name: input.last_name,
        phone: input.phone,
        address: input.address,
        national_id: input.national_id,
        license_number: input.license_number,
        license_expiry_date: new Date(input.license_expiry_date),
      },
      orgId,
    );

    return toResponse(customer);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new AppError(409, "DUPLICATE_CUSTOMER", "A customer with this national ID or license number already exists.");
    }
    throw err;
  }
}

async function updateCustomer(
  customerId: string,
  orgId: string,
  input: UpdateCustomerInput,
): Promise<CustomerResponse> {
  const customer = await repo.findById(customerId, orgId);

  if (!customer || customer.deleted_at) {
    throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer not found.");
  }

  try {
    const updated = await repo.update(customerId, {
      first_name: input.first_name,
      last_name: input.last_name,
      phone: input.phone,
      address: input.address,
      national_id: input.national_id,
      license_number: input.license_number,
      license_expiry_date: new Date(input.license_expiry_date),
    });

    return toResponse(updated);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new AppError(409, "DUPLICATE_CUSTOMER", "A customer with this national ID or license number already exists.");
    }
    throw err;
  }
}

async function deleteCustomer(customerId: string, orgId: string): Promise<void> {
  const customer = await repo.findById(customerId, orgId);

  if (!customer || customer.deleted_at) {
    throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer not found.");
  }

  await repo.softDelete(customerId);
}

export { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
