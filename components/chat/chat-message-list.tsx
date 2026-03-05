"use client";

import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import { Bot, Loader2, User2 } from "lucide-react";
import type { RefObject } from "react";
import { Streamdown } from "streamdown";
import { getMessageText } from "./chat-types";

type ChatMessageListProps = {
  messages: readonly UIMessage[];
  isRunning: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
};

export function ChatMessageList({ messages, isRunning, bottomRef }: ChatMessageListProps) {
  return (
    <>
      {messages.map((message) => {
        const isUser = message.role === "user";

        return (
          <div key={message.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[92%] rounded-2xl border px-3.5 py-3 text-sm leading-6 shadow-sm",
                isUser
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background/90 text-foreground",
              )}
            >
              <div className="mb-1.5 flex items-center gap-2 text-xs font-medium opacity-85">
                {isUser ? <User2 className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                <span>{isUser ? "You" : "Assistant"}</span>
              </div>
              <Streamdown>{getMessageText(message)}</Streamdown>
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
