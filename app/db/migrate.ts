import fs, { promises } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { Migration, MigrationProvider } from "kysely";
import { Migrator } from "kysely";
import { getDb } from "./db.server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsFolder = path.join(__dirname, "migrations");

const MIGRATION_TEMPLATE = `import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
}

export async function down(db: Kysely<any>): Promise<void> {
}
`;

class FileMigrationProvider implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const files = await promises.readdir(migrationsFolder);

    for (const fileName of files) {
      if (
        fileName.endsWith(".js") ||
        (fileName.endsWith(".ts") && !fileName.endsWith(".d.ts")) ||
        fileName.endsWith(".mjs") ||
        (fileName.endsWith(".mts") && !fileName.endsWith(".d.mts"))
      ) {
        const migration = await import(
          /* @vite-ignore */
          path.join(migrationsFolder, fileName)
        );
        const migrationKey = fileName.substring(0, fileName.lastIndexOf("."));

        if (isMigration(migration?.default)) {
          migrations[migrationKey] = migration.default;
        } else if (isMigration(migration)) {
          migrations[migrationKey] = migration;
        }
      }
    }

    return migrations;
  }
}

function isMigration(obj: unknown): obj is Migration {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).up === "function"
  );
}

function createMigrator() {
  return new Migrator({
    allowUnorderedMigrations: true,
    db: getDb(),
    provider: new FileMigrationProvider(),
  });
}

export async function migrateToLatest() {
  const migrator = createMigrator();
  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`Migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`Failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("Failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await getDb().destroy();
}

export async function migrateDown() {
  const migrator = createMigrator();
  const { error, results } = await migrator.migrateDown();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`Rollback "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`Failed to rollback "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("Failed to rollback");
    console.error(error);
    process.exit(1);
  }

  await getDb().destroy();
}

export function createMigration(migrationName: string) {
  if (!migrationName) {
    console.error(
      "You must name this migration: pnpm run db:migration the name for your migration",
    );
    process.exit(1);
  }

  const dateStr = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
  const fileName = `${migrationsFolder}/${dateStr}-${migrationName}.ts`;

  try {
    if (!fs.lstatSync(migrationsFolder).isDirectory()) {
      fs.mkdirSync(migrationsFolder);
    }
  } catch {
    fs.mkdirSync(migrationsFolder);
  }

  fs.writeFileSync(fileName, MIGRATION_TEMPLATE, "utf8");
  console.log("Created Migration:", fileName);
}
