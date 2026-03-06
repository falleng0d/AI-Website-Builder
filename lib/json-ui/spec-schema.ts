import { z } from "zod/v4";

export const elementSchema = z.object({
  type: z.string(),
  props: z.record(z.string(), z.unknown()).optional(),
  children: z.array(z.string()).optional(),
});

export const specSchema = z.object({
  root: z.string().describe("ID of the root element"),
  elements: z.record(z.string(), elementSchema).describe("Map of element IDs to element definitions"),
});

export const pathSchema = z
  .string()
  .min(1)
  .describe('Element path using dot notation, for example "root" or "root.section-1.card-2".');
