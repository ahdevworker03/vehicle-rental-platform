-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('REGISTRATION', 'INSURANCE', 'OTHER');

-- CreateTable
CREATE TABLE "Document" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "category" "DocumentCategory" NOT NULL DEFAULT 'OTHER',
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT,
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_storage_key_key" ON "Document"("storage_key");

-- CreateIndex
CREATE INDEX "Document_organization_id_idx" ON "Document"("organization_id");

-- CreateIndex
CREATE INDEX "Document_vehicle_id_idx" ON "Document"("vehicle_id");

-- CreateIndex
CREATE INDEX "Document_category_idx" ON "Document"("category");

-- CreateIndex
CREATE INDEX "Document_deleted_at_idx" ON "Document"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_storage_key_key" ON "Photo"("storage_key");

-- CreateIndex
CREATE INDEX "Photo_organization_id_idx" ON "Photo"("organization_id");

-- CreateIndex
CREATE INDEX "Photo_vehicle_id_idx" ON "Photo"("vehicle_id");

-- CreateIndex
CREATE INDEX "Photo_vehicle_id_sort_order_idx" ON "Photo"("vehicle_id", "sort_order");

-- CreateIndex
CREATE INDEX "Photo_deleted_at_idx" ON "Photo"("deleted_at");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
