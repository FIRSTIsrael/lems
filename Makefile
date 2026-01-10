.PHONY: setup start stop

setup: ## Initial setup - start databases and install dependencies
	@echo "🚀 Starting LEMS setup..."
	@echo "📦 Installing dependencies..."
	npm install
	@echo "🐳 Starting database containers..."
	docker compose -f compose.dev.yml up -d
	@echo "⏳ Waiting for databases to be ready..."
	@sleep 5
	@echo "✅ Setup complete! Run 'npm run dev' to start development server"

start: ## Start the database containers
	@echo "🐳 Starting database containers..."
	docker compose -f compose.dev.yml up -d
	@echo "✅ Databases started"

stop: ## Stop the database containers
	@echo "🛑 Stopping database containers..."
	docker compose -f compose.dev.yml down
	@echo "✅ Databases stopped"
