import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from 'kysely';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

dotenv.config();
const { Pool } = pg;

const run = async () => {
	const db = new Kysely({
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

	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({
			fs,
			path,
			migrationFolder: path.join(path.dirname(__filename), 'migrations'),
		}),
	});

	const { error, results } = await migrator.migrateDown();

	results?.forEach((it) => {
		if (it.status === 'Success') {
			console.log(`migration "${it.migrationName}" was executed successfully`);
		} else if (it.status === 'Error') {
			console.error(`failed to execute migration "${it.migrationName}"`);
		}
	});

	if (error) {
		console.error('failed to migrate');
		console.error(error);
		process.exit(1);
	}

	await db.destroy();
};

await run();
