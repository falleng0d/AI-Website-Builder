"use client";

import type { UISpec } from "@/lib/json-ui/types";
import type { UIMessage } from "ai";
import { useEffect, useRef } from "react";
import { useGeneratedUIContext } from "@/context/GeneratedUIContext";
import { isToolPart, type ToolPart } from "@/components/chat/chat-types";

function getToolName(part: ToolPart): string {
  if (part.type === "dynamic-tool") return part.toolName;
  // Static tool parts have type "tool-{name}"
  return part.type.replace(/^tool-/, "");
}

function getToolCallId(part: ToolPart): string {
  return part.type === "dynamic-tool" ? part.toolCallId : part.toolCallId;
}

function hasOutput(part: ToolPart): part is ToolPart & { state: "output-available"; output: unknown } {
  return part.state === "output-available";
}

const SPEC_UPDATING_TOOLS = new Set(["set_ui", "delete_element", "replace_element", "edit_element"]);

/**
 * Watches chat messages for UI tool results and syncs the latest spec
 * into the GeneratedUIContext.
 */
export function useGeneratedUI(messages: readonly UIMessage[]) {
  const { spec, setSpec, clearSpec } = useGeneratedUIContext();
  const lastProcessedRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Scan messages in reverse to find the most recent UI tool result
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role !== "assistant") continue;

      const parts = message.parts;
      for (let j = parts.length - 1; j >= 0; j--) {
        const part = parts[j];
        if (!isToolPart(part) || !hasOutput(part)) continue;

        const toolName = getToolName(part);
        if (!SPEC_UPDATING_TOOLS.has(toolName) && toolName !== "clear_ui") continue;

        const resultKey = getToolCallId(part);
        if (lastProcessedRef.current === resultKey) return;
        lastProcessedRef.current = resultKey;

        if (SPEC_UPDATING_TOOLS.has(toolName)) {
          const result = part.output as { spec?: UISpec };
          if (result?.spec) {
            setSpec(result.spec);
          }
          return;
        }

        if (toolName === "clear_ui") {
          clearSpec();
          return;
        }
      }
    }
  }, [messages, setSpec, clearSpec]);

  return { spec };
}
