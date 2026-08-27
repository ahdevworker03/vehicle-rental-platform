import {
  AcceptEmployeeInvitationBody,
  CreateEmployeeInvitationBody,
} from "@workspace/api-zod";

export const createEmployeeInvitationSchema =
  CreateEmployeeInvitationBody.transform(({ email }) => ({
    email: email.trim().toLowerCase(),
  }));

export const acceptEmployeeInvitationSchema = AcceptEmployeeInvitationBody;
