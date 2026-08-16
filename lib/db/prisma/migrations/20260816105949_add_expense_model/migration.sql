-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('FUEL', 'INSURANCE', 'REGISTRATION', 'CLEANING', 'OTHER');

-- CreateTable
CREATE TABLE "Expense" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "vehicle_id" UUID,
    "expense_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Expense_organization_id_idx" ON "Expense"("organization_id");

-- CreateIndex
CREATE INDEX "Expense_vehicle_id_idx" ON "Expense"("vehicle_id");

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateIndex
CREATE INDEX "Expense_deleted_at_idx" ON "Expense"("deleted_at");

-- CreateIndex
CREATE INDEX "Expense_expense_date_idx" ON "Expense"("expense_date");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
