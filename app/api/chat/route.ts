import { createAgentUIStreamResponse, UIMessage } from "ai";
import { createChatAgent } from "@/lib/agents/chat-agent";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages, id: chatId }: { messages: UIMessage[]; id?: string } = await req.json();

  const modelId = z.string({ error: "DEFAULT_MODEL is required" }).min(1).parse(process.env.DEFAULT_MODEL);
  const parsedChatId = z.string({ error: "chatId is required" }).min(1).parse(chatId);

  const agent = createChatAgent({
    modelId,
    context: {
      userName: "Anonymous",
      chatId: parsedChatId,
    },
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
  });
}
