import { Kysely } from 'kysely';

export const up = async (db: Kysely<any>) => {
	await db.schema
		.createTable('link')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('title', 'varchar', (col) => col.notNull())
		.addColumn('link', 'varchar', (col) => col.notNull())
		.execute();
};

export const down = async (db: Kysely<any>) => {
	await db.schema.dropTable('link').execute();
};
