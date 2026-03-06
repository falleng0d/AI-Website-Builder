"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { usePersistedState } from "@/lib/chat-config";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatPreviewPanel } from "./chat-preview-panel";
import { ChatResizeHandle } from "./chat-resize-handle";
import { ChatSidebar } from "./chat-sidebar";
import { ChatTopBar } from "./chat-top-bar";
import { useResizable } from "@/hooks/use-resizable";
import { z } from "zod";
import { ModelOption } from "@/hooks/use-chat-models";
import { User } from "@/lib/types";

const SIDEBAR_MIN_WIDTH = 320;
const SIDEBAR_MAX_WIDTH_RATIO = 0.7;
const PREVIEW_MIN_WIDTH = 320;

const showSidebarSchema = z.coerce.boolean().default(true);
const sidebarWidthSchema = z.coerce.number().min(320).max(1100).default(420);

interface ChatWorkspaceProps {
  models: readonly ModelOption[];
  defaultModelId: string;
  user?: User;
}

export function ChatWorkspace(props: ChatWorkspaceProps) {
  const [inputText, setInputText] = useState("");
  const selectedModelSchema = useMemo(() => z.string().min(1).default(props.defaultModelId), [props.defaultModelId]);
  const [showSidebar, setShowSidebar] = usePersistedState("showSidebar", showSidebarSchema);
  const [sidebarWidth, setSidebarWidth] = usePersistedState("sidebarWidth", sidebarWidthSchema);
  const [selectedModelId, setSelectedModelId] = usePersistedState("selectedModelId", selectedModelSchema);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const resolvedSidebarWidth = hasMounted ? sidebarWidth : sidebarWidthSchema.parse(undefined);

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { isResizing, handleResizeStart, handleResizeReset } = useResizable({
    containerRef,
    setWidth: setSidebarWidth,
    minWidth: SIDEBAR_MIN_WIDTH,
    maxWidthRatio: SIDEBAR_MAX_WIDTH_RATIO,
    otherPaneMinWidth: PREVIEW_MIN_WIDTH,
    defaultWidth: sidebarWidthSchema.parse(undefined),
    disabled: !showSidebar,
  });

  const availableModels = useMemo(() => {
    if (props.models.some((model) => model.id === selectedModelId)) {
      return props.models;
    }

    return [{ id: selectedModelId, name: selectedModelId }, ...props.models];
  }, [props.models, selectedModelId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { modelId: selectedModelId },
      }),
    [selectedModelId]
  );

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    transport,
  });

  const visibleMessages = useMemo(() => messages.filter((message) => message.role !== "system"), [messages]);

  const isRunning = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages.length, status]);

  const submitPrompt = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isRunning) return;

    setInputText("");
    await sendMessage({ text: trimmed });
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <ChatTopBar isSidebarOpen={showSidebar} onToggleSidebarAction={() => setShowSidebar(!showSidebar)} />

      <div ref={containerRef} className="flex min-h-0 flex-1">
        <ChatSidebar
          isOpen={showSidebar}
          width={resolvedSidebarWidth}
          isResizing={isResizing}
          models={availableModels}
          selectedModelId={selectedModelId}
          messages={visibleMessages}
          isRunning={isRunning}
          inputText={inputText}
          error={error}
          bottomRef={bottomRef}
          onSelectModelAction={setSelectedModelId}
          onInputChangeAction={setInputText}
          onSubmitPromptAction={submitPrompt}
          onClearAction={() => setMessages([])}
          onStopAction={stop}
        />

        <ChatResizeHandle
          isVisible={showSidebar}
          onPointerDownAction={handleResizeStart}
          onDoubleClickAction={handleResizeReset}
        />

        <ChatPreviewPanel isSidebarOpen={showSidebar} />
      </div>
    </div>
  );
}
