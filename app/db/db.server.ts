import { neon } from "@neondatabase/serverless";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { NeonDialect } from "kysely-neon";
import pg from "pg";
import { env } from "~/env.server";
import type { DB } from "./types";

let db: Kysely<DB>;

function isLocalUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function getDb() {
  if (!db) {
    const url = env().DATABASE_URL;
    db = new Kysely<DB>({
      dialect: isLocalUrl(url)
        ? new PostgresDialect({ pool: new pg.Pool({ connectionString: url }) })
        : new NeonDialect({ neon: neon(url) }),
      plugins: [new CamelCasePlugin()],
    });
  }
  return db;
}

export { getDb };
