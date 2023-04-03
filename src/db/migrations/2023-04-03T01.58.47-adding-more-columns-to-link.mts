import { Kysely } from 'kysely';

export const up = async (db: Kysely<any>) => {
	await db.schema
		.alterTable('link')
		.addColumn('description', 'varchar', (col) => col.notNull())
		.addColumn('image', 'varchar', (col) => col.notNull())
		.addColumn('icon', 'varchar', (col) => col.notNull())
		.execute();
};

export const down = async (db: Kysely<any>) => {
	await db.schema
		.alterTable('link')
		.dropColumn('description')
		.dropColumn('image')
		.dropColumn('icon')
		.execute();
};
