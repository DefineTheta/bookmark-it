import { Generated } from 'kysely';

export interface LinkTable {
	id: Generated<number>;
	title: string;
	link: string;
}
