import type { UserRole } from "./userRole";

export interface CurrentUserResponse {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  createdAt: Date;
}
