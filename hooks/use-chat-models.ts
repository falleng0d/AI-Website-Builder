import { listModels } from "@/lib/openai";
import { z } from "zod";

export type ModelOption = {
  id: string;
  name: string;
  description?: string;
};

async function loadChatModels(defaultModelId: string): Promise<ModelOption[]> {
  try {
    const models = await listModels();
    const options = models.data.map((model) => ({
      id: model.id,
      name: model.id,
    }));

    if (!options.some((model) => model.id === defaultModelId)) {
      options.unshift({
        id: defaultModelId,
        name: defaultModelId,
      });
    }

    return options;
  } catch (error) {
    console.log("Failed to load models", error);
    return [
      {
        id: defaultModelId,
        name: defaultModelId,
      },
    ];
  }
}

export async function useChatModels() {
  const defaultModelId = z.string({ error: "DEFAULT_MODEL is required" }).min(1).parse(process.env.DEFAULT_MODEL);
  const models = await loadChatModels(defaultModelId);

  return { defaultModelId, models };
}
