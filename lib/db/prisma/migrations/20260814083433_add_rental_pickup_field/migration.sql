-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "actual_pickup_date" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Rental_vehicle_id_pickup_date_expected_return_date_idx" ON "Rental"("vehicle_id", "pickup_date", "expected_return_date");
