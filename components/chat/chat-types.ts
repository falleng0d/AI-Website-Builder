import type { DynamicToolUIPart, ToolUIPart, UIMessage } from "ai";

export type MessagePart = UIMessage["parts"][number];
export type TextPart = Extract<MessagePart, { type: "text" }>;
export type ToolPart = ToolUIPart | DynamicToolUIPart;

export const CHAT_STARTER_PROMPTS = [
  "Build a modern landing page for a SaaS product with pricing cards.",
  "Generate a portfolio homepage with a hero, projects grid, and contact form.",
  "Create a restaurant website with menu sections and a reservation call-to-action.",
];

export function isTextPart(part: MessagePart): part is TextPart {
  return part.type === "text";
}

export function isToolPart(part: MessagePart): part is ToolPart {
  return part.type === "dynamic-tool" || part.type.startsWith("tool-");
}

export function getMessageText(message: UIMessage): string {
  const textParts = message.parts.filter(isTextPart);

  const text = textParts
    .map((part) => part.text)
    .join("\n")
    .trim();
  if (text.length > 0) return text;

  return "(non-text response)";
}
