import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import { createHash } from "node:crypto";
import { openai } from "@/lib/openai";
import { z } from "zod";

export function hashString(text: string): string {
  return createHash("sha256")
  .update(text, "utf8")
  .digest("hex"); // stable, readable
}

interface ChatContext {
  userName: string;
}

async function buildSystemPrompt(context: ChatContext): Promise<string> {
  const sections: string[] = [
    "You are web development assistant. You can answer in Markdown since the chat interface supports it.",
    "",
    "You have access to the following tools:",
    "No tools available for this chat."
  ];

  if (context.userName) {
    sections.push("");
    sections.push(`You are chatting with: ${context.userName}`);
  }

  return sections.join("\n");
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const modelId = z.string({error: "DEFAULT_MODEL is required"}).min(1).parse(process.env.DEFAULT_MODEL);

  const systemPrompt = await buildSystemPrompt({
    userName: "Anonymous",
  });

  const result = streamText({
    model: openai.chat(modelId),
    messages: await convertToModelMessages(messages),
    providerOptions: {
      anthropic: { cacheControl: { type: 'ephemeral' } },
      openai: { promptCacheKey: hashString(systemPrompt) },
    },
    system: systemPrompt,
    tools: {},
    stopWhen: stepCountIs(15),
  });

  return result.toUIMessageStreamResponse();
}
