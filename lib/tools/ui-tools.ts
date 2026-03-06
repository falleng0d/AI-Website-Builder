import { tool } from "ai";
import { z } from "zod/v4";
import type { UISpec } from "@/lib/json-ui/types";

const elementSchema = z.object({
  type: z.string(),
  props: z.record(z.string(), z.unknown()).optional(),
  children: z.array(z.string()).optional(),
});

const specSchema = z.object({
  root: z.string().describe("ID of the root element"),
  elements: z.record(z.string(), elementSchema).describe("Map of element IDs to element definitions"),
});

export function createUITools(initialSpec?: UISpec) {
  let currentSpec: UISpec | undefined = initialSpec;

  const set_ui = tool({
    description:
      "Set the UI spec to render in the preview panel. " +
      "Provide a complete spec with a root element ID and a flat map of elements. " +
      "Each element has a type (from the catalog), props, and optional children (array of element IDs).",
    inputSchema: specSchema,
    execute: async (input) => {
      currentSpec = input as UISpec;
      return { success: true, spec: currentSpec };
    },
  });

  const get_ui = tool({
    description: "Get the current UI spec displayed in the preview panel.",
    inputSchema: z.object({}),
    execute: async () => {
      return { spec: currentSpec ?? null };
    },
  });

  const clear_ui = tool({
    description: "Clear the preview panel, removing all generated UI.",
    inputSchema: z.object({}),
    execute: async () => {
      currentSpec = undefined;
      return { success: true };
    },
  });

  return { set_ui, get_ui, clear_ui };
}
