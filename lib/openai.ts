import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { type ModelsList, ModelsListSchema } from "./openai.schema";

const openaiBaseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const openaiApiKey = process.env.OPENAI_API_KEY;

export const openai = createOpenAI({
  baseURL: z.string().min(1).parse(openaiBaseUrl),
  apiKey: z.string().min(1).parse(openaiApiKey),
});

export async function listModels(): Promise<ModelsList> {
  const response = await fetch(`${openai}/models`, {
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`HTTP error status: ${response.status} - ${message}`);
  }

  const models = ModelsListSchema.parse(await response.json());

  // remove embedding models
  models.data = models.data.filter(m => !m.id.match(/text|embedding/));
  // remove image models
  models.data = models.data.filter(m => !m.id.includes("image"));
  // remove video models
  models.data = models.data.filter(m => !m.id.match(/vision|video|sora/));
  // remove audio models
  models.data = models.data.filter(m => !m.id.match(/audio|tts|transcribe/));

  models.total = models.data.length;

  return models;
}
