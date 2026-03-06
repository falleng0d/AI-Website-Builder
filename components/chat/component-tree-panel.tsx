"use client";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useComponentTreeContext } from "@/context/ComponentTreeContext";
import { useGeneratedUIContext } from "@/context/GeneratedUIContext";
import { cn } from "@/lib/utils";
import { Box, ChevronRight, FileText, Heading1, LayoutGrid, MousePointer, PanelRight } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

type TreeNodeProps = {
  elementId: string;
  depth: number;
};

function getElementIcon(type: string) {
  switch (type) {
    case "Card":
    case "Stack":
    case "Grid":
    case "Separator":
      return LayoutGrid;
    case "Heading":
      return Heading1;
    case "Text":
    case "Image":
    case "Avatar":
    case "Badge":
    case "Alert":
      return FileText;
    case "Button":
    case "Input":
    case "Textarea":
    case "Select":
    case "Checkbox":
    case "Radio":
    case "Switch":
    case "Slider":
    case "Toggle":
    case "ToggleGroup":
    case "ButtonGroup":
      return MousePointer;
    default:
      return Box;
  }
}

function getElementTextPreview(type: string, props: Record<string, unknown> | undefined) {
  if (!props) return undefined;
  if (type !== "Heading" && type !== "Text") return undefined;

  const text = typeof props.text === "string" ? props.text.trim() : undefined;
  if (!text) return undefined;

  return text.length > 30 ? `${text.slice(0, 27)}...` : text;
}

function TreeNode({ elementId, depth }: TreeNodeProps) {
  const { spec } = useGeneratedUIContext();
  const { hoveredElementId, setHoveredElementId } = useComponentTreeContext();

  if (!spec) return null;

  const element = spec.elements[elementId];
  if (!element) return null;

  const childIds = element.children ?? [];
  const isBranch = childIds.length > 0;
  const isHovered = hoveredElementId === elementId;
  const [isOpen, setIsOpen] = useState(depth < 3);
  const Icon = getElementIcon(element.type);
  const textPreview = getElementTextPreview(element.type, element.props);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        data-testid={`component-tree-node-${elementId}`}
        data-element-id={elementId}
        className={cn("rounded-md border border-transparent transition-colors", isHovered && "border-border bg-accent/60")}
        onMouseEnter={() => setHoveredElementId(elementId)}
        onMouseLeave={() => setHoveredElementId(undefined)}
        style={{ paddingLeft: `${depth * 12}px` }}
      >
        <div className="flex min-w-0 items-center gap-1.5 px-2 py-1.5">
          {isBranch ? (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={isOpen ? `Collapse ${elementId}` : `Expand ${elementId}`}
                className="shrink-0"
              >
                <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-90")} />
              </Button>
            </CollapsibleTrigger>
          ) : (
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground">-</span>
          )}

          <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

          <div className="flex min-w-0 items-baseline gap-2 text-sm">
            <span className="truncate font-medium text-foreground">{element.type}</span>
            <span className="truncate font-mono text-xs text-muted-foreground">{elementId}</span>
            {textPreview ? <span className="truncate text-xs text-muted-foreground">&quot;{textPreview}&quot;</span> : null}
          </div>
        </div>
      </div>

      {isBranch ? (
        <CollapsibleContent>
          <div className="space-y-1 pt-1">
            {childIds.map((childId) => (
              <TreeNode key={childId} elementId={childId} depth={depth + 1} />
            ))}
          </div>
        </CollapsibleContent>
      ) : null}
    </Collapsible>
  );
}

function EmptyComponentTree() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center">
      <div className="rounded-full border border-border/70 bg-background p-3 shadow-sm">
        <PanelRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">No component tree</p>
        <p className="text-xs text-muted-foreground">Generate or load a UI to inspect its structure here.</p>
      </div>
    </div>
  );
}

export function ComponentTreePanel() {
  const { spec } = useGeneratedUIContext();
  const { setHoveredElementId } = useComponentTreeContext();

  useEffect(() => () => setHoveredElementId(undefined), [setHoveredElementId]);

  const treeContent: ReactNode = useMemo(() => {
    if (!spec?.root || !spec.elements[spec.root]) {
      return <EmptyComponentTree />;
    }

    return <TreeNode elementId={spec.root} depth={0} />;
  }, [spec]);

  return (
    <aside
      data-testid="component-tree-panel"
      className="hidden w-80 shrink-0 border-l border-border/70 bg-muted/10 md:flex md:flex-col"
    >
      <div className="border-b border-border/70 px-4 py-3">
        <p className="text-sm font-medium">Component Tree</p>
        <p className="text-xs text-muted-foreground">Inspect the generated UI hierarchy.</p>
      </div>

      <div className="chat-sidebar-scrollbar min-h-0 flex-1 overflow-auto p-3">{treeContent}</div>
    </aside>
  );
}
