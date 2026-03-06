import { ChatWorkspace } from "@/components/chat";
import { useChatModels } from "@/hooks/use-chat-models";
import { getChatFixtureSpec } from "@/lib/json-ui/test-fixtures";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type SearchParams = Record<string, string | string[] | undefined>;

type ChatPageProps = {
  searchParams?: Promise<SearchParams> | SearchParams;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { defaultModelId, models } = await useChatModels();
  const resolvedSearchParams = (await searchParams) ?? {};
  const fixtureParam = resolvedSearchParams.fixture;
  const fixtureName = Array.isArray(fixtureParam) ? fixtureParam[0] : fixtureParam;
  const initialSpec = getChatFixtureSpec(fixtureName);

  return <ChatWorkspace models={models} defaultModelId={defaultModelId} initialSpec={initialSpec} user={session?.user} />;
}
