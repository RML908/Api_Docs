# API Documentation Portal

A full-stack API documentation portal where developer teams can publish and manage their REST API docs. Includes a public-facing docs browser and a full admin panel for CRUD management of endpoints and groups.

## Stack

| Layer | Tech |
|---|---|
| Monorepo | pnpm workspaces |
| Runtime | Node.js 24 |
| Language | TypeScript 5.9 |
| API Server | Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod v4 + drizzle-zod |
| API Contract | OpenAPI 3.0 + Orval codegen |
| Frontend | React 18 + Vite 7 |
| UI | Tailwind CSS v4 + shadcn/ui |
| Build | esbuild (server), Vite (client) |

## Project Structure

```
api-portal/
├── artifacts/
│   ├── api-server/          # Express 5 backend (port 8080, served at /api)
│   │   └── src/
│   │       ├── index.ts     # Server entry point
│   │       └── routes/      # groups.ts, endpoints.ts, stats.ts, health.ts
│   └── api-docs/            # React + Vite frontend (port 24034, served at /api-docs)
│       └── src/
│           ├── pages/       # PublicDocs.tsx, AdminDashboard.tsx, AdminGroups.tsx
│           └── components/  # Layout.tsx, EndpointCard.tsx, CommandPalette.tsx
├── lib/
│   ├── db/                  # Drizzle ORM schema + migrations
│   │   ├── src/schema/      # groups.ts, endpoints.ts
│   │   └── drizzle/         # Generated SQL migration files
│   ├── api-spec/            # OpenAPI 3.0 spec (openapi.yaml) + Orval config
│   ├── api-zod/             # Generated Zod validation schemas (from spec)
│   └── api-client-react/   # Generated React Query hooks (from spec)
└── scripts/                 # Shared utility scripts
```

## Local Development

### Prerequisites

- Node.js 24+
- pnpm 10+
- PostgreSQL 15+ (running locally or via Docker)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd api-portal
pnpm install
```

### 2. Set environment variables

Create a `.env` file in the repo root (or export these in your shell):

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/api_portal
SESSION_SECRET=change-me-to-a-random-string
```

> **PostgreSQL via Docker** (optional quick start):
> ```bash
> docker run -d --name pg \
>   -e POSTGRES_DB=api_portal \
>   -e POSTGRES_PASSWORD=password \
>   -p 5432:5432 postgres:15
> ```

### 3. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

This applies all Drizzle schema changes to your database. For a fresh install it creates the `groups` and `endpoints` tables.

### 4. (Optional) Seed sample data

```bash
DATABASE_URL=<your-url> pnpm --filter @workspace/scripts exec tsx scripts/src/seed.ts
```

Or run the seed script that's included at `scripts/src/seed.ts`.

### 5. Start development servers

Open two terminals:

```bash
# Terminal 1 — API server (http://localhost:8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (http://localhost:24034/api-docs/)
pnpm --filter @workspace/api-docs run dev
```

Then open http://localhost:24034/api-docs/ in your browser.

> **Tip:** On Replit, the reverse proxy handles routing automatically and both services are available under the same domain.

## Database Schema

### `groups`

| Column | Type | Notes |
|---|---|---|
| `id` | serial | Primary key |
| `name` | text | Required |
| `description` | text | Optional |
| `icon` | text | Emoji or symbol, default `📁` |
| `sort_order` | integer | Display order |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-updated |

### `endpoints`

| Column | Type | Notes |
|---|---|---|
| `id` | serial | Primary key |
| `group_id` | integer | FK → groups.id (cascade delete) |
| `method` | text | GET / POST / PUT / PATCH / DELETE |
| `path` | text | e.g. `/api/v1/users/:id` |
| `summary` | text | Short description |
| `description` | text | Long markdown description |
| `status` | text | `published` / `draft` / `deprecated` |
| `params` | text | JSON array of parameter objects |
| `response_example` | text | JSON string of example response |
| `response_status` | integer | HTTP status code e.g. 200 |
| `sort_order` | integer | Display order within group |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-updated |

**Parameter object shape** (stored as JSON string in `params`):
```json
[
  {
    "name": "id",
    "type": "integer",
    "in": "path",
    "required": true,
    "description": "Resource ID"
  }
]
```

### Migration files

SQL migration files are in `lib/db/drizzle/`. To regenerate after schema changes:

```bash
pnpm --filter @workspace/db run generate   # generate SQL
pnpm --filter @workspace/db run push       # apply to DB (dev only)
```

## API Endpoints

Base path: `/api`

| Method | Path | Description |
|---|---|---|
| GET | `/api/healthz` | Health check |
| GET | `/api/groups` | List all groups |
| POST | `/api/groups` | Create a group |
| PATCH | `/api/groups/:id` | Update a group |
| DELETE | `/api/groups/:id` | Delete a group (cascades) |
| GET | `/api/endpoints` | List endpoints (filter: `groupId`, `status`, `q`) |
| POST | `/api/endpoints` | Create an endpoint |
| GET | `/api/endpoints/:id` | Get one endpoint |
| PATCH | `/api/endpoints/:id` | Update an endpoint |
| DELETE | `/api/endpoints/:id` | Delete an endpoint |
| GET | `/api/stats` | Counts by status + group count |

## Regenerating API client code

If you change `lib/api-spec/openapi.yaml`, regenerate the Zod schemas and React Query hooks:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This updates `lib/api-zod/` and `lib/api-client-react/`.

## Deployment

### Replit (recommended — one click)

The project is pre-configured for Replit deployment. Click **Deploy** in the Replit UI. Replit provisions the PostgreSQL database automatically and the proxy routes traffic to both services.

After deploying, run the schema push from the Replit shell:

```bash
pnpm --filter @workspace/db run push
```

### Manual / VPS

1. Build both services:
   ```bash
   pnpm --filter @workspace/api-server run build
   pnpm --filter @workspace/api-docs run build
   ```

2. Set production environment variables on your server:
   ```env
   DATABASE_URL=postgresql://...
   SESSION_SECRET=<random-64-char-string>
   NODE_ENV=production
   PORT=8080
   ```

3. Run the API server:
   ```bash
   node artifacts/api-server/dist/index.mjs
   ```

4. Serve the frontend static files from `artifacts/api-docs/dist/` with any static file server (nginx, Caddy, etc.). Configure it to:
   - Serve at the `/api-docs/` base path
   - Proxy `/api/*` requests to the API server
   - Fall back to `index.html` for client-side routing

### nginx example config

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
    }

    location /api-docs/ {
        alias /var/www/api-portal/frontend/;
        try_files $uri $uri/ /api-docs/index.html;
    }
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open command palette |
| `↑` / `↓` | Navigate results |
| `Enter` | Jump to selection |
| `Esc` | Close palette |

## Development Commands

```bash
pnpm run typecheck              # Full typecheck (libs + all artifacts)
pnpm run build                  # Build everything
pnpm --filter @workspace/db run push        # Apply schema to DB
pnpm --filter @workspace/api-spec run codegen  # Regenerate API client
```
