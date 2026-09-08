import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const platformSchema = resolve(
  import.meta.dirname,
  "../api-zod/src/generated/platform/platform.ts",
);
const source = await readFile(platformSchema, "utf8");
const normalized = source.replace(/(?:\r?\n){2,}$/, "\n");

if (normalized !== source) {
  await writeFile(platformSchema, normalized);
}
