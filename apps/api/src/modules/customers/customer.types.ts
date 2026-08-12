export interface CustomerRecord {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  national_id: string;
  license_number: string;
  license_expiry_date: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CustomerResponse {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  nationalId: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  national_id: string;
  license_number: string;
  license_expiry_date: string;
}

export interface UpdateCustomerInput {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  national_id: string;
  license_number: string;
  license_expiry_date: string;
}
