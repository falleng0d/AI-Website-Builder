"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import type { CSSProperties, MutableRefObject } from "react";
import { ChatComposer } from "./chat-composer";
import { ChatMessageList } from "./chat-message-list";
import { CHAT_STARTER_PROMPTS } from "./chat-types";

type ChatSidebarProps = {
  isOpen: boolean;
  width: number;
  isResizing: boolean;
  messages: readonly UIMessage[];
  isRunning: boolean;
  input: string;
  error: Error | undefined;
  bottomRef: MutableRefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSubmitPrompt: (prompt: string) => Promise<void>;
  onClear: () => void;
  onStop: () => void;
};

export function ChatSidebar({
  isOpen,
  width,
  isResizing,
  messages,
  isRunning,
  input,
  error,
  bottomRef,
  onInputChange,
  onSubmitPrompt,
  onClear,
  onStop,
}: ChatSidebarProps) {
  const hasMessages = messages.length > 0;

  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col overflow-hidden border-r border-border/70 bg-card/35 transition-[width] duration-200 md:shrink-0",
        isResizing && "transition-none",
        isOpen ? "w-full md:w-[var(--chat-sidebar-width)]" : "w-0 border-r-0",
      )}
      style={{ "--chat-sidebar-width": `${width}px` } as CSSProperties}
    >
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {!hasMessages ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-semibold">Start building with AI</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Describe the website you want and iterate from there.
              </p>
            </div>
            <div className="space-y-2">
              {CHAT_STARTER_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  className="h-auto w-full justify-start whitespace-normal py-3 text-left"
                  onClick={() => {
                    void onSubmitPrompt(prompt);
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <ChatMessageList
            messages={messages}
            isRunning={isRunning}
            bottomRef={bottomRef}
          />
        )}
      </div>

      <ChatComposer
        input={input}
        isRunning={isRunning}
        hasMessages={hasMessages}
        error={error}
        onInputChange={onInputChange}
        onSubmit={() => onSubmitPrompt(input)}
        onClear={onClear}
        onStop={onStop}
      />
    </aside>
  );
}
