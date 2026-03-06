FROM oven/bun:alpine AS deps
WORKDIR /app
ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/ai-website-builder
COPY package.json bun.lock prisma.config.ts ./
COPY prisma ./prisma
COPY lib/env.ts ./lib/env.ts
RUN bun install --frozen-lockfile

FROM deps AS builder
ARG DATABASE_URL=postgresql://postgres:postgres@db:5432/ai-website-builder

# TODO: Ideally this should not be needed, remove once refactoring is complete`
ARG HOSTNAME=0.0.0.0
ARG BETTER_AUTH_SECRET="***"
ARG BETTER_AUTH_URL="***"
ARG GITHUB_CLIENT_ID="***"
ARG GITHUB_CLIENT_SECRET="***"
ARG OPENAI_BASE_URL="***"
ARG OPENAI_API_KEY="***"
ARG DEFAULT_MODEL="***"

COPY . .
RUN bunx next build

FROM oven/bun:alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["sh", "-c", "bunx prisma migrate deploy && bunx next start -H 0.0.0.0 -p 3000"]
