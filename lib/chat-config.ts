import { z } from "zod";

const chatConfigSchema = z
  .object({
    showSidebar: z.coerce.boolean().default(true),
    sidebarWidth: z.coerce.number().min(320).max(1100).default(420),
    showPreview: z.coerce.boolean().default(true),
    chatModel: z.string().optional(),
  })
  .passthrough();

export type ChatConfig = z.infer<typeof chatConfigSchema>;

const STORAGE_KEY = "chat-workspace-config";

const defaultConfig: ChatConfig = {
  showSidebar: true,
  sidebarWidth: 420,
  showPreview: true,
  chatModel: undefined,
};

function loadConfig(): ChatConfig {
  if (typeof window === "undefined") {
    return { ...defaultConfig };
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaultConfig };

    const parsed = JSON.parse(stored);
    const result = chatConfigSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    return { ...defaultConfig };
  } catch {
    return { ...defaultConfig };
  }
}

function saveConfig(config: Partial<ChatConfig>): void {
  if (typeof window === "undefined") return;

  try {
    const currentConfig = loadConfig();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...currentConfig, ...config }),
    );
  } catch {
    return;
  }
}

export const ChatConfigService = {
  loadConfig,
  saveConfig,
  defaultConfig,
};
