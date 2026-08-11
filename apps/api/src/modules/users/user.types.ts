export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  role: "OWNER" | "MANAGER" | "EMPLOYEE";
  organization_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role: "MANAGER" | "EMPLOYEE";
}

export interface UpdateUserInput {
  role: "MANAGER" | "EMPLOYEE";
}
