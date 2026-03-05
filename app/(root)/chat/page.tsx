import { ChatWorkspace } from "@/components/chat";
import { useChatModels } from "@/hooks/use-chat-models";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function ChatPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const { defaultModelId, models } = await useChatModels();

  return <ChatWorkspace models={models} defaultModelId={defaultModelId} user={session?.user} />;
}
