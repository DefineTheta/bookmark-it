import { z } from 'zod';

export const is =
	<T extends z.ZodTypeAny>(schema: T) =>
	(value: unknown): value is z.infer<T> => {
		const result = schema.safeParse(value);

		return result.success;
	};
