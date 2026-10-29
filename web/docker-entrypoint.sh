#!/bin/sh
set -e
node dist-scripts/migrate.mjs
node dist-scripts/seed.mjs          # idempotent: inserts only when empty
node server.js &
PID=$!
for i in $(seq 1 30); do wget -qO- http://localhost:3000/api/health >/dev/null 2>&1 && break; sleep 1; done
wget -qO- --header="x-internal-secret: $INTERNAL_SECRET" --post-data='' http://localhost:3000/api/internal/revalidate || true
wait $PID
