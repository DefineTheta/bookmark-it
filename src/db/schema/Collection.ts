import { Generated } from 'kysely';

export interface CollectionTable {
	id: Generated<number>;
	name: string;
	description?: string;
}
