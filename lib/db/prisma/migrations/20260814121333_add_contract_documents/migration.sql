-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "contract_id" UUID;

-- CreateIndex
CREATE INDEX "Document_contract_id_idx" ON "Document"("contract_id");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
