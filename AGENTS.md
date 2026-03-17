# Project Description

This is a Next.js 16 project with built-in authentication using BetterAuth.

## Initial Features

- Authentication with BetterAuth
- Google OAuth Login
- Modern UI
- Database integration

## 🛠️ Tech Stack

- Framework: Next.js 16
- Auth Provider: BetterAuth (Credentials & Github Login)
- Database: PostgreSQL with PrismaORM
- Styling: Tailwind CSS, ShadCN
- Routing: Next.js App Router
- Package Management: `bun`

## Dev Server

Runs on `https://darka.ayu-hamlet.ts.net` (proxies to port 3000, see ./dev/Caddyfile)

## Scripts

Run `cat package.json | jq -c -r '.scripts'` to see all scripts.

## Dependencies

Run `cat package.json | jq -c -r '{dependencies, devDependencies}'` to see all dependencies.

## File Structure (possibly outdated)

```
.
├── actions
│   ├── auth-actions.ts
│   └── github-auth-action.ts
├── app
│   ├── (admin)
│   │   └── dashboard
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── (auth)
│   │   ├── layout.tsx
│   │   ├── sign-in
│   │   │   └── page.tsx
│   │   └── sign-up
│   │       └── page.tsx
│   ├── (generated)
│   ├── (root)
│   │   ├── layout.tsx
│   │   ├── (home)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── chat
│   │       └── page.tsx
│   ├── api
│   │   ├── auth
│   │   │   └── [...all]
│   │   │       └── route.ts
│   │   └── chat
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── favicon.ico
├── components
│   ├── animate-ui
│   │   ├── backgrounds
│   │   │   └── stars.tsx
│   │   └── fade-in-view.tsx
│   ├── chat
│   │   ├── chat-composer.tsx
│   │   ├── chat-message-list.tsx
│   │   ├── chat-preview-panel.tsx
│   │   ├── chat-resize-handle.tsx
│   │   ├── chat-send-button.tsx
│   │   ├── chat-sidebar.tsx
│   │   ├── chat-top-bar.tsx
│   │   ├── chat-types.ts
│   │   ├── chat-workspace.tsx
│   │   └── index.ts
│   ├── ui
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── ...
│   ├── app-header.tsx
│   ├── app-sidebar.tsx
│   ├── ...
│   └── theme-provider.tsx
├── context
│   └── UserContext.tsx
├── features
├── hooks
│   ├── use-mobile.ts
│   ├── use-resizable.ts
│   └── use-chat-models.ts
├── lib
│   ├── agents
│   │   └── chat-agent.ts
│   ├── json-ui
│   │   ├── catalog.ts
│   │   └── registry.tsx
│   ├── tools
│   │   ├── toolkit.ts
│   │   └── ui-tools.ts
│   ├── auth-client.ts
│   ├── auth-schema.ts
│   ├── auth.ts
│   ├── chat-config.ts
│   ├── env.ts
│   ├── openai.schema.ts
│   ├── openai.ts
│   ├── prisma.ts
│   ├── types.ts
│   └── utils.ts
├── prisma
│   ├── migrations
│   └── schema.prisma
├── public
├── tests
│   └── auth-chat.spec.ts
├── .env
├── .example.env
├── .gitignore
├── .prettierrc.cjs
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── bun.lock
├── playwright.config.ts
├── postcss.config.mjs
├── prisma.config.ts
└── tsconfig.json
```

## E2E Tests

Run `bun run test:e2e` to run the E2E tests. Tests are in `tests/` (E.g. `tests/auth-chat.spec.ts``tests/generative-ui.spec.ts`)

## Code style

- Use `varName?: VarType` instead of `varName: VarType | undefined`
- Prefer undefined when a value is not available instead of null when possible
- Create modular pages instead of one offs, create folders for specific features such as `components/chat`
- Run `tscx` when you are done to check for type errors

## Agent Tools

Tools must be defined in lib/tools/<tool>.ts and then registered in lib/tools/toolkit.ts

Example tool:

```typescript
import { z } from "zod/v4";
import { tool } from "ai";

const toolSchema = z.object({});

type ToolParams = z.infer<typeof toolSchema>;

export default tool({
  description: "",
  inputSchema: toolSchema,
  execute: async ({ _ }: ToolParams) => {
    ...
  },
});
```

Make sure to always import from `zod/v4` when defining tools.

## Plan

We are implementing a website builder similar to bolt.new, lovable, bolt.diy, vercel v0, etc. The idea is to have a chat interface that uses AI to build websites. The user will chat with an AI assistant and the assistant will write the code for the website.
