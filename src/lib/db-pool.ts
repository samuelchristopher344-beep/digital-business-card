import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();

let pool: Pool | null = null;

export function getPool(): Pool | null {
  if (!databaseUrl) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      max: 5,
      ssl:
        databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")
          ? undefined
          : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export function hasDatabase(): boolean {
  return Boolean(databaseUrl);
}
