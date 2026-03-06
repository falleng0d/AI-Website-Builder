export type SVGRegistryMap = Record<string, string>;

const SVG_TAG_PATTERN = /<svg\b[^>]*>[\s\S]*<\/svg>/i;
const SCRIPT_TAG_PATTERN = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const EVENT_HANDLER_PATTERN = /\son[a-z-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URL_PATTERN =
  /\s(?:href|xlink:href)\s*=\s*("\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi;

function collapseSlugDelimiters(value: string) {
  return value.replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
}

export function cloneSVGRegistry(registry: SVGRegistryMap | undefined): SVGRegistryMap {
  return { ...(registry ?? {}) };
}

export function normalizeSVGSlug(value: string): string {
  const normalized = collapseSlugDelimiters(
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-"),
  );

  return normalized || "svg-asset";
}

export function sanitizeSVG(svg: string): string {
  const trimmed = svg.trim();
  if (!SVG_TAG_PATTERN.test(trimmed)) {
    throw new Error("SVG input must contain a complete <svg>...</svg> document.");
  }

  const sanitized = trimmed
    .replace(SCRIPT_TAG_PATTERN, "")
    .replace(EVENT_HANDLER_PATTERN, "")
    .replace(JAVASCRIPT_URL_PATTERN, "");

  if (!SVG_TAG_PATTERN.test(sanitized)) {
    throw new Error("SVG sanitization removed the root SVG markup.");
  }

  return sanitized;
}

export function createUniqueSVGSlug(registry: SVGRegistryMap, requestedSlug: string, svg: string): string {
  const baseSlug = normalizeSVGSlug(requestedSlug);
  const existing = registry[baseSlug];
  if (!existing) return baseSlug;
  if (existing === svg) return baseSlug;

  let index = 2;
  while (registry[`${baseSlug}-${index}`]) {
    if (registry[`${baseSlug}-${index}`] === svg) return `${baseSlug}-${index}`;
    index += 1;
  }

  return `${baseSlug}-${index}`;
}
