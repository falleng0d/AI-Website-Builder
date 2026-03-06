"use client";

import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { cn } from "@/lib/utils";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import type { UIMessage } from "ai";
import { Bot, Loader2, User2 } from "lucide-react";
import type { RefObject } from "react";
import { Streamdown } from "streamdown";
import { isTextPart, isToolPart, type ToolPart } from "./chat-types";

type ChatMessageListProps = {
  messages: readonly UIMessage[];
  isRunning: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
};

const STREAMDOWN_PLUGINS = { code, mermaid, math, cjk };

function renderToolPart(part: ToolPart, key: string) {
  const content = (
    <ToolContent>
      {part.input !== undefined ? <ToolInput input={part.input} /> : null}
      <ToolOutput output={part.output} errorText={part.errorText} />
    </ToolContent>
  );

  if (part.type === "dynamic-tool") {
    return (
      <Tool key={key} defaultOpen={part.state === "output-error"}>
        <ToolHeader
          title={part.title}
          type={part.type}
          state={part.state}
          toolName={part.toolName}
        />
        {content}
      </Tool>
    );
  }

  return (
    <Tool key={key} defaultOpen={part.state === "output-error"}>
      <ToolHeader title={part.title} type={part.type} state={part.state} />
      {content}
    </Tool>
  );
}

export function ChatMessageList({
  messages,
  isRunning,
  bottomRef,
}: ChatMessageListProps) {
  return (
    <>
      {messages.map((message) => {
        const isUser = message.role === "user";

        return (
          <div
            key={message.id}
            className={cn("flex", isUser ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[92%] rounded-2xl border px-3.5 py-3 text-sm leading-6 shadow-sm",
                isUser
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background/90 text-foreground"
              )}
            >
              <div className="mb-1.5 flex items-center gap-2 text-xs font-medium opacity-85">
                {isUser ? (
                  <User2 className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
                <span>{isUser ? "You" : "Assistant"}</span>
              </div>

              <div className="space-y-3">
                {message.parts.map((part, index) => {
                  const key = `${message.id}-${part.type}-${index}`;

                  if (isTextPart(part)) {
                    return (
                      <Streamdown
                        key={key}
                        className="min-w-0"
                        plugins={STREAMDOWN_PLUGINS}
                        animated={{ animation: "blurIn" }}
                        isAnimating={isRunning && !isUser}
                      >
                        {part.text}
                      </Streamdown>
                    );
                  }

                  if (isToolPart(part)) {
                    return renderToolPart(part, key);
                  }

                  return null;
                })}
              </div>
            </div>
          </div>
        );
      })}

      {isRunning ? (
        <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/85 px-3 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Assistant is thinking...
        </div>
      ) : null}
      <div ref={bottomRef} />
    </>
  );
}
