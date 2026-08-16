-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVE_SERVICE', 'INSPECTION', 'REPAIR', 'OTHER');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "maintenance_date" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "cost" DECIMAL(10,2),
    "vendor" TEXT,
    "notes" TEXT,
    "replaced_parts" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Maintenance_organization_id_idx" ON "Maintenance"("organization_id");

-- CreateIndex
CREATE INDEX "Maintenance_vehicle_id_idx" ON "Maintenance"("vehicle_id");

-- CreateIndex
CREATE INDEX "Maintenance_deleted_at_idx" ON "Maintenance"("deleted_at");

-- CreateIndex
CREATE INDEX "Maintenance_status_idx" ON "Maintenance"("status");

-- CreateIndex
CREATE INDEX "Maintenance_maintenance_date_idx" ON "Maintenance"("maintenance_date");

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
