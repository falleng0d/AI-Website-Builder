"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type ChatPreviewPanelProps = {
  isSidebarOpen: boolean;
};

export function ChatPreviewPanel({ isSidebarOpen }: ChatPreviewPanelProps) {
  return (
    <section
      className={cn(
        "relative min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted/20",
        isSidebarOpen ? "hidden md:flex" : "flex",
      )}
    >
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
        <p className="mt-1 text-sm text-muted-foreground">
          The app canvas will render here once web container preview is wired in.
        </p>
      </div>
    </section>
  );
}
