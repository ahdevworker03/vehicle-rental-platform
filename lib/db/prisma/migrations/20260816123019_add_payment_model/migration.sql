-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'OTHER');

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "rental_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payment_organization_id_idx" ON "Payment"("organization_id");

-- CreateIndex
CREATE INDEX "Payment_rental_id_idx" ON "Payment"("rental_id");

-- CreateIndex
CREATE INDEX "Payment_deleted_at_idx" ON "Payment"("deleted_at");

-- CreateIndex
CREATE INDEX "Payment_payment_date_idx" ON "Payment"("payment_date");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rental_id_fkey" FOREIGN KEY ("rental_id") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
