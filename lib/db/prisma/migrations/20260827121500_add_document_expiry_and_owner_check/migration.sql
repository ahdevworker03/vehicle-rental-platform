ALTER TABLE "Document" ADD COLUMN "expiry_date" DATE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Document"
    WHERE (CASE WHEN "vehicle_id" IS NOT NULL THEN 1 ELSE 0 END
         + CASE WHEN "customer_id" IS NOT NULL THEN 1 ELSE 0 END
         + CASE WHEN "contract_id" IS NOT NULL THEN 1 ELSE 0 END) <> 1
  ) THEN
    RAISE EXCEPTION 'Document ownership invariant failed: every row must reference exactly one vehicle, customer, or contract';
  END IF;
END $$;

ALTER TABLE "Document"
  ADD CONSTRAINT "Document_exactly_one_owner_check"
  CHECK ((CASE WHEN "vehicle_id" IS NOT NULL THEN 1 ELSE 0 END
       + CASE WHEN "customer_id" IS NOT NULL THEN 1 ELSE 0 END
       + CASE WHEN "contract_id" IS NOT NULL THEN 1 ELSE 0 END) = 1);

ALTER TABLE "Document"
  ADD CONSTRAINT "Document_expiry_date_range_check"
  CHECK ("expiry_date" IS NULL OR "expiry_date" BETWEEN DATE '1900-01-01' AND DATE '2100-12-31');

CREATE INDEX "Document_expiry_date_idx" ON "Document"("expiry_date");
