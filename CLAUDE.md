# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LEMS (Local Event Management System) is a full-stack application for managing FIRST LEGO League Challenge events. The project uses an Nx monorepo architecture with multiple apps and shared libraries.

## Commands

### Development

Start all main services:
```bash
npm run dev
```
This starts backend (port 3333), frontend (4200), portal, and admin (4201) in parallel.

Start the Python scheduler service:
```bash
# Windows
npm run scheduler

# Linux/macOS
cd apps/scheduler/src && python3 -m fastapi dev main.py
```

### Building

Build all applications:
```bash
npm run build
```

Build a specific app:
```bash
npx nx build <project-name>
# Examples: backend, frontend, portal, admin
```

### Linting

Lint all applications:
```bash
npm run lint
```

Lint a specific app:
```bash
npx nx lint <project-name>
```

### Database Migrations

Run database migrations:
```bash
npm run migrate
```
This builds the database library and executes migrations against PostgreSQL.

### Docker

Build Docker images (requires built /dist folder):
```bash
docker compose build
```

## Architecture

### Monorepo Structure

The codebase is organized into **apps** and **libs** using Nx:

- **apps/**: Application projects
  - `admin` - Admin dashboard (Next.js, port 4201)
  - `backend` - Express.js REST API and WebSocket server (port 3333)
  - `frontend` - Main user-facing app (Next.js, port 4200)
  - `portal` - Event portal interface (Next.js)
  - `scheduler` - Python FastAPI service for scheduling logic (port 8000)

- **libs/**: Shared libraries
  - `database` - Database access layer with Kysely (PostgreSQL) and MongoDB clients
  - `localization` - Internationalization resources
  - `presentations` - Presentation components
  - `season` - Season-specific logic and configuration
  - `shared` - Shared React components, hooks, and utilities
  - `types` - TypeScript type definitions
  - `utils` - Utility functions (arrays, objects, random)

### Database Architecture

LEMS uses a **dual-database** approach:
- **PostgreSQL**: Primary relational database using Kysely query builder
- **MongoDB**: Legacy database (being migrated away from)

The database module (`libs/database`) exports a `Database` class that provides:
- Kysely-based repositories for PostgreSQL tables (admins, seasons, teams, events, divisions, rooms, judging sessions, robot game matches, awards, event users)
- MongoDB client and collections
- S3-compatible object storage client (DigitalOcean Spaces)

Migrations are in `libs/database/src/migrations/` and are TypeScript files compiled to JavaScript before execution.

### Backend Architecture

The Express backend (`apps/backend/src/main.ts`) provides:
- REST API routes under `/api`, `/admin`, `/portal`, `/scheduler`, `/dashboard`
- WebSocket server using Socket.IO with namespace-based routing (`/division/:id`)
- Middleware for authentication, logging, and division validation
- Time synchronization endpoint (`/timesync`)
- Integration with the Python scheduler service

Key backend directories:
- `routers/`: API route handlers organized by feature area
- `middlewares/`: Express and WebSocket middleware
- `websocket/`: WebSocket event handlers
- `lib/`: Shared backend utilities (database, logger, dayjs config)

### Frontend Architecture

The Next.js frontends (admin, frontend, portal) use:
- **App Router** with server and client components
- **Emotion** for CSS-in-JS styling
- **MUI (Material-UI)** component library with RTL support
- **next-intl** for internationalization
- **SWR** for data fetching and caching
- **Socket.IO client** for real-time updates

Shared UI code lives in `libs/shared/src/lib/components` and `libs/shared/src/lib/hooks`.

### Scheduler Service

The Python FastAPI scheduler (`apps/scheduler`) handles scheduling algorithms for:
- Robot game match scheduling
- Judging session scheduling
- Room and table assignments

It communicates with the backend via HTTP and shares JWT-based authentication.

## TypeScript Path Aliases

The project uses path aliases defined in `tsconfig.base.json`:
- `@lems/database` - Database access layer
- `@lems/localization` - Localization resources
- `@lems/localization/*` - Individual locale files
- `@lems/presentations` - Presentation components
- `@lems/season` - Season configuration
- `@lems/shared` - Shared React components
- `@lems/shared/*` - Individual shared modules
- `@lems/types` - Type definitions
- `@lems/types/*` - Individual type modules
- `@lems/utils` - General utilities
- `@lems/utils/arrays` - Array utilities
- `@lems/utils/objects` - Object utilities
- `@lems/utils/random` - Random/ID generation utilities

## Environment Setup

### Prerequisites
- Node.js 22 LTS
- Docker Desktop
- Python 3.x (for scheduler)

### Database Setup

1. Start MongoDB container:
```bash
docker run -d --name lems-local-mongo -p 27017:27017 mongo:8
```

2. Start PostgreSQL container:
```bash
docker run -d --name lems-local-sql -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:17
```

3. Run migrations to initialize PostgreSQL:
```bash
npm run migrate
```

4. Manually insert an admin user into the database

### Environment Variables

Each app has a `.env.local` file for local development. Key variables:
- Database: `MONGODB_URI`, `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `DB_NAME`
- Authentication: `JWT_SECRET`, `DASHBOARD_JWT_SECRET`, `RECAPTCHA_SECRET_KEY`
- Scheduler: `SCHEDULER_URL`, `SCHEDULER_JWT_SECRET`
- Cloud Storage: `DIGITALOCEAN_ENDPOINT`, `DIGITALOCEAN_SPACE`, `DIGITALOCEAN_KEY`, `DIGITALOCEAN_SECRET`

## Key Patterns

### Database Access
Always use the exported repositories from `@lems/database` rather than direct database queries. The `Database` class automatically initializes connections and provides repository methods.

### API Routes
Backend routes are organized by application area (admin, portal, scheduler, etc.) in `apps/backend/src/routers/`. Routes follow RESTful conventions and use Express Router.

### WebSocket Communication
Real-time features use Socket.IO namespaces for division-specific updates. The namespace pattern is `/division/:divisionId`. All connections go through auth and validation middleware.

### Frontend Data Fetching
Use SWR hooks with the custom fetcher from `@lems/shared/fetch.ts`. This handles authentication, error handling, and caching consistently across all frontends.

### Migration Workflow
This repository is currently migrating from MongoDB to PostgreSQL. The "old" folder contains legacy LEMS code. New features should use PostgreSQL via Kysely repositories.

## Deployment

The project uses GitHub Actions for CI/CD:
- `.github/workflows/deploy-backend.yml` - Backend deployment
- `.github/workflows/deploy-admin.yml` - Admin app deployment
- `.github/workflows/deploy-scheduler.yml` - Scheduler deployment
- `.github/workflows/deploy-staging.yml` - Staging environment
- `.github/workflows/run-staging-migrations.yml` - Migration runner

Docker images are built from the `/dist` folder and pushed to DigitalOcean Container Registry. The production environment uses nginx for routing and Certbot for SSL certificates.
