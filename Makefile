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
	./infra/backup.sh
n8n-import:
	docker compose exec n8n n8n import:workflow --separate --input=/workflows
	for id in $$(docker compose exec -T n8n n8n list:workflow | cut -d'|' -f1); do docker compose exec -T n8n n8n publish:workflow --id=$$id; done
	docker compose restart n8n
