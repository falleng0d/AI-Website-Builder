"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Square, Trash2 } from "lucide-react";
import { ChatSendButton } from "./chat-send-button";

type ChatComposerProps = {
  input: string;
  isRunning: boolean;
  hasMessages: boolean;
  error: Error | undefined;
  onInputChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  onClear: () => void;
  onStop: () => void;
};

export function ChatComposer({
  input,
  isRunning,
  hasMessages,
  error,
  onInputChange,
  onSubmit,
  onClear,
  onStop,
}: ChatComposerProps) {
  return (
    <div className="border-t border-border/70 bg-background/85 p-3">
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
      >
        <Textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Describe your design..."
          className="min-h-20"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void onSubmit();
            }
          }}
        />
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClear}
            disabled={!hasMessages || isRunning}
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>

          <div className="flex items-center gap-2">
            {isRunning ? (
              <Button type="button" variant="outline" onClick={onStop}>
                <Square className="h-4 w-4" />
                Stop
              </Button>
            ) : null}
            <ChatSendButton disabled={!input.trim() || isRunning} />
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
