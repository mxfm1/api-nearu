import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import { config } from '../config';

console.log("URL USED", config.databaseUrl);

const pool = new pg.Pool({ connectionString: config.databaseUrl });
export const db = drizzle(pool, { schema, prepare: false });
