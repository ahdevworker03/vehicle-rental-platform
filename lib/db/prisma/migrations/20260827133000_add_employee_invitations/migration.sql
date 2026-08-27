CREATE TABLE "EmployeeInvitation" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_by_user_id" UUID NOT NULL,
    "accepted_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeInvitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmployeeInvitation_token_hash_key" ON "EmployeeInvitation"("token_hash");
CREATE UNIQUE INDEX "EmployeeInvitation_accepted_user_id_key" ON "EmployeeInvitation"("accepted_user_id");
CREATE UNIQUE INDEX "EmployeeInvitation_organization_id_email_key" ON "EmployeeInvitation"("organization_id", "email");
CREATE INDEX "EmployeeInvitation_organization_id_expires_at_idx" ON "EmployeeInvitation"("organization_id", "expires_at");
CREATE INDEX "EmployeeInvitation_accepted_at_idx" ON "EmployeeInvitation"("accepted_at");

ALTER TABLE "EmployeeInvitation" ADD CONSTRAINT "EmployeeInvitation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeeInvitation" ADD CONSTRAINT "EmployeeInvitation_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeeInvitation" ADD CONSTRAINT "EmployeeInvitation_accepted_user_id_fkey" FOREIGN KEY ("accepted_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
