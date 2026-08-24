export type CreateUserRequestRole =
  (typeof CreateUserRequestRole)[keyof typeof CreateUserRequestRole];

export const CreateUserRequestRole = {
  EMPLOYEE: "EMPLOYEE",
} as const;
