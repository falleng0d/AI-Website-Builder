"use client";

import type { ModelOption } from "@/hooks/use-chat-models";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import { useState, type CSSProperties, type RefObject } from "react";
import { ChatComposer } from "./chat-composer";
import { ChatMessageList } from "./chat-message-list";
import { CHAT_STARTER_PROMPTS } from "./chat-types";

type ChatSidebarProps = {
  isOpen: boolean;
  width: number;
  isResizing: boolean;
  models: readonly ModelOption[];
  selectedModelId: string;
  messages: readonly UIMessage[];
  isRunning: boolean;
  inputText: string;
  bottomRef: RefObject<HTMLDivElement | null>;
  onSelectModelAction: (modelId: string) => void;
  onInputChangeAction: (value: string) => void;
  onSubmitPromptAction: (prompt: string) => Promise<void>;
  onClearAction: () => void;
  onStopAction: () => void;
};

export function ChatSidebar({
  isOpen,
  width,
  isResizing,
  models,
  selectedModelId,
  messages,
  isRunning,
  inputText,
  bottomRef,
  onSelectModelAction,
  onInputChangeAction,
  onSubmitPromptAction,
  onClearAction,
  onStopAction,
}: ChatSidebarProps) {
  const hasMessages = messages.length > 0;
  const [focusRequestToken, setFocusRequestToken] = useState(0);

  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col overflow-hidden border-r border-border/70 bg-card/35 transition-[width] duration-200 md:shrink-0",
        isResizing && "transition-none",
        isOpen ? "w-full md:w-(--chat-sidebar-width)" : "w-0 border-r-0",
      )}
      style={{ "--chat-sidebar-width": `${width}px` } as CSSProperties}
    >
      <div className="chat-sidebar-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
        {!hasMessages ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-semibold">Start building with AI</p>
              <p className="mt-1 text-sm text-muted-foreground">Describe the website you want and iterate from there.</p>
            </div>
            <div className="space-y-2">
              {CHAT_STARTER_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  className="h-auto w-full justify-start py-3 text-left whitespace-normal"
                  onClick={() => {
                    onInputChangeAction(prompt);
                    setFocusRequestToken((currentToken) => currentToken + 1);
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <ChatMessageList messages={messages} isRunning={isRunning} bottomRef={bottomRef} />
        )}
      </div>

      <ChatComposer
        models={models}
        selectedModelId={selectedModelId}
        inputText={inputText}
        isRunning={isRunning}
        hasMessages={hasMessages}
        focusRequestToken={focusRequestToken}
        onSelectModelAction={onSelectModelAction}
        onInputChangeAction={onInputChangeAction}
        onSubmitAction={() => onSubmitPromptAction(inputText)}
        onClearAction={onClearAction}
        onStopAction={onStopAction}
      />
    </aside>
  );
}
