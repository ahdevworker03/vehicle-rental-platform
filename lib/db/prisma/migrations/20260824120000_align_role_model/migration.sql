-- Replace the legacy tenant-manager role with the approved role model.
ALTER TYPE "Role" RENAME TO "Role_old";

CREATE TYPE "Role" AS ENUM ('PLATFORM_OWNER', 'OWNER', 'EMPLOYEE');

ALTER TABLE "User"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE "Role"
  USING (
    CASE "role"::text
      WHEN 'MANAGER' THEN 'EMPLOYEE'
      ELSE "role"::text
    END
  )::"Role",
  ALTER COLUMN "role" SET DEFAULT 'OWNER';

DROP TYPE "Role_old";
