import { createAgentUIStreamResponse, UIMessage } from "ai";
import { createChatAgent } from "@/lib/agents/chat-agent";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const modelId = z.string({ error: "DEFAULT_MODEL is required" }).min(1).parse(process.env.DEFAULT_MODEL);

  const agent = createChatAgent({
    modelId,
    context: { userName: "Anonymous" },
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
  });
}
