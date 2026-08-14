-- CreateTable
CREATE TABLE "Contract" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "rental_id" UUID NOT NULL,
    "pickup_date" TIMESTAMP(3) NOT NULL,
    "expected_return_date" TIMESTAMP(3) NOT NULL,
    "daily_rate" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "deposit_amount" DECIMAL(10,2) NOT NULL,
    "customer_first_name" TEXT NOT NULL,
    "customer_last_name" TEXT NOT NULL,
    "customer_national_id" TEXT NOT NULL,
    "vehicle_make" TEXT NOT NULL,
    "vehicle_model" TEXT NOT NULL,
    "vehicle_plate_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contract_organization_id_idx" ON "Contract"("organization_id");

-- CreateIndex
CREATE INDEX "Contract_rental_id_idx" ON "Contract"("rental_id");

-- CreateIndex
CREATE INDEX "Contract_deleted_at_idx" ON "Contract"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_rental_id_key" ON "Contract"("rental_id");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_rental_id_fkey" FOREIGN KEY ("rental_id") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
