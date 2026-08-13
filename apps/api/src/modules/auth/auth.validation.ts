import {
  RegisterOrganizationBody,
  LoginBody,
  RefreshTokenBody,
  LogoutBody,
} from "@workspace/api-zod";

export const registerSchema = RegisterOrganizationBody;
export const loginSchema = LoginBody;
export const refreshSchema = RefreshTokenBody;
export const logoutSchema = LogoutBody;

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
