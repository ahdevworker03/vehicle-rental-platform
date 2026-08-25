import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../shared";

vi.mock("./customer.repository", () => ({
  findByOrg: vi.fn(),
  searchByOrg: vi.fn(),
}));

import * as repository from "./customer.repository";
import { listCustomers } from "./customer.service";

describe("customer service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a deliberate data-integrity error for an invalid persisted licence date", async () => {
    vi.mocked(repository.findByOrg).mockResolvedValue([
      {
        id: "customer-1",
        organization_id: "organization-1",
        first_name: "Test",
        last_name: "Customer",
        phone: "03000000",
        address: "Beirut",
        national_id: "NID-1",
        license_number: "LIC-1",
        license_expiry_date: new Date("20000-09-30T21:00:00.000Z"),
        created_at: new Date("2030-01-01T00:00:00.000Z"),
        updated_at: new Date("2030-01-01T00:00:00.000Z"),
        deleted_at: null,
      },
    ]);

    await expect(listCustomers("organization-1")).rejects.toMatchObject<
      Partial<AppError>
    >({
      statusCode: 500,
      code: "CUSTOMER_DATA_INTEGRITY_ERROR",
    });
  });
});
