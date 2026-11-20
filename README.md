# PosterAi
Gerador de carrosséis e editor de vídeos curtos com kit de marca por cliente. Veja `CLAUDE.md`.

## Deploy no Coolify
Crie um recurso "Docker Compose" apontando para este repositório (branch `main`). No primeiro deploy o
Coolify gera sozinho:
- `SERVICE_PASSWORD_APP` — a senha de login do app
- `SERVICE_PASSWORD_64_SESSION` — segredo da sessão
- `SERVICE_PASSWORD_POSTGRES` — senha do banco
- `SERVICE_FQDN_WEB_3000` — domínio do app (edite para o seu domínio)

Os valores ficam em Environment Variables do recurso. Chaves de API (`ANTHROPIC_API_KEY` etc.) você adiciona lá, nas fases 1 e 2.

## Local
```bash
cp .env.example .env   # preencha SERVICE_PASSWORD_APP, SERVICE_PASSWORD_64_SESSION e SERVICE_PASSWORD_POSTGRES
docker compose --env-file .env up --build
```
