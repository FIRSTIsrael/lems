# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LEMS (Local Event Management System) is a full-stack application for managing FIRST LEGO League Challenge events. The project uses **Nx monorepo** architecture with multiple applications and shared libraries, built with TypeScript, Node.js, Next.js, and Python (FastAPI).

## Repository Structure

### Applications (`apps/`)
- **backend**: Express server with GraphQL API (Apollo Server), WebSockets, REST endpoints, Redis queue management
  - Ports: 3333 (HTTP), WebSocket at `/lems/graphql`
  - Key modules: `routers/` (REST), `lib/graphql/` (GraphQL), `lib/queues/` (BullMQ workers)
- **frontend**: Next.js app (main LEMS interface) - port 4200
- **portal**: Next.js app (team portal interface) - port 3000
- **admin**: Next.js app (admin dashboard) - port 4201
- **scheduler**: Python/FastAPI service for event scheduling - port 8000

### Shared Libraries (`libs/`)
- **@lems/database**: Database layer with Kysely (PostgreSQL) and MongoDB clients, migrations, repositories, object storage (S3)
- **@lems/types**: TypeScript types and GraphQL schemas (`.graphql` files in `lib/api/lems/graphql/`)
- **@lems/shared**: React components, hooks, utilities, icons, rubrics, scoresheets
- **@lems/localization**: Material UI and Next.js localization utilities (RTL support, locale-sensitive components)
- **@lems/presentations**: Dynamic slide deck framework (based on Spectacle)

All TypeScript path aliases are configured in `tsconfig.base.json`.

## Development Commands

### Setup
```bash
# Install dependencies
npm install

# Start Docker services (MongoDB, PostgreSQL, Redis)
docker run -d --name lems-local-mongo -p 27017:27017 mongo:8
docker run -d --name lems-local-sql -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:17
docker run -d --name lems-local-redis -p 6379:6379 redis:7

# Run database migrations
npm run migrate
```

### Development Workflow
```bash
# Start all applications (backend, frontend, portal, admin)
npm run dev

# Run Python scheduler (platform-specific)
npm run scheduler

# Lint all projects
npm run lint

# Build all applications for production
npm run build
```

### Nx Commands
```bash
# Build specific project
npx nx build <project-name>

# Serve specific project
npx nx serve <project-name>

# Lint specific project
npx nx lint <project-name>

# Run multiple targets
npx nx run-many --target=<target> --projects=<project1>,<project2>
```

Project names: `backend`, `frontend`, `portal`, `admin`, `database`, `shared`, `presentations`, `types`, `localization`

## Architecture Notes

### Backend Service Architecture
- **GraphQL API**: Apollo Server with subscriptions over WebSocket (`/lems/graphql`)
- **REST API**: Separate routers in `apps/backend/src/routers/` for:
  - `lems`: Main LEMS API
  - `admin`: Admin operations (events, divisions, awards, schedule, pit-maps)
  - `portal`: Team portal operations
  - `scheduler`: Scheduler service integration
- **Queue System**: BullMQ with Redis for async job processing (session completion, match scoring)
  - Worker manager in `lib/queues/worker-manager.ts` handles event-driven jobs
  - Handlers in `lib/queues/handlers/` process events (session-completed, match-completed, match-endgame-triggered)
- **Real-time**: Redis pub/sub for GraphQL subscriptions
- **Logging**: Pino logger with file rotation in `lib/logger.ts`

### Frontend Architecture
- **Next.js 16** with App Router (locale routing at `[locale]`)
- **Material UI v7** with Emotion styling, RTL support via `@mui/stylis-plugin-rtl`
- **Apollo Client** for GraphQL with Next.js integration (`@apollo/client-integration-nextjs`)
- **SWR** for REST API data fetching
- **Authentication**: JWT cookies, handled by backend middleware
- All Next.js apps use similar structure: `src/app/[locale]/` for i18n routing

### Database Layer
- **PostgreSQL**: Kysely query builder, schema in `libs/database/src/schema/`, repositories in `repositories/`
- **MongoDB**: Native driver for legacy data
- **Redis**: IORedis client for caching, queues (BullMQ), and pub/sub
- **Migrations**: Run via `npm run migrate`, scripts in `libs/database/src/scripts/`
- **Object Storage**: S3-compatible (DigitalOcean Spaces) for file uploads

### Type System
- Shared types in `@lems/types` are the source of truth
- GraphQL schemas define API contracts (`.graphql` files)
- Backend copies GraphQL files to output during build (see `apps/backend/project.json`)

## Environment Variables

Each app has a `.template.env` file showing required variables. Key variables:

**Backend:**
- `MONGODB_URI`, `PG_*` (database connections)
- `REDIS_*` (Redis configuration)
- `JWT_SECRET`, `DASHBOARD_JWT_SECRET` (authentication)
- `DIGITALOCEAN_*` (file storage - optional for local dev)
- `RECAPTCHA_SECRET_KEY` (optional)
- `SCHEDULER_URL`, `SCHEDULER_JWT_SECRET`

**Frontend/Portal/Admin:**
- `NEXT_PUBLIC_BASE_URL` (build-time, embedded in bundle)
- `LOCAL_BASE_URL` (server-side runtime)
- `RECAPTCHA` (optional)

**Scheduler:**
- `LOCAL_BASE_URL`, `SCHEDULER_JWT_SECRET`

## Testing & CI

### Linting
Use `npm run lint` or `npx nx lint <project>`. ESLint configured via `eslint.config.mjs`.

### Building
Production builds go to `dist/` directory. Each app has separate build configuration in `project.json`.

### Docker
- `compose.yml` defines all services
- Each app has its own `Dockerfile`
- Images tagged as `${REGISTRY}/lems:<app>-${IMAGE_TAG}`
- GitHub Actions handle CI/CD (see `.github/workflows/`)

## Coding Patterns

### GraphQL Implementation
- Schema-first: Define `.graphql` schema files in `@lems/types`
- Resolvers in `apps/backend/src/lib/graphql/resolvers/`
- Use context for authentication (`GraphQLContext` with user)
- Subscriptions use Redis pub/sub

### Data Access Pattern
- Use repositories from `@lems/database` for data operations
- Kysely for type-safe PostgreSQL queries
- MongoDB client for legacy collections
- Keep business logic in backend, not in repositories

### React Components
- Use Material UI components from `@mui/material`
- Emotion for styling (`@emotion/styled`, `@emotion/react`)
- Shared components in `@lems/shared/components`
- Use `next-intl` for i18n in Next.js apps

### Queue/Worker Pattern
- Define job types in `lib/queues/types.ts`
- Implement handlers in `lib/queues/handlers/`
- Register handlers in `main.ts` via `workerManager.registerHandler()`
- Use `scheduledEventsQueue` for delayed jobs

## Important Notes

- **Nx caching**: Build outputs are cached in `.nx/cache/`. Use `--skip-nx-cache` to bypass.
- **Monorepo dependencies**: Libraries can depend on each other. Backend/frontend apps import from `@lems/*` aliases.
- **GraphQL schema location**: Always in `libs/types/src/lib/api/*/graphql/`, backend copies them during build
- **Port conflicts**: Ensure ports 3000, 3333, 4200, 4201, 8000 are available
- **Database initialization**: After first `npm run migrate`, manually insert an admin user via SQL
- **Redis requirement**: Backend will not start without Redis connection
- **Platform-specific commands**: Use `npm run scheduler` (uses `run-script-os` for cross-platform support)
