import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __vexoPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });
}

export function getPool(): Pool {
  if (!global.__vexoPool) {
    global.__vexoPool = createPool();
  }
  return global.__vexoPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  return getPool().query<T>(text, params);
}
