"use client";

import type { ModelOption } from "@/hooks/use-chat-models";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Square, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { ChatModelSelector } from "./chat-model-selector";
import { ChatSendButton } from "./chat-send-button";

type ChatComposerProps = {
  models: readonly ModelOption[];
  selectedModelId: string;
  inputText: string;
  isRunning: boolean;
  hasMessages: boolean;
  error: Error | undefined;
  focusRequestToken: number;
  onSelectModelAction: (modelId: string) => void;
  onInputChangeAction: (value: string) => void;
  onSubmitAction: () => Promise<void>;
  onClearAction: () => void;
  onStopAction: () => void;
};

export function ChatComposer({
  models,
  selectedModelId,
  inputText,
  isRunning,
  hasMessages,
  error,
  focusRequestToken,
  onSelectModelAction,
  onInputChangeAction,
  onSubmitAction,
  onClearAction,
  onStopAction,
}: ChatComposerProps) {
  const textAreaInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (focusRequestToken === 0) return;

    const textarea = textAreaInputRef.current;
    if (!textarea) return;

    textarea.focus();
    const textLength = textarea.value.length;
    textarea.setSelectionRange(textLength, textLength);
  }, [focusRequestToken]);

  return (
    <div className="border-t border-border/70 bg-background/85 p-3">
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmitAction();
        }}
      >
        <Textarea
          value={inputText}
          onChange={(event) => onInputChangeAction(event.target.value)}
          placeholder="Describe your design..."
          className="min-h-20"
          ref={textAreaInputRef}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void onSubmitAction();
            }
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" onClick={onClearAction} disabled={!hasMessages || isRunning}>
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>

          <div className="ml-auto flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
            {isRunning ? (
              <Button type="button" variant="outline" onClick={onStopAction}>
                <Square className="h-4 w-4" />
                Stop
              </Button>
            ) : null}
            <ChatModelSelector
              className="flex-1"
              disabled={isRunning}
              models={models}
              onSelectModelAction={onSelectModelAction}
              selectedModelId={selectedModelId}
            />
            <ChatSendButton disabled={!inputText.trim() || isRunning} />
          </div>
        </div>
      </form>

      {error ? (
        <p className="mt-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
