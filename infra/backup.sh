#!/usr/bin/env bash
# Nightly backup: Postgres (app + n8n) and uploaded files. Keeps 14 days.
# Cron: 0 2 * * * cd /home/ubuntu/ortoped && ./infra/backup.sh >> /var/log/ortoped-backup.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
DIR=infra/backups
STAMP=$(date +%F-%H%M)
mkdir -p "$DIR"
docker compose exec -T db pg_dumpall -U "$POSTGRES_USER" | gzip > "$DIR/db-$STAMP.sql.gz"
docker run --rm -v "$(basename "$PWD")_uploads:/data:ro" -v "$PWD/$DIR:/out" alpine \
  tar czf "/out/uploads-$STAMP.tar.gz" -C /data .
find "$DIR" -name '*.gz' -mtime +14 -delete
echo "$(date -Is) backup ok: $STAMP"
# Restore: gunzip -c infra/backups/db-<stamp>.sql.gz | docker compose exec -T db psql -U "$POSTGRES_USER" -d postgres
