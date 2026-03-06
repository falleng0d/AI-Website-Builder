"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { usePersistedState } from "@/lib/chat-config";
import { useEffect, useMemo, useRef, useState } from "react";
import { GeneratedUIProvider, useGeneratedUIContext } from "@/context/GeneratedUIContext";
import { ChatPreviewPanel } from "./chat-preview-panel";
import { ChatResizeHandle } from "./chat-resize-handle";
import { ChatSidebar } from "./chat-sidebar";
import { ChatTopBar } from "./chat-top-bar";
import { useResizable } from "@/hooks/use-resizable";
import { useGeneratedUI } from "@/hooks/use-generated-ui";
import { z } from "zod";
import { ModelOption } from "@/hooks/use-chat-models";
import { User } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SIDEBAR_MIN_WIDTH = 320;
const SIDEBAR_MAX_WIDTH_RATIO = 0.7;
const PREVIEW_MIN_WIDTH = 320;
const PREVIEW_THEME = "light" as const;

const showSidebarSchema = z.coerce.boolean().default(true);
const sidebarWidthSchema = z.coerce.number().min(320).max(1100).default(420);

interface ChatWorkspaceProps {
  models: readonly ModelOption[];
  defaultModelId: string;
  user?: User;
}

function ChatWorkspaceInner(props: ChatWorkspaceProps) {
  const [inputText, setInputText] = useState("");
  const [errorDismissed, setErrorDismissed] = useState(false);
  const selectedModelSchema = useMemo(() => z.string().min(1).default(props.defaultModelId), [props.defaultModelId]);

  const [showSidebar, setShowSidebar] = usePersistedState("showSidebar", showSidebarSchema);
  const [sidebarWidth, setSidebarWidth] = usePersistedState("sidebarWidth", sidebarWidthSchema);
  const [selectedModelId, setSelectedModelId] = usePersistedState("selectedModelId", selectedModelSchema);

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
      }),
    [],
  );

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    transport,
    experimental_throttle: 50,
  });

  useEffect(() => {
    if (error) {
      setErrorDismissed(false);
    }
  }, [error]);

  const { spec: currentUISpec } = useGeneratedUI(messages);
  const { clearSpec } = useGeneratedUIContext();

  const visibleMessages = useMemo(() => messages.filter((message) => message.role !== "system"), [messages]);

  const isRunning = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages.length, status]);

  const submitPrompt = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isRunning) return;

    setInputText("");
    await sendMessage({ text: trimmed }, { body: { modelId: selectedModelId, currentUISpec, previewTheme: PREVIEW_THEME } });
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <ChatTopBar
        isSidebarOpen={showSidebar}
        onToggleSidebarAction={() => setShowSidebar(!showSidebar)}
        onClearUIAction={clearSpec}
      />

      <div ref={containerRef} className="flex min-h-0 flex-1">
        <ChatSidebar
          isOpen={showSidebar}
          width={sidebarWidth}
          isResizing={isResizing}
          models={availableModels}
          selectedModelId={selectedModelId}
          messages={visibleMessages}
          isRunning={isRunning}
          inputText={inputText}
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

      {error && !errorDismissed ? (
        <Dialog open={true} onOpenChange={(open) => !open && setErrorDismissed(true)}>
          <DialogContent className="sm:max-w-md" data-testid="chat-composer-error">
            <DialogHeader>
              <DialogTitle className="text-destructive">Error</DialogTitle>
              <DialogDescription className="max-h-48 overflow-y-auto pt-2 text-destructive/80">
                {error.message}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

export function ChatWorkspace(props: ChatWorkspaceProps) {
  return (
    <GeneratedUIProvider>
      <ChatWorkspaceInner {...props} />
    </GeneratedUIProvider>
  );
}
