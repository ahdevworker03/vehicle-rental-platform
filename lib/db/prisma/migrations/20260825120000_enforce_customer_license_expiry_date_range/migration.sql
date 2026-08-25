-- Repair the confirmed invalid development customer value before enforcing the
-- approved supported licence-expiry range for all customer records.
UPDATE "Customer"
SET "license_expiry_date" = TIMESTAMP '2030-09-30 00:00:00'
WHERE "id" = 'f18d300f-67f0-4a70-b2b0-efde1aceecd7'
  AND "license_expiry_date" = TIMESTAMP '20000-09-30 21:00:00';

ALTER TABLE "Customer"
ADD CONSTRAINT "Customer_license_expiry_date_range_check"
CHECK (
  "license_expiry_date" >= TIMESTAMP '1900-01-01 00:00:00'
  AND "license_expiry_date" <= TIMESTAMP '2100-12-31 23:59:59.999'
);
