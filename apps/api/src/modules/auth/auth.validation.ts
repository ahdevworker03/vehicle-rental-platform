import {
  RegisterOrganizationBody,
  LoginBody,
  RefreshTokenBody,
  LogoutBody,
  RequestPasswordResetBody,
  ConfirmPasswordResetBody,
} from "@workspace/api-zod";

export const registerSchema = RegisterOrganizationBody;
export const loginSchema = LoginBody;
export const refreshSchema = RefreshTokenBody;
export const logoutSchema = LogoutBody;
export const requestPasswordResetSchema = RequestPasswordResetBody.transform(
  ({ email }) => ({ email: email.trim().toLowerCase() }),
);
export const confirmPasswordResetSchema = ConfirmPasswordResetBody;

export type RegisterInput = {
  email: string;
  password: string;
  organizationName: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RefreshInput = {
  refreshToken: string;
};

export type LogoutInput = {
  refreshToken: string;
};

export type RequestPasswordResetInput = { email: string };

export type ConfirmPasswordResetInput = {
  token: string;
  password: string;
};
