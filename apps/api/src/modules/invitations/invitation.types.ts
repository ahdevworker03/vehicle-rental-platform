export interface CreateEmployeeInvitationInput {
  email: string;
}

export interface AcceptEmployeeInvitationInput {
  token: string;
  password: string;
}

export interface EmployeeInvitationResponse {
  id: string;
  email: string;
  role: "EMPLOYEE";
  expiresAt: string;
  acceptanceToken: string;
  createdAt: string;
}
