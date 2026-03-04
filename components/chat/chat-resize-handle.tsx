"use client";

import { cn } from "@/lib/utils";
import type { MouseEventHandler, PointerEventHandler } from "react";

type ChatResizeHandleProps = {
  isVisible: boolean;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onDoubleClick?: MouseEventHandler<HTMLDivElement>;
};

export function ChatResizeHandle({
  isVisible,
  onPointerDown,
  onDoubleClick,
}: ChatResizeHandleProps) {
  if (!isVisible) return null;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize chat sidebar"
      title="Drag to resize. Double-click to reset."
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      className="group relative hidden w-2 shrink-0 cursor-col-resize touch-none bg-transparent md:block"
    >
      <div
        className={cn(
          "absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border/70 transition-colors",
          "group-hover:bg-primary/70",
        )}
      />
    </div>
  );
}
