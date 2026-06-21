import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../schema';

const { Pool } = pg;

let _db: NodePgDatabase<typeof schema> | null = null;
let _pool: pg.Pool | null = null;

export function getDatabaseContext(): NodePgDatabase<typeof schema> {
  if (!_db) {
    const connectionString = process.env['DATABASE_URL'];
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    _pool = new Pool({ connectionString, max: 20, idleTimeoutMillis: 30000 });
    _db = drizzle(_pool, { schema });
  }
  return _db;
}

export async function closeDatabaseContext(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
    _db = null;
  }
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    return (getDatabaseContext() as any)[prop];
  },
});
