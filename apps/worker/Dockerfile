FROM node:22-bookworm-slim
# ffmpeg para vídeo; fontes e libs do Chromium (Playwright) para render de slides
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates ffmpeg fonts-liberation fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN DATABASE_URL=postgresql://x:x@localhost/x pnpm db:generate
# Chromium do Playwright (render dos slides)
RUN pnpm --filter @posterai/worker exec playwright install --with-deps chromium
ENV NODE_ENV=production
# Aplica migrations pendentes e sobe o worker
CMD ["sh", "-c", "pnpm db:deploy && pnpm --filter @posterai/worker start"]
