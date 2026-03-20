import { createMigration } from "../migrate";

const [, , ...names] = process.argv;
const migrationName = names
  .join(" ")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

createMigration(migrationName);
