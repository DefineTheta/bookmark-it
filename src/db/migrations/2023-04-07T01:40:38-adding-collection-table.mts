import { Kysely } from 'kysely';

export const up = async (db: Kysely<any>) => {
	await db.schema
		.createTable('collection')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('name', 'varchar', (col) => col.notNull())
		.addColumn('description', 'varchar')
		.execute();

	await db.schema
		.createTable('collection_links')
		.addColumn('collection_id', 'integer', (col) => col.references('collection.id'))
		.addColumn('link_id', 'integer', (col) => col.references('link.id'))
		.addPrimaryKeyConstraint('collection_links_pk', ['collection_id', 'link_id'])
		.execute();
};

export const down = async (db: Kysely<any>) => {
	await db.schema.dropTable('collection').execute();
	await db.schema.dropTable('collection_links').execute();
};
