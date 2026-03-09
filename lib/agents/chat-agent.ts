import "server-only";
import { ToolLoopAgent, stepCountIs, type Tool } from "ai";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { openai } from "@/lib/openai";
import { toolkit } from "@/lib/tools/toolkit";

export interface ChatAgentContext {
  userName?: string;
  threadId?: string;
  previewTheme?: "light" | "dark";
}

interface CreateChatAgentOptions {
  modelId: string;
  context?: ChatAgentContext;
  additionalTools?: Record<string, Tool>;
}

export function hashString(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function readPromptFile(fileName: string): string {
  const promptPaths = [join(process.cwd(), "lib", "agents", "prompts", fileName), join(__dirname, "prompts", fileName)];

  for (const promptPath of promptPaths) {
    if (existsSync(promptPath)) {
      return readFileSync(promptPath, "utf-8");
    }
  }

  throw new Error(`Unable to locate prompt file: ${fileName}`);
}

const UI_SPEC_PROMPT = readPromptFile("ui-spec.md");

export function buildChatSystemPrompt(context: ChatAgentContext = {}): string {
  const sections: string[] = [UI_SPEC_PROMPT];

  if (context.userName) {
    sections.push("");
    sections.push(`You are chatting with: ${context.userName}`);
  }

  if (context.previewTheme) {
    sections.push("");
    sections.push(`Generated UI is rendered in a separate preview surface using the ${context.previewTheme} theme.`);
  }

  return sections.join("\n");
}

export function createChatAgent({ modelId, context = {}, additionalTools }: CreateChatAgentOptions): ToolLoopAgent {
  const systemPrompt = buildChatSystemPrompt(context);
  const promptCacheKey = context.threadId?.trim() || hashString(systemPrompt);

  const allTools = { ...toolkit, ...additionalTools };

  return new ToolLoopAgent({
    id: "chat-route-agent",
    model: openai.chat(modelId),
    instructions: systemPrompt,
    providerOptions: {
      anthropic: { cacheControl: { type: "ephemeral" } },
      openai: { promptCacheKey },
    },
    tools: allTools,
    stopWhen: stepCountIs(15),
  });
}
