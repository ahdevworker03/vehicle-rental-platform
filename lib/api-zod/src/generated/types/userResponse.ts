import type { UserRole } from "./userRole";

export interface UserResponse {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
