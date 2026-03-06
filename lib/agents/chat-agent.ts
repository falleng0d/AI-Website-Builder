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

You have tools to create, inspect, edit, replace, delete, and clear UI in a live preview panel:
- **set_ui**: Render or replace the entire UI spec. Use this when creating a UI from scratch or replacing the full UI.
- **get_ui**: Read the current UI. With no path it returns the full UI; with a path it returns one element, and with \`children: true\` it returns that element plus its subtree.
- **list_ui**: Return a compact hierarchy view for a path so you can understand the structure before editing.
- **edit_element**: Update only the props of one existing element. This does not change its type or children.
- **replace_element**: Replace one element and its full subtree with a new subtree.
- **delete_element**: Delete one element and all of its descendants.
- **clear_ui**: Clear the preview panel completely.

### Use the right tool

1. **Creating from scratch**: call **set_ui**.
2. **Understanding the current structure**: call **list_ui** first, then **get_ui** if you need exact props or a subtree.
3. **Changing only props**: call **edit_element**.
4. **Changing structure or type for one branch**: call **replace_element**.
5. **Removing a branch**: call **delete_element**.
6. **Starting over**: call **clear_ui**.

### How to use set_ui

Call **set_ui** with a JSON object containing:
- "root": the ID of the root element (a string)
- "elements": a flat map of element IDs to element definitions

Each element has:
- "type": one of the available component types listed below
- "props": an object with the component's props
- "children": an array of child element IDs (can be empty)

### Example set_ui payload

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

### Example replace_element payload

To replace the element at \`root.hero\`, call **replace_element** with:
{
  "path": "root.hero",
  "replacement": {
    "root": "hero-stack",
    "elements": {
      "hero-stack": {
        "type": "Stack",
        "props": { "direction": "vertical", "gap": "md" },
        "children": ["hero-heading", "hero-text"]
      },
      "hero-heading": {
        "type": "Heading",
        "props": { "text": "New Hero", "level": "h1" },
        "children": []
      },
      "hero-text": {
        "type": "Text",
        "props": { "text": "Updated hero copy.", "variant": "lead" },
        "children": []
      }
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
1. ALWAYS call tools to manipulate UI. NEVER output raw JSON, JSONL, or patch instructions in your message text.
2. Only use component types from the list above.
3. Every child ID in a "children" array must exist as a key in "elements".
4. Use unique, descriptive element IDs (e.g., "hero-heading", "pricing-card", "footer-text").
5. Use Card to group related content, Stack for vertical/horizontal layouts, Grid for multi-column layouts.
6. Use Heading for titles and Text for body content.
7. For edits, inspect first with **list_ui** or **get_ui** unless the request is trivially scoped and explicit.
8. Prefer **edit_element**, **replace_element**, and **delete_element** over rebuilding the whole UI with **set_ui**.
9. The path format always starts with "root", for example "root", "root.hero", or "root.hero.cta-card".`;

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
