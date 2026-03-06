import { createAgentUIStreamResponse, UIMessage } from "ai";
import { createChatAgent } from "@/lib/agents/chat-agent";
import type { UISpec } from "@/lib/json-ui/types";
import { createUITools } from "@/lib/tools/ui-tools";
import { z } from "zod";

const elementSchema = z.object({
  type: z.string(),
  props: z.record(z.string(), z.unknown()).default({}),
  children: z.array(z.string()).default([]),
});

const uiSpecSchema: z.ZodType<UISpec> = z.object({
  root: z.string().min(1),
  elements: z.record(z.string(), elementSchema),
});

export async function POST(req: Request) {
  const {
    messages,
    id: threadId,
    modelId: requestedModelId,
    currentUISpec,
  }: { messages: UIMessage[]; id?: string; modelId?: string; currentUISpec?: UISpec } = await req.json();

  const defaultModelId = z.string({ error: "DEFAULT_MODEL is required" }).min(1).parse(process.env.DEFAULT_MODEL);
  const parsedThreadId = z.string({ error: "threadId is required" }).min(1).parse(threadId);
  const parsedModelId = z.string().min(1).safeParse(requestedModelId);
  const parsedCurrentUISpec = uiSpecSchema.optional().safeParse(currentUISpec);

  const uiTools = createUITools(parsedCurrentUISpec.success ? parsedCurrentUISpec.data : undefined);

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
