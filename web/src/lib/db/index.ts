import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };

const client =
  globalForDb.pg ??
  postgres(process.env.DATABASE_URL ?? "postgres://ortoped:ortoped@localhost:5432/ortoped", {
    max: Number(process.env.DB_POOL_MAX ?? 10),
    idle_timeout: 30,
    connect_timeout: 5,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pg = client;

export const db = drizzle(client, { schema });
export { schema };
