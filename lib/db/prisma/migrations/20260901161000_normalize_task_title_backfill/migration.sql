UPDATE "Task"
SET "title" = BTRIM("notes")
WHERE "notes" IS NOT NULL
  AND BTRIM("notes") <> ''
  AND "title" = "notes";
