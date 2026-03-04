"use client";

import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Bot,
  Loader2,
  SendHorizontal,
  Sparkles,
  Square,
  Trash2,
  User2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type MessagePart = UIMessage["parts"][number];
type TextPart = Extract<MessagePart, { type: "text" }>;

const starterPrompts = [
  "Build a modern landing page for a SaaS product with pricing cards.",
  "Generate a portfolio homepage with a hero, projects grid, and contact form.",
  "Create a restaurant website with menu sections and a reservation call-to-action.",
];

function getMessageText(message: UIMessage): string {
  const textParts = message.parts.filter(
    (part): part is TextPart => part.type === "text",
  );

  const text = textParts.map((part) => part.text).join("\n").trim();
  if (text.length > 0) return text;

  return "(non-text response)";
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );
  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    transport,
  });

  const isRunning = status === "submitted" || status === "streaming";
  const hasMessages = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const visibleMessages = useMemo(
    () => messages.filter((message) => message.role !== "system"),
    [messages],
  );

  const submitPrompt = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isRunning) return;
    setInput("");
    await sendMessage({ text: trimmed });
  };

  return (
    <section className="container py-8 md:py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="space-y-3 text-center">
          <Badge className="px-4 py-1.5 text-sm font-medium">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Website Builder Chat
          </Badge>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Chat with your website assistant
          </h1>
          <p className="mx-auto max-w-3xl text-muted-foreground sm:text-lg">
            Powered by Vercel AI SDK using the existing API route at
            <code className="ml-2 rounded bg-muted px-1.5 py-0.5 text-sm">/api/chat</code>
          </p>
        </div>

        <Card className="border-primary/25 bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle>Builder Assistant</CardTitle>
            <CardDescription>
              Ask for layouts, components, styles, or full page ideas and iterate in real time.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-[55vh] min-h-[24rem] overflow-y-auto rounded-xl border border-border/60 bg-background/70 p-4">
              {!hasMessages ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Try one of these prompts to start building.
                  </p>
                  <div className="grid w-full max-w-3xl gap-2 sm:grid-cols-3">
                    {starterPrompts.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        className="h-auto whitespace-normal py-3 text-left"
                        onClick={() => submitPrompt(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {visibleMessages.map((message) => {
                    const isUser = message.role === "user";
                    return (
                      <div
                        key={message.id}
                        className={cn("flex", isUser ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl border px-4 py-3 shadow-sm",
                            isUser
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-card-foreground",
                          )}
                        >
                          <div className="mb-2 flex items-center gap-2 text-xs font-medium opacity-80">
                            {isUser ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            <span>{isUser ? "You" : "Assistant"}</span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-6">
                            {getMessageText(message)}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {isRunning ? (
                    <div className="flex justify-start">
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Assistant is thinking...
                      </div>
                    </div>
                  ) : null}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            <form
              className="w-full space-y-2"
              onSubmit={async (event) => {
                event.preventDefault();
                await submitPrompt(input);
              }}
            >
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Describe the website you want to build..."
                className="min-h-24"
                onKeyDown={async (event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    await submitPrompt(input);
                  }
                }}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMessages([])}
                  disabled={!hasMessages || isRunning}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear chat
                </Button>

                <div className="flex items-center gap-2">
                  {isRunning ? (
                    <Button type="button" variant="outline" onClick={() => stop()}>
                      <Square className="h-4 w-4" />
                      Stop
                    </Button>
                  ) : null}
                  <Button type="submit" disabled={!input.trim() || isRunning}>
                    <SendHorizontal className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </form>

            {error ? (
              <p className="w-full rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error.message}
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
