import { z } from "zod";

export const ModelsListSchema = z.object({
  object: z.literal('list'),
  total: z.number().int().nonnegative(),
  data: z.array(
    z.object({
      id: z.string().min(1),
    })
  ),
});

export type ModelsList = z.infer<typeof ModelsListSchema>;
