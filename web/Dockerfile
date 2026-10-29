FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV SKIP_DB=1 NEXT_TELEMETRY_DISABLED=1
RUN pnpm build
# Self-contained migrate/seed scripts (all deps bundled).
RUN $(ls -d node_modules/.pnpm/esbuild@0.28*/node_modules/esbuild/bin/esbuild | head -1) scripts/migrate.ts scripts/seed.ts --bundle --platform=node --format=esm \
    --target=node24 --outdir=dist-scripts --out-extension:.js=.mjs \
    --banner:js="import{createRequire as __cr}from'module';const require=__cr(import.meta.url);"

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=build --chown=nextjs:nodejs /app/dist-scripts ./dist-scripts
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh && mkdir -p /data/uploads && chown nextjs:nodejs /data/uploads
USER nextjs
EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
