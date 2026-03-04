"use client";

import { Button } from "@/components/ui/button";
import { PanelLeft, PanelRight } from "lucide-react";

type ChatTopBarProps = {
  isSidebarOpen: boolean;
  onToggleSidebarAction: () => void;
};

export function ChatTopBar({
  isSidebarOpen,
  onToggleSidebarAction,
}: ChatTopBarProps) {
  return (
    <header className="flex h-14 items-center border-b border-border/70 bg-background/95 px-3 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebarAction}
        aria-label={isSidebarOpen ? "Hide chat sidebar" : "Show chat sidebar"}
      >
        {isSidebarOpen ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
      </Button>
    </header>
  );
}
