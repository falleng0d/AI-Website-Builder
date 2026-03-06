"use client";

import { useSVGRegistryContext } from "@/context/SVGRegistryContext";
import type { SVGRegistryMap } from "@/lib/json-ui/svg-registry";
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
const SVG_UPDATING_TOOLS = new Set(["create_svg"]);

/**
 * Watches chat messages for UI tool results and syncs the latest spec
 * into the GeneratedUIContext.
 */
export function useGeneratedUI(messages: readonly UIMessage[]) {
  const { spec, setSpec, clearSpec } = useGeneratedUIContext();
  const { clearRegistry, setRegistry, setSvg } = useSVGRegistryContext();
  const processedToolCallIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (messages.length === 0) {
      processedToolCallIdsRef.current.clear();
      return;
    }

    for (const message of messages) {
      if (message.role !== "assistant") continue;

      for (const part of message.parts) {
        if (!isToolPart(part) || !hasOutput(part)) continue;

        const resultKey = getToolCallId(part);
        if (processedToolCallIdsRef.current.has(resultKey)) continue;
        processedToolCallIdsRef.current.add(resultKey);

        const toolName = getToolName(part);

        if (SPEC_UPDATING_TOOLS.has(toolName)) {
          const result = part.output as { spec?: UISpec };
          if (result?.spec) setSpec(result.spec);
          continue;
        }

        if (toolName === "clear_ui") {
          clearSpec();
          clearRegistry();
          continue;
        }

        if (SVG_UPDATING_TOOLS.has(toolName)) {
          const result = part.output as { registry?: SVGRegistryMap; slug?: string; svg?: string };
          if (result.registry) {
            setRegistry(result.registry);
            continue;
          }

          if (result.slug && result.svg) {
            setSvg(result.slug, result.svg);
          }
        }
      }
    }
  }, [clearRegistry, clearSpec, messages, setRegistry, setSpec, setSvg]);

  return { spec };
}
