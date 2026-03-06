import { ToolLoopAgent, stepCountIs, type Tool } from "ai";
import { createHash } from "node:crypto";
import { openai } from "@/lib/openai";
import { toolkit } from "@/lib/tools/toolkit";

export interface ChatAgentContext {
  userName?: string;
  threadId?: string;
}

interface CreateChatAgentOptions {
  modelId: string;
  context?: ChatAgentContext;
  additionalTools?: Record<string, Tool>;
}

export function hashString(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

const UI_SPEC_PROMPT = `## UI Generation

You have tools to create, read, and clear UI in a live preview panel:
- **set_ui**: Renders a UI spec in the preview panel. ALWAYS use this tool when the user asks you to build, create, or design something.
- **get_ui**: Returns the current UI spec from the preview panel so you can inspect it before making edits.
- **clear_ui**: Clears the preview panel.

### How to use set_ui

Call the set_ui tool with a JSON object containing:
- "root": the ID of the root element (a string)
- "elements": a flat map of element IDs to element definitions

Each element has:
- "type": one of the available component types listed below
- "props": an object with the component's props
- "children": an array of child element IDs (can be empty)

### Example

To create a card with a heading and some text, call set_ui with:
{
  "root": "card-1",
  "elements": {
    "card-1": {
      "type": "Card",
      "props": { "title": "My Card" },
      "children": ["heading-1", "text-1"]
    },
    "heading-1": {
      "type": "Heading",
      "props": { "text": "Welcome", "level": "h2" },
      "children": []
    },
    "text-1": {
      "type": "Text",
      "props": { "text": "This is some body text inside the card.", "variant": "body" },
      "children": []
    }
  }
}

### Available Components

**Layout:**
- Card: { title?: string, description?: string, maxWidth?: "sm" | "md" | "lg" | "full", centered?: boolean } — Container card for content sections [accepts children]
- Stack: { direction?: "horizontal" | "vertical", gap?: "none" | "sm" | "md" | "lg", align?: "start" | "center" | "end" | "stretch", justify?: "start" | "center" | "end" | "between" | "around" } — Flex container [accepts children]
- Grid: { columns?: number, gap?: "sm" | "md" | "lg" } — Grid layout, 1-6 columns [accepts children]
- Separator: { orientation?: "horizontal" | "vertical" } — Visual divider line

**Content:**
- Heading: { text: string, level?: "h1" | "h2" | "h3" | "h4" } — Heading text
- Text: { text: string, variant?: "body" | "caption" | "muted" | "lead" | "code" } — Paragraph text

### Rules
1. ALWAYS use the set_ui tool to render UI. NEVER output raw JSON/JSONL in your message text.
2. Only use component types from the list above.
3. Every child ID in a "children" array must exist as a key in "elements".
4. Use unique, descriptive element IDs (e.g., "hero-heading", "pricing-card", "footer-text").
5. Use Card to group related content, Stack for vertical/horizontal layouts, Grid for multi-column layouts.
6. Use Heading for titles and Text for body content.
7. When editing, call get_ui first to see the current state, then call set_ui with the full updated spec.`;

export function buildChatSystemPrompt(context: ChatAgentContext = {}): string {
  const sections: string[] = [
    "You are a web development assistant that can build UI designs.",
    "You can answer in Markdown since the chat interface supports it.",
    "",
    UI_SPEC_PROMPT,
  ];

  if (context.userName) {
    sections.push("");
    sections.push(`You are chatting with: ${context.userName}`);
  }

  return sections.join("\n");
}

export function createChatAgent({ modelId, context = {}, additionalTools }: CreateChatAgentOptions): ToolLoopAgent {
  const systemPrompt = buildChatSystemPrompt(context);
  const promptCacheKey = context.threadId?.trim() || hashString(systemPrompt);

  const allTools = { ...toolkit, ...additionalTools };

  return new ToolLoopAgent({
    id: "chat-route-agent",
    model: openai.chat(modelId),
    instructions: systemPrompt,
    providerOptions: {
      anthropic: { cacheControl: { type: "ephemeral" } },
      openai: { promptCacheKey },
    },
    tools: allTools,
    stopWhen: stepCountIs(15),
  });
}
