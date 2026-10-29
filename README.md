# Ortoped Timișoara — Dr. Andrea Pasquini

Proprietary. See [LICENSE](LICENSE).

Next.js 16 + Postgres/pgvector + Gemini AI assistant + n8n, shipped as one Docker Compose stack.
Public site in RO/EN/IT, 3D orthopedic scenes, admin dashboard (content, SEO city binding, stats, AI knowledge).

## Local (WSL2)
```bash
cp .env.example .env && cp .env.example web/.env.local   # fill secrets
make dev-up && make migrate && make seed
cd web && pnpm install && pnpm dev
```
Site: http://localhost:3000/ro · Admin: http://localhost:3000/admin · n8n: http://localhost:5678

## Production
