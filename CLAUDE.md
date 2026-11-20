# PosterAi

App web para uma social media que atende várias empresas: gera carrosséis de Instagram (PNG 1080x1350) e edita vídeos curtos (corte de silêncio + legenda + logo, MP4 9:16), sempre com a identidade do **kit de marca** de cada cliente. O projeto de origem está descrito em "PosterAi — Projeto do MVP"; ele é ponto de partida e pode ser ajustado.

## Stack
Monorepo pnpm. Next.js 15 (App Router, TS, Tailwind 4) · Postgres + Prisma 6 · Redis + BullMQ · worker Node (ffmpeg, Playwright) · Docker Compose para deploy no Coolify (VPS).

```
apps/web         telas + API (só recebe pedidos e enfileira)
apps/worker      consumer BullMQ: render de slides, transcrição, render de vídeo
packages/db      schema Prisma + client (@posterai/db)
packages/templates  templates de carrossel em React (Fase 1)
storage/         uploads e exports (volume; fora do git)
```

## Comandos
- `pnpm install` · `pnpm typecheck` · `pnpm build`
- `pnpm db:generate` · `pnpm db:migrate` (dev, cria migration) · `pnpm db:deploy` (aplica)
- `pnpm dev:web` · `pnpm dev:worker` (precisam de Postgres e Redis; copie `.env.example` para `.env`)
- `docker compose --env-file .env up --build` sobe tudo (no Coolify, as `SERVICE_*` são geradas no deploy; veja o README)
- Não use `pnpm deploy` para migrations: é comando nativo do pnpm. Use `pnpm db:deploy`.

## Regras
1. Uma fase por vez; pedido pequeno e testável. Cada fase termina testada com um cliente real.
2. O web **nunca** faz trabalho pesado: cria registro + `Job` e enfileira. Render de PNG, ffmpeg e transcrição ficam no worker.
3. Nome do job BullMQ = valor do enum `JobType` (`CAROUSEL_RENDER`, `TRANSCRIBE`, `VIDEO_RENDER`); `data = { jobId, refId }`. Fila: `QUEUE_NAME` de `@posterai/db`.
4. Toda arte/vídeo lê cores, fontes, logo, tom de voz e estilo de legenda do kit do cliente. Nada de marca hardcoded.
5. Arquivos só dentro de `STORAGE_DIR`; no banco, guarde caminhos relativos a ele.
6. Segredos só por variável de ambiente; nunca commitar `.env`.
7. Auth: senha única (`APP_PASSWORD`), cookie JWT assinado com `SESSION_SECRET`, middleware protege tudo exceto `/login` e `/api/health`.
8. Interface em português do Brasil.
9. Migrations: sempre via `prisma migrate dev`; o worker roda `migrate deploy` ao subir.

## Roadmap
- **Fase 0 (feita):** monorepo, compose, schema, login, fila ponta a ponta com handlers stub.
- **Fase 1:** clientes + kit de marca, carrossel completo (3 templates, export ZIP).
- **Fase 2:** vídeo (upload, transcrição, revisão, corte de silêncio, legenda ASS, logo).
- **Fase 3:** legendas animadas (Remotion tem licença própria: conferir antes de vender como SaaS), refinamentos.
- Depois: entrada por WhatsApp (Evolution API + n8n), agendamento, aprovação do cliente, SaaS.
