import { createAgentUIStreamResponse, UIMessage } from "ai";
import { createChatAgent } from "@/lib/agents/chat-agent";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages, id: threadId }: { messages: UIMessage[]; id?: string } = await req.json();

  const modelId = z.string({ error: "DEFAULT_MODEL is required" }).min(1).parse(process.env.DEFAULT_MODEL);
  const parsedThreadId = z.string({ error: "threadId is required" }).min(1).parse(threadId);

  const agent = createChatAgent({
    modelId,
    context: {
      userName: "Anonymous",
      threadId: parsedThreadId,
    },
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
  });
}
