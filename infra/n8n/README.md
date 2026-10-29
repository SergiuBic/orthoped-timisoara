# n8n workflows

| File | Trigger | Action |
|---|---|---|
| `ingest.json` | Webhook `POST /webhook/ingest` (header `x-internal-secret`) | POST `/api/internal/ingest` (300 s timeout, 3 tries, 30 s apart) |
| `ingest-sweeper.json` | every 15 min | POST `/api/internal/ingest-pending` |
| `nightly-retention.json` | 03:30 Europe/Bucharest | POST `/api/internal/retention` |
| `weekly-reindex.json` | Sunday 04:00 | POST `/api/internal/reindex-site` |

Secrets are read from env (`INTERNAL_SECRET`, `WEB_INTERNAL_URL`); no n8n credentials needed.

## Import (also what `make n8n-import` should run)

```sh
docker compose exec n8n n8n import:workflow --separate --input=/workflows
for id in $(docker compose exec -T n8n n8n list:workflow | cut -d'|' -f1); do
  docker compose exec -T n8n n8n publish:workflow --id=$id   # n8n 2.x: update:workflow --all --active is deprecated/no-op
done
docker compose restart n8n   # activation is applied on restart
```

## Ideas for later
1. Weekly stats digest: query events/leads counts and show them in a dashboard note.
2. Google reviews fetch: pull new reviews weekly and store them for the site.
3. Unanswered chat questions: summarize questions with no good retrieval hit and suggest FAQ entries.
