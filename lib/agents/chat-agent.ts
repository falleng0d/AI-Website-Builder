import { ToolLoopAgent, stepCountIs } from "ai";
import { createHash } from "node:crypto";
import { openai } from "@/lib/openai";

export interface ChatAgentContext {
  userName?: string;
  threadId?: string;
}

interface CreateChatAgentOptions {
  modelId: string;
  context?: ChatAgentContext;
}

export function hashString(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function buildChatSystemPrompt(context: ChatAgentContext = {}): string {
  const sections: string[] = [
    "You are web development assistant. You can answer in Markdown since the chat interface supports it.",
    "",
    "You have access to the following tools:",
    "No tools available for this chat.",
  ];

  if (context.userName) {
    sections.push("");
    sections.push(`You are chatting with: ${context.userName}`);
  }

  return sections.join("\n");
}

export function createChatAgent({ modelId, context = {} }: CreateChatAgentOptions): ToolLoopAgent {
  const systemPrompt = buildChatSystemPrompt(context);
  const promptCacheKey = context.threadId?.trim() || hashString(systemPrompt);

  return new ToolLoopAgent({
    id: "chat-route-agent",
    model: openai.chat(modelId),
    instructions: systemPrompt,
    providerOptions: {
      anthropic: { cacheControl: { type: "ephemeral" } },
      openai: { promptCacheKey },
    },
    tools: {},
    stopWhen: stepCountIs(15),
  });
}
