import { CollectionTable } from './Collection';
import { LinkTable } from './Link';

export interface Database {
	link: LinkTable;
	collection: CollectionTable;
}
