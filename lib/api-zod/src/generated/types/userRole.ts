export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserRole = {
  PLATFORM_OWNER: "PLATFORM_OWNER",
  OWNER: "OWNER",
  EMPLOYEE: "EMPLOYEE",
} as const;
