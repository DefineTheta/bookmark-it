import { z } from 'zod';

export const collectionSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().optional(),
});

export type Collection = z.TypeOf<typeof collectionSchema>;
