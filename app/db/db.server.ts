import { neon } from "@neondatabase/serverless";
import { CamelCasePlugin, Kysely } from "kysely";
import { NeonDialect } from "kysely-neon";
import { env } from "~/env.server";
import type { DB } from "./types";

let db: Kysely<DB>;

function getDb() {
  if (!db) {
    db = new Kysely<DB>({
      dialect: new NeonDialect({
        neon: neon(env().DATABASE_URL),
      }),
      plugins: [new CamelCasePlugin()],
    });
  }
  return db;
}

export { getDb };
