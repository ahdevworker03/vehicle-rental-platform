-- CreateEnum
CREATE TYPE "MaintenanceScheduleType" AS ENUM ('DATE', 'MILEAGE', 'DATE_OR_MILEAGE');

-- CreateTable
CREATE TABLE "MaintenanceSchedule" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "maintenance_type" "MaintenanceType" NOT NULL,
    "schedule_type" "MaintenanceScheduleType" NOT NULL,
    "date_interval_days" INTEGER,
    "next_due_date" DATE,
    "mileage_interval" INTEGER,
    "next_due_mileage" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "MaintenanceSchedule_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MaintenanceSchedule_schedule_basis_check" CHECK (
      (
        "schedule_type" = 'DATE'
        AND "date_interval_days" > 0
        AND "next_due_date" IS NOT NULL
        AND "mileage_interval" IS NULL
        AND "next_due_mileage" IS NULL
      )
      OR (
        "schedule_type" = 'MILEAGE'
        AND "date_interval_days" IS NULL
        AND "next_due_date" IS NULL
        AND "mileage_interval" > 0
        AND "next_due_mileage" >= 0
      )
      OR (
        "schedule_type" = 'DATE_OR_MILEAGE'
        AND "date_interval_days" > 0
        AND "next_due_date" IS NOT NULL
        AND "mileage_interval" > 0
        AND "next_due_mileage" >= 0
      )
    )
);

-- CreateIndex
CREATE INDEX "MaintenanceSchedule_organization_id_idx" ON "MaintenanceSchedule"("organization_id");

-- CreateIndex
CREATE INDEX "MaintenanceSchedule_vehicle_id_idx" ON "MaintenanceSchedule"("vehicle_id");

-- CreateIndex
CREATE INDEX "MaintenanceSchedule_deleted_at_idx" ON "MaintenanceSchedule"("deleted_at");

-- CreateIndex
CREATE INDEX "MaintenanceSchedule_is_active_idx" ON "MaintenanceSchedule"("is_active");

-- CreateIndex
CREATE INDEX "MaintenanceSchedule_next_due_date_idx" ON "MaintenanceSchedule"("next_due_date");

-- CreateIndex
CREATE INDEX "MaintenanceSchedule_next_due_mileage_idx" ON "MaintenanceSchedule"("next_due_mileage");

-- AddForeignKey
ALTER TABLE "MaintenanceSchedule" ADD CONSTRAINT "MaintenanceSchedule_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSchedule" ADD CONSTRAINT "MaintenanceSchedule_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
