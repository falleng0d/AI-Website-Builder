"use client";

import { Button } from "@/components/ui/button";
import { ListTree, PanelLeft, PanelRight, Trash2 } from "lucide-react";

type ChatTopBarProps = {
  isSidebarOpen: boolean;
  hasGeneratedUI: boolean;
  isComponentTreeOpen: boolean;
  onToggleSidebarAction: () => void;
  onToggleComponentTreeAction: () => void;
  onClearUIAction?: () => void;
};

export function ChatTopBar({
  isSidebarOpen,
  hasGeneratedUI,
  isComponentTreeOpen,
  onToggleSidebarAction,
  onToggleComponentTreeAction,
  onClearUIAction,
}: ChatTopBarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border/70 bg-background/95 px-3 backdrop-blur">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebarAction}
          aria-label={isSidebarOpen ? "Hide chat sidebar" : "Show chat sidebar"}
        >
          {isSidebarOpen ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
        </Button>
      </div>
      <div className="flex items-center gap-1">
        {hasGeneratedUI ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleComponentTreeAction}
            aria-label={isComponentTreeOpen ? "Hide component tree" : "Show component tree"}
          >
            <ListTree className="h-5 w-5" />
          </Button>
        ) : null}

        {hasGeneratedUI && onClearUIAction ? (
          <Button variant="ghost" size="icon" onClick={onClearUIAction} aria-label="Clear UI">
            <Trash2 className="h-5 w-5" />
          </Button>
        ) : null}
      </div>
    </header>
  );
}
