import type { UISpec } from "./types";

const componentTreeFixture: UISpec = {
  root: "page-root",
  elements: {
    "page-root": {
      type: "Stack",
      props: {
        gap: "lg",
      },
      children: ["hero-card", "feature-grid", "cta-stack"],
    },
    "hero-card": {
      type: "Card",
      props: {
        title: "Studio Launch",
        description: "A clean test fixture for component tree coverage.",
      },
      children: ["hero-heading", "hero-copy"],
    },
    "hero-heading": {
      type: "Heading",
      props: {
        level: "h1",
        text: "Build faster with guided sections",
      },
    },
    "hero-copy": {
      type: "Text",
      props: {
        variant: "muted",
        text: "Inspect nested UI elements without asking the chat agent to create them.",
      },
    },
    "feature-grid": {
      type: "Grid",
      props: {
        columns: 2,
        gap: "md",
      },
      children: ["feature-card-a", "feature-card-b"],
    },
    "feature-card-a": {
      type: "Card",
      props: {
        title: "Tree View",
        description: "Collapsible structure",
      },
      children: ["feature-text-a"],
    },
    "feature-text-a": {
      type: "Text",
      props: {
        text: "Hovering a node highlights the matching preview element.",
      },
    },
    "feature-card-b": {
      type: "Card",
      props: {
        title: "Preview Sync",
        description: "Read-only inspection",
      },
      children: ["feature-text-b", "feature-button"],
    },
    "feature-text-b": {
      type: "Text",
      props: {
        text: "This fixture is loaded from the URL for deterministic E2E coverage.",
      },
    },
    "feature-button": {
      type: "Button",
      props: {
        label: "Read docs",
      },
    },
    "cta-stack": {
      type: "Stack",
      props: {
        direction: "horizontal",
        gap: "sm",
      },
      children: ["cta-text", "cta-badge"],
    },
    "cta-text": {
      type: "Text",
      props: {
        variant: "lead",
        text: "Ship polished interfaces faster.",
      },
    },
    "cta-badge": {
      type: "Badge",
      props: {
        text: "Fixture",
      },
    },
  },
};

const chatFixtures = {
  "component-tree": componentTreeFixture,
} as const satisfies Record<string, UISpec>;

export type ChatFixtureName = keyof typeof chatFixtures;

export function getChatFixtureSpec(fixtureName?: string) {
  if (!fixtureName) return undefined;
  return chatFixtures[fixtureName as ChatFixtureName];
}
