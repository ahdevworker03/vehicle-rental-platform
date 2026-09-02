ALTER TABLE "Task" ADD COLUMN "title" TEXT;

UPDATE "Task"
SET "title" = CASE
  WHEN "notes" IS NOT NULL AND BTRIM("notes") <> '' THEN "notes"
  ELSE 'مهمة بدون عنوان'
END;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Task"
    WHERE "title" IS NULL OR BTRIM("title") = ''
  ) THEN
    RAISE EXCEPTION 'Task title backfill left invalid values';
  END IF;
END $$;

ALTER TABLE "Task" ALTER COLUMN "title" SET NOT NULL;
