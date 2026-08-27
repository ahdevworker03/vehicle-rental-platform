-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "address" TEXT,
ADD COLUMN     "contract_footer_text" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "legal_name" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" "OrganizationStatus" NOT NULL DEFAULT 'TRIAL';

-- Existing tenants predate lifecycle statuses and remain operational after deployment.
UPDATE "Organization" SET "status" = 'ACTIVE';
