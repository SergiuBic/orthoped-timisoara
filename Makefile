.PHONY: dev-up dev-down migrate seed dev prod-up logs backup n8n-import
dev-up:
	docker compose -f docker-compose.dev.yml up -d
dev-down:
	docker compose -f docker-compose.dev.yml down
migrate:
	cd web && pnpm db:migrate
seed:
	cd web && pnpm db:seed
dev:
	cd web && pnpm dev
prod-up:
	docker compose up -d --build
logs:
	docker compose logs -f --tail=100
backup:
	@echo "TODO (task 11)"
n8n-import:
	@echo "TODO (task 09)"
