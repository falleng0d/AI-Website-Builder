"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatConfigService } from "@/lib/chat-config";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { ChatPreviewPanel } from "./chat-preview-panel";
import { ChatResizeHandle } from "./chat-resize-handle";
import { ChatSidebar } from "./chat-sidebar";
import { ChatTopBar } from "./chat-top-bar";

const SIDEBAR_MIN_WIDTH = 320;
const SIDEBAR_MAX_WIDTH_RATIO = 0.7;
const PREVIEW_MIN_WIDTH = 320;

const clampSidebarWidth = (width: number, containerWidth: number): number => {
  const maxWidth = Math.max(
    SIDEBAR_MIN_WIDTH,
    Math.min(containerWidth * SIDEBAR_MAX_WIDTH_RATIO, containerWidth - PREVIEW_MIN_WIDTH),
  );

  return Math.min(Math.max(width, SIDEBAR_MIN_WIDTH), maxWidth);
};

export function ChatWorkspace() {
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(ChatConfigService.defaultConfig.showSidebar);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(ChatConfigService.defaultConfig.sidebarWidth);

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    transport,
  });

  const visibleMessages = useMemo(() => messages.filter((message) => message.role !== "system"), [messages]);

  const isRunning = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages.length, status]);

  useEffect(() => {
    if (!isResizing) return;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [isResizing]);

  useEffect(() => {
    const config = ChatConfigService.loadConfig();
    setIsSidebarOpen(config.showSidebar);
    setSidebarWidth(config.sidebarWidth);
  }, []);

  useEffect(() => {
    ChatConfigService.saveConfig({ showSidebar: isSidebarOpen });
  }, [isSidebarOpen]);

  useEffect(() => {
    ChatConfigService.saveConfig({ sidebarWidth });
  }, [sidebarWidth]);

  useEffect(() => {
    const clampToContainer = () => {
      const container = containerRef.current;
      if (!container) return;

      setSidebarWidth((currentWidth) => {
        const nextWidth = clampSidebarWidth(currentWidth, container.getBoundingClientRect().width);

        if (nextWidth === currentWidth) {
          return currentWidth;
        }

        return nextWidth;
      });
    };

    clampToContainer();
    window.addEventListener("resize", clampToContainer);

    return () => {
      window.removeEventListener("resize", clampToContainer);
    };
  }, []);

  const submitPrompt = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isRunning) return;

    setInput("");
    await sendMessage({ text: trimmed });
  };

  const handleResizeStart = (event: PointerEvent<HTMLDivElement>) => {
    if (!isSidebarOpen) return;

    const container = containerRef.current;
    if (!container) return;

    event.preventDefault();
    setIsResizing(true);

    const bounds = container.getBoundingClientRect();

    const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
      const nextWidth = moveEvent.clientX - bounds.left;
      const clampedWidth = clampSidebarWidth(nextWidth, bounds.width);
      setSidebarWidth(clampedWidth);
    };

    const onPointerUp = () => {
      setIsResizing(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const handleResizeReset = () => {
    const container = containerRef.current;
    if (!container) return;

    const defaultWidth = ChatConfigService.defaultConfig.sidebarWidth;
    const nextWidth = clampSidebarWidth(defaultWidth, container.getBoundingClientRect().width);

    setSidebarWidth(nextWidth);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <ChatTopBar isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((value) => !value)} />

      <div ref={containerRef} className="flex min-h-0 flex-1">
        <ChatSidebar
          isOpen={isSidebarOpen}
          width={sidebarWidth}
          isResizing={isResizing}
          messages={visibleMessages}
          isRunning={isRunning}
          input={input}
          error={error}
          bottomRef={bottomRef}
          onInputChange={setInput}
          onSubmitPrompt={submitPrompt}
          onClear={() => setMessages([])}
          onStop={stop}
        />

        <ChatResizeHandle isVisible={isSidebarOpen} onPointerDown={handleResizeStart} onDoubleClick={handleResizeReset} />

        <ChatPreviewPanel isSidebarOpen={isSidebarOpen} />
      </div>
    </div>
  );
}
