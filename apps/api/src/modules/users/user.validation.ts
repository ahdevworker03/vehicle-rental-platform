import { CreateUserBody, UpdateUserBody } from "@workspace/api-zod";

export const createUserSchema = CreateUserBody;
export const updateUserSchema = UpdateUserBody;

export type CreateUserInput = {
  email: string;
  password: string;
  role: "EMPLOYEE";
};

export type UpdateUserInput = {
  role: "EMPLOYEE";
};
