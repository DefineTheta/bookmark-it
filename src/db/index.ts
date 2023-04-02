import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from './schema/Database';

const globalDb = global as typeof globalThis & {
	db: Kysely<Database>;
};

export const db =
	globalDb.db ||
	new Kysely<Database>({
		dialect: new PostgresDialect({
			pool: new Pool({
				host: process.env.DB_HOST,
				database: process.env.DB_DATABASE,
				user: process.env.DB_USER,
				password: process.env.DB_PASSWORD,
				port: Number(process.env.DB_PORT || 0),
			}),
		}),
	});

if (process.env.NODE_ENV !== 'production') globalDb.db = db;
