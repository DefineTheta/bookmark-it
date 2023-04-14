import { z } from 'zod';
import { linkSchema } from './Link';

export const collectionSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().optional(),
	links: linkSchema.array(),
});

export const minifiedCollectionSchema = collectionSchema.omit({
	links: true,
});

export type MinifiedCollection = z.TypeOf<typeof minifiedCollectionSchema>;
export type Collection = z.TypeOf<typeof collectionSchema>;
