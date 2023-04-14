import { CollectionTable } from './Collection';
import { CollectionLinksTable } from './CollectionLinks';
import { LinkTable } from './Link';

export interface Database {
	link: LinkTable;
	collection: CollectionTable;
	collection_links: CollectionLinksTable;
}
