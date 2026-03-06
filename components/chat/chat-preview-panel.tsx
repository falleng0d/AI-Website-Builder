"use client";

import { useGeneratedUIContext } from "@/context/GeneratedUIContext";
import { registry } from "@/lib/json-ui/registry";
import { cn } from "@/lib/utils";
import { ActionProvider, Renderer, StateProvider, VisibilityProvider } from "@json-render/react";
import { Sparkles } from "lucide-react";

type ChatPreviewPanelProps = {
  isSidebarOpen: boolean;
};

function EmptyPreview() {
  return (
    <>
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--border) 72%, transparent) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative mx-6 flex max-w-md flex-col items-center rounded-2xl border border-dashed border-border/80 bg-background/85 px-6 py-7 text-center shadow-sm">
        <Sparkles className="mb-2 h-5 w-5 text-primary" />
        <p className="text-sm font-semibold">Live Preview</p>
        <p className="mt-1 text-sm text-muted-foreground">Ask the assistant to build a UI and it will appear here.</p>
      </div>
    </>
  );
}

export function ChatPreviewPanel({ isSidebarOpen }: ChatPreviewPanelProps) {
  const { spec } = useGeneratedUIContext();

  return (
    <section
      data-testid="preview-panel"
      className={cn(
        "relative min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted/20",
        isSidebarOpen ? "hidden md:flex" : "flex",
      )}
    >
      {spec ? (
        <div className="absolute inset-0 overflow-auto p-6" data-testid="preview-content">
          <StateProvider initialState={{}}>
            <VisibilityProvider>
              <ActionProvider handlers={{}}>
                <Renderer spec={spec} registry={registry} />
              </ActionProvider>
            </VisibilityProvider>
          </StateProvider>
        </div>
      ) : (
        <EmptyPreview />
      )}
    </section>
  );
}
