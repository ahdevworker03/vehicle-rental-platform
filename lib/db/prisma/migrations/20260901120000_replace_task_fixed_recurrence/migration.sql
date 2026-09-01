DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Task" child
    JOIN "Task" parent ON parent."id" = child."predecessor_id"
    WHERE child."organization_id" <> parent."organization_id"
  ) THEN
    RAISE EXCEPTION 'Cannot migrate task recurrence: cross-organization predecessor link found';
  END IF;

  IF EXISTS (SELECT 1 FROM "Task" WHERE "predecessor_id" = "id") THEN
    RAISE EXCEPTION 'Cannot migrate task recurrence: self-referencing predecessor found';
  END IF;
END $$;

CREATE TYPE "TaskRecurrenceUnit" AS ENUM ('DAY', 'WEEK', 'MONTH');

ALTER TABLE "Task"
  ADD COLUMN "recurrence_interval" INTEGER,
  ADD COLUMN "recurrence_unit" "TaskRecurrenceUnit",
  ADD COLUMN "recurrence_end_date" DATE,
  ADD COLUMN "recurrence_end_count" INTEGER,
  ADD COLUMN "occurrence_number" INTEGER;

UPDATE "Task"
SET
  "recurrence_interval" = CASE "recurrence_type"
    WHEN 'DAILY' THEN 1
    WHEN 'WEEKLY' THEN 1
    WHEN 'MONTHLY' THEN 1
    ELSE NULL
  END,
  "recurrence_unit" = CASE "recurrence_type"
    WHEN 'DAILY' THEN 'DAY'::"TaskRecurrenceUnit"
    WHEN 'WEEKLY' THEN 'WEEK'::"TaskRecurrenceUnit"
    WHEN 'MONTHLY' THEN 'MONTH'::"TaskRecurrenceUnit"
    ELSE NULL
  END;

WITH RECURSIVE numbered AS (
  SELECT id, 1 AS occurrence_number, ARRAY[id] AS path
  FROM "Task"
  WHERE "predecessor_id" IS NULL

  UNION ALL

  SELECT child.id, parent.occurrence_number + 1, parent.path || child.id
  FROM "Task" child
  JOIN numbered parent ON child."predecessor_id" = parent.id
  WHERE NOT child.id = ANY(parent.path)
)
UPDATE "Task"
SET "occurrence_number" = numbered.occurrence_number
FROM numbered
WHERE "Task"."id" = numbered.id;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Task" WHERE "occurrence_number" IS NULL) THEN
    RAISE EXCEPTION 'Cannot migrate task recurrence: cyclic or rootless predecessor chain found';
  END IF;
END $$;

ALTER TABLE "Task"
  ALTER COLUMN "occurrence_number" SET DEFAULT 1,
  ALTER COLUMN "occurrence_number" SET NOT NULL,
  ADD CONSTRAINT "Task_recurrence_pair_check" CHECK (
    ("recurrence_interval" IS NULL AND "recurrence_unit" IS NULL)
    OR ("recurrence_interval" IS NOT NULL AND "recurrence_unit" IS NOT NULL)
  ),
  ADD CONSTRAINT "Task_recurrence_interval_positive_check" CHECK (
    "recurrence_interval" IS NULL OR "recurrence_interval" > 0
  ),
  ADD CONSTRAINT "Task_recurrence_end_count_positive_check" CHECK (
    "recurrence_end_count" IS NULL OR "recurrence_end_count" > 0
  ),
  ADD CONSTRAINT "Task_recurrence_end_exclusive_check" CHECK (
    "recurrence_end_date" IS NULL OR "recurrence_end_count" IS NULL
  ),
  ADD CONSTRAINT "Task_recurrence_end_requires_recurrence_check" CHECK (
    ("recurrence_end_date" IS NULL AND "recurrence_end_count" IS NULL)
    OR "recurrence_interval" IS NOT NULL
  ),
  ADD CONSTRAINT "Task_occurrence_number_positive_check" CHECK (
    "occurrence_number" > 0
  );

ALTER TABLE "Task" DROP COLUMN "recurrence_type";
DROP TYPE "TaskRecurrenceType";
