import type { UIMessage } from "ai";

type MessagePart = UIMessage["parts"][number];
type TextPart = Extract<MessagePart, { type: "text" }>;

export const CHAT_STARTER_PROMPTS = [
  "Build a modern landing page for a SaaS product with pricing cards.",
  "Generate a portfolio homepage with a hero, projects grid, and contact form.",
  "Create a restaurant website with menu sections and a reservation call-to-action.",
];

export function getMessageText(message: UIMessage): string {
  const textParts = message.parts.filter(
    (part): part is TextPart => part.type === "text",
  );

  const text = textParts.map((part) => part.text).join("\n").trim();
  if (text.length > 0) return text;

  return "(non-text response)";
}
