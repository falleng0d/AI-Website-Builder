import { tool } from "ai";
import { cloneSVGRegistry, createUniqueSVGSlug, sanitizeSVG, type SVGRegistryMap } from "@/lib/json-ui/svg-registry";
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

const pathSchema = z
  .string()
  .min(1)
  .describe('Element path using dot notation, for example "root" or "root.section-1.card-2".');

type UIElementDefinition = UISpec["elements"][string];

type ResolvedPath = {
  path: string;
  targetId: string;
  target: UIElementDefinition;
  parentId?: string;
  parent?: UIElementDefinition;
};

type UIHierarchyItem = {
  id: string;
  type: string;
  depth: number;
  path: string;
  children: string[];
};

function cloneElement(element: UIElementDefinition): UIElementDefinition {
  return {
    ...element,
    props: { ...(element.props ?? {}) },
    children: [...(element.children ?? [])],
  };
}

function cloneSpec(spec: UISpec): UISpec {
  return {
    root: spec.root,
    elements: Object.fromEntries(Object.entries(spec.elements).map(([id, element]) => [id, cloneElement(element)])),
  };
}

function ensureCurrentSpec(spec: UISpec | undefined): UISpec {
  if (!spec) throw new Error("No UI is currently set in the preview.");
  return spec;
}

function getElement(spec: UISpec, id: string): UIElementDefinition {
  const element = spec.elements[id];
  if (!element) throw new Error(`Element "${id}" does not exist in the UI spec.`);
  return element;
}

function validateSpec(spec: UISpec): UISpec {
  if (!spec.root.trim()) throw new Error("UI spec root must not be empty.");
  if (!spec.elements[spec.root]) throw new Error(`UI spec root "${spec.root}" is missing from elements.`);

  for (const [id, element] of Object.entries(spec.elements)) {
    for (const childId of element.children ?? []) {
      if (!spec.elements[childId]) {
        throw new Error(`Element "${id}" references missing child "${childId}".`);
      }
    }
  }

  return spec;
}

function resolvePath(spec: UISpec, path: string): ResolvedPath {
  const segments = path.split(".").filter(Boolean);
  if (segments.length === 0 || segments[0] !== "root") {
    throw new Error(`Invalid UI path "${path}". Paths must start with "root".`);
  }

  let currentId = spec.root;
  let parentId: string | undefined;

  for (const segment of segments.slice(1)) {
    const parent = getElement(spec, currentId);
    if (!(parent.children ?? []).includes(segment)) {
      throw new Error(`Invalid UI path "${path}". "${segment}" is not a child of "${currentId}".`);
    }

    parentId = currentId;
    currentId = segment;
  }

  return {
    path,
    targetId: currentId,
    target: getElement(spec, currentId),
    parentId,
    parent: parentId ? getElement(spec, parentId) : undefined,
  };
}

function collectDescendantIds(spec: UISpec, rootId: string, visited = new Set<string>()): Set<string> {
  if (visited.has(rootId)) return visited;
  visited.add(rootId);

  const element = getElement(spec, rootId);
  for (const childId of element.children ?? []) {
    collectDescendantIds(spec, childId, visited);
  }

  return visited;
}

function buildSubtreeSpec(spec: UISpec, rootId: string): UISpec {
  const subtreeIds = collectDescendantIds(spec, rootId);
  const elements = Object.fromEntries(
    [...subtreeIds].map((id) => {
      const element = getElement(spec, id);
      return [id, cloneElement(element)];
    }),
  );

  return {
    root: rootId,
    elements,
  };
}

function listHierarchy(
  spec: UISpec,
  rootId: string,
  currentPath: string,
  depth = 0,
  items: UIHierarchyItem[] = [],
  visited = new Set<string>(),
): UIHierarchyItem[] {
  if (visited.has(rootId)) return items;
  visited.add(rootId);

  const element = getElement(spec, rootId);
  items.push({
    id: rootId,
    type: element.type,
    depth,
    path: currentPath,
    children: [...(element.children ?? [])],
  });

  for (const childId of element.children ?? []) {
    listHierarchy(spec, childId, `${currentPath}.${childId}`, depth + 1, items, visited);
  }

  return items;
}

function assertNotRootPath(resolved: ResolvedPath, action: string) {
  if (!resolved.parentId) {
    throw new Error(`Cannot ${action} the root element. Use set_ui to replace the full UI or clear_ui to remove it.`);
  }
}

function assertReplacementHasNoConflicts(spec: UISpec, replacement: UISpec, removedIds: Set<string>) {
  for (const replacementId of Object.keys(replacement.elements)) {
    if (!removedIds.has(replacementId) && spec.elements[replacementId]) {
      throw new Error(`Replacement element ID "${replacementId}" already exists elsewhere in the UI.`);
    }
  }
}

function replaceChildId(children: string[], currentId: string, nextId: string): string[] {
  return children.map((childId) => (childId === currentId ? nextId : childId));
}

function setCurrentSpec(nextSpec: UISpec): UISpec {
  const validatedSpec = validateSpec(nextSpec);
  return cloneSpec(validatedSpec);
}

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
