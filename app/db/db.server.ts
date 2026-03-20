import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { env } from "~/env.server";
import type { DB } from "./types";

let db: Kysely<DB>;

function getDb() {
  if (!db) {
    db = new Kysely<DB>({
      dialect: new PostgresDialect({
        pool: new pg.Pool({
          connectionString: env().DATABASE_URL,
        }),
      }),
      plugins: [new CamelCasePlugin()],
    });
  }
  return db;
}

export { getDb };
