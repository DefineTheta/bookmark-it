import { z } from 'zod';

export const linkSchema = z.object({
	id: z.number(),
	title: z.string(),
	link: z.string(),
});

export type Link = z.TypeOf<typeof linkSchema>;
