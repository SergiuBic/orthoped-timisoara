// Runs before every app start (container entrypoint) and via `pnpm db:migrate` locally.
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

async function main() {
  // Must exist before the first migration: knowledge_chunks.tsv uses unaccent_immutable().
  await sql.unsafe(`
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE EXTENSION IF NOT EXISTS unaccent;
    CREATE OR REPLACE FUNCTION unaccent_immutable(text) RETURNS text
      LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
      AS $$ SELECT public.unaccent('public.unaccent'::regdictionary, $1) $$;
  `);
  await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
  console.log("migrations applied");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
