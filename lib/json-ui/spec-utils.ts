import type { UISpec } from "@/lib/json-ui/types";

export type UIElementDefinition = UISpec["elements"][string];

export type ResolvedPath = {
  path: string;
  targetId: string;
  target: UIElementDefinition;
  parentId?: string;
  parent?: UIElementDefinition;
};

export type UIHierarchyItem = {
  id: string;
  type: string;
  depth: number;
  path: string;
  children: string[];
};

export function cloneElement(element: UIElementDefinition): UIElementDefinition {
  return {
    ...element,
    props: { ...(element.props ?? {}) },
    children: [...(element.children ?? [])],
  };
}

export function cloneSpec(spec: UISpec): UISpec {
  return {
    root: spec.root,
    elements: Object.fromEntries(Object.entries(spec.elements).map(([id, element]) => [id, cloneElement(element)])),
  };
}

export function ensureCurrentSpec(spec: UISpec | undefined): UISpec {
  if (!spec) throw new Error("No UI is currently set in the preview.");
  return spec;
}

export function getElement(spec: UISpec, id: string): UIElementDefinition {
  const element = spec.elements[id];
  if (!element) throw new Error(`Element "${id}" does not exist in the UI spec.`);
  return element;
}

export function validateSpec(spec: UISpec): UISpec {
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

export function resolvePath(spec: UISpec, path: string): ResolvedPath {
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

export function collectDescendantIds(spec: UISpec, rootId: string, visited = new Set<string>()): Set<string> {
  if (visited.has(rootId)) return visited;
  visited.add(rootId);

  const element = getElement(spec, rootId);
  for (const childId of element.children ?? []) {
    collectDescendantIds(spec, childId, visited);
  }

  return visited;
}

export function buildSubtreeSpec(spec: UISpec, rootId: string): UISpec {
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

export function listHierarchy(
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

export function assertNotRootPath(resolved: ResolvedPath, action: string) {
  if (!resolved.parentId) {
    throw new Error(`Cannot ${action} the root element. Use set_ui to replace the full UI or clear_ui to remove it.`);
  }
}

export function assertReplacementHasNoConflicts(spec: UISpec, replacement: UISpec, removedIds: Set<string>) {
  for (const replacementId of Object.keys(replacement.elements)) {
    if (!removedIds.has(replacementId) && spec.elements[replacementId]) {
      throw new Error(`Replacement element ID "${replacementId}" already exists elsewhere in the UI.`);
    }
  }
}

export function replaceChildId(children: string[], currentId: string, nextId: string): string[] {
  return children.map((childId) => (childId === currentId ? nextId : childId));
}

export function setCurrentSpec(nextSpec: UISpec): UISpec {
  const validatedSpec = validateSpec(nextSpec);
  return cloneSpec(validatedSpec);
}
