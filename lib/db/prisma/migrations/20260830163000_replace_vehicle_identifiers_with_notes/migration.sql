ALTER TABLE "Vehicle" ADD COLUMN "notes" TEXT;

UPDATE "Vehicle"
SET "notes" = NULLIF(
  CONCAT_WS(
    E'\n',
    CASE
      WHEN NULLIF(BTRIM("vin"), '') IS NOT NULL THEN 'VIN: ' || "vin"
    END,
    CASE
      WHEN NULLIF(BTRIM("engine_number"), '') IS NOT NULL THEN 'Engine number: ' || "engine_number"
    END
  ),
  ''
);

ALTER TABLE "Vehicle"
  DROP COLUMN "vin",
  DROP COLUMN "engine_number";
