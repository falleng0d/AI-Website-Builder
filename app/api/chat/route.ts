import { createAgentUIStreamResponse, UIMessage } from "ai";
import { createChatAgent } from "@/lib/agents/chat-agent";
import { createUITools } from "@/lib/tools/ui-tools";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages, id: threadId, modelId: requestedModelId }: { messages: UIMessage[]; id?: string; modelId?: string } =
    await req.json();

  const defaultModelId = z.string({ error: "DEFAULT_MODEL is required" }).min(1).parse(process.env.DEFAULT_MODEL);
  const parsedThreadId = z.string({ error: "threadId is required" }).min(1).parse(threadId);
  const parsedModelId = z.string().min(1).safeParse(requestedModelId);

  const uiTools = createUITools();

  const agent = createChatAgent({
    modelId: parsedModelId.success ? parsedModelId.data : defaultModelId,
    context: {
      userName: "Anonymous",
      threadId: parsedThreadId,
    },
    additionalTools: uiTools,
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
  });
}
