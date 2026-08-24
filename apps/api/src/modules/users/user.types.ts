export type UserRole = "PLATFORM_OWNER" | "OWNER" | "EMPLOYEE";

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  organization_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface UserResponse {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role: "EMPLOYEE";
}

export interface UpdateUserInput {
  role: "EMPLOYEE";
}
