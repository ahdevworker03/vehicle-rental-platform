-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_vehicle_id_fkey";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "customer_id" UUID,
ALTER COLUMN "vehicle_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Document_customer_id_idx" ON "Document"("customer_id");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
