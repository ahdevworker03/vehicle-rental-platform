-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "national_id" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "license_expiry_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_organization_id_idx" ON "Customer"("organization_id");

-- CreateIndex
CREATE INDEX "Customer_deleted_at_idx" ON "Customer"("deleted_at");

-- CreateIndex
CREATE INDEX "Customer_first_name_idx" ON "Customer"("first_name");

-- CreateIndex
CREATE INDEX "Customer_last_name_idx" ON "Customer"("last_name");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_national_id_idx" ON "Customer"("national_id");

-- CreateIndex
CREATE INDEX "Customer_license_number_idx" ON "Customer"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_organization_id_national_id_key" ON "Customer"("organization_id", "national_id");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_organization_id_license_number_key" ON "Customer"("organization_id", "license_number");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
