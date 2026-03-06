import { tool } from "ai";
import { cloneSVGRegistry, createUniqueSVGSlug, sanitizeSVG, type SVGRegistryMap } from "@/lib/json-ui/svg-registry";
import type { UISpec } from "@/lib/json-ui/types";
import { z } from "zod/v4";
import { pathSchema, specSchema } from "../json-ui/spec-schema";
import {
  assertNotRootPath,
  assertReplacementHasNoConflicts,
  buildSubtreeSpec,
  cloneElement,
  cloneSpec,
  collectDescendantIds,
  ensureCurrentSpec,
  getElement,
  listHierarchy,
  replaceChildId,
  resolvePath,
  setCurrentSpec,
  validateSpec,
} from "../json-ui/spec-utils";

export function createUITools(initialSpec?: UISpec, initialSVGRegistry?: SVGRegistryMap) {
  let currentSpec: UISpec | undefined = initialSpec ? setCurrentSpec(initialSpec) : undefined;
  let currentSVGRegistry: SVGRegistryMap = cloneSVGRegistry(initialSVGRegistry);

  const set_ui = tool({
    description:
      "Set the UI spec to render in the preview panel. " +
      "Provide a complete spec with a root element ID and a flat map of elements. " +
      "Each element has a type (from the catalog), props, and optional children (array of element IDs).",
    inputSchema: specSchema,
    execute: async (input) => {
      currentSpec = setCurrentSpec(input as UISpec);
      return { success: true, spec: currentSpec };
    },
  });

  const get_ui = tool({
    description:
      "Read the current UI. Without a path it returns the full UI spec. " +
      'With a path like "root.section-1", it returns that specific element and optionally its child subtree.',
    inputSchema: z.object({
      path: pathSchema.optional(),
      children: z.boolean().optional().default(false),
    }),
    execute: async ({ path, children }) => {
      const spec = ensureCurrentSpec(currentSpec);

      if (!path) {
        return { spec: cloneSpec(spec) };
      }

      const resolved = resolvePath(spec, path);
      if (children) {
        return {
          path,
          id: resolved.targetId,
          element: cloneElement(resolved.target),
          spec: buildSubtreeSpec(spec, resolved.targetId),
        };
      }

      return {
        path,
        id: resolved.targetId,
        element: cloneElement(resolved.target),
      };
    },
  });

  const list_ui = tool({
    description:
      'List the UI hierarchy at a path like "root" or "root.section-1". ' +
      "Returns a simplified structure with IDs, types, paths, and child relationships.",
    inputSchema: z.object({
      path: pathSchema,
    }),
    execute: async ({ path }) => {
      const spec = ensureCurrentSpec(currentSpec);
      const resolved = resolvePath(spec, path);

      return {
        path,
        rootId: resolved.targetId,
        items: listHierarchy(spec, resolved.targetId, path),
      };
    },
  });

  const delete_element = tool({
    description:
      'Delete the UI element at a path like "root.section-1" along with all of its descendants. ' +
      "This updates the previewed UI immediately.",
    inputSchema: z.object({
      path: pathSchema,
    }),
    execute: async ({ path }) => {
      const spec = ensureCurrentSpec(currentSpec);
      const resolved = resolvePath(spec, path);
      assertNotRootPath(resolved, "delete");

      const deletedIds = [...collectDescendantIds(spec, resolved.targetId)];
      const nextSpec = cloneSpec(spec);

      const parent = getElement(nextSpec, resolved.parentId!);
      parent.children = (parent.children ?? []).filter((childId) => childId !== resolved.targetId);

      for (const id of deletedIds) {
        delete nextSpec.elements[id];
      }

      currentSpec = setCurrentSpec(nextSpec);

      return {
        success: true,
        path,
        deletedIds,
        spec: currentSpec,
      };
    },
  });

  const replace_element = tool({
    description:
      'Replace the UI element at a path like "root.section-1" with a new subtree. ' +
      "Provide a replacement spec containing a root ID and a flat elements map for the new subtree.",
    inputSchema: z.object({
      path: pathSchema,
      replacement: specSchema,
    }),
    execute: async ({ path, replacement }) => {
      const spec = ensureCurrentSpec(currentSpec);
      const resolved = resolvePath(spec, path);
      assertNotRootPath(resolved, "replace");

      const replacementSpec = validateSpec(replacement as UISpec);
      const removedIds = collectDescendantIds(spec, resolved.targetId);
      assertReplacementHasNoConflicts(spec, replacementSpec, removedIds);

      const nextSpec = cloneSpec(spec);
      const parent = getElement(nextSpec, resolved.parentId!);
      parent.children = replaceChildId(parent.children ?? [], resolved.targetId, replacementSpec.root);

      for (const id of removedIds) {
        delete nextSpec.elements[id];
      }

      for (const [id, element] of Object.entries(replacementSpec.elements)) {
        nextSpec.elements[id] = cloneElement(element);
      }

      currentSpec = setCurrentSpec(nextSpec);

      return {
        success: true,
        path,
        replacedId: resolved.targetId,
        replacementRootId: replacementSpec.root,
        spec: currentSpec,
      };
    },
  });

  const edit_element = tool({
    description:
      'Edit only the props of a UI element at a path like "root.section-1". ' +
      "This cannot change the element type or replace its children.",
    inputSchema: z.object({
      path: pathSchema,
      props: z.record(z.string(), z.unknown()),
    }),
    execute: async ({ path, props }) => {
      const spec = ensureCurrentSpec(currentSpec);
      const resolved = resolvePath(spec, path);
      const nextSpec = cloneSpec(spec);
      const target = getElement(nextSpec, resolved.targetId);

      target.props = {
        ...(target.props ?? {}),
        ...props,
      };

      currentSpec = setCurrentSpec(nextSpec);

      return {
        success: true,
        path,
        id: resolved.targetId,
        type: target.type,
        props: target.props ?? {},
        spec: currentSpec,
      };
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

  const create_svg = tool({
    description:
      "Create a reusable sanitized SVG asset for the preview. " +
      "Pass a name slug and a full SVG string, then reuse the returned slug in logoSvgRef or imageSvgRef props.",
    inputSchema: z.object({
      nameSlug: z
        .string()
        .min(1)
        .max(80)
        .describe("Short kebab-case name for the SVG asset, for example 'nova-logo' or 'hero-dashboard-illustration'."),
      svg: z.string().min(1).describe("Full inline SVG markup starting with <svg> and ending with </svg>."),
    }),
    execute: async ({ nameSlug, svg }) => {
      const sanitizedSVG = sanitizeSVG(svg);
      const slug = createUniqueSVGSlug(currentSVGRegistry, nameSlug, sanitizedSVG);

      currentSVGRegistry = {
        ...currentSVGRegistry,
        [slug]: sanitizedSVG,
      };

      return {
        success: true,
        slug,
        svg: sanitizedSVG,
        registry: cloneSVGRegistry(currentSVGRegistry),
      };
    },
  });

  return { set_ui, get_ui, list_ui, delete_element, replace_element, edit_element, clear_ui, create_svg };
}
