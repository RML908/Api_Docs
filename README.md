# DST_API_DOCS

Enterprise API Documentation Portal — Clean Architecture monorepo with separate Frontend and Backend.

## Architecture Overview

```
DST_API_DOCS/
├── backend/                          # Node.js/Express Clean Architecture API
│   └── src/
│       ├── DST_API_DOCS.Domain/      # Entities, enums, constants, domain events
│       ├── DST_API_DOCS.Application/ # DTOs, interfaces, services (CQRS)
│       ├── DST_API_DOCS.Infrastructure/ # JWT, password hashing, logging
│       ├── DST_API_DOCS.Persistence/ # Drizzle ORM, repositories, schema, seed
│       └── DST_API_DOCS.API/         # Controllers, middleware, routes, DI container
│   ├── Dockerfile
│   ├── drizzle.config.ts
│   ├── package.json
│   └── .env.example
│
├── frontend/                         # React 19 + Vite + TypeScript SPA
│   └── src/
│       ├── api/                      # Axios API clients (one file per resource)
│       ├── components/               # Reusable UI + common components
│       ├── contexts/                 # AuthContext with JWT + refresh token management
│       ├── hooks/                    # TanStack Query hooks
│       ├── layouts/                  # RootLayout, AdminLayout
│       ├── pages/                    # admin/ and public/ pages
│       ├── routes/                   # React Router v7 createBrowserRouter
│       ├── types/                    # TypeScript interfaces
│       └── utils/                    # cn(), apiError helper
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── .env.example
│
├── docker/postgres/init.sql
├── docs/DATABASE.md                  # ERD + migration/backup strategy
├── docker-compose.yml
├── .env.example
└── README.md
```

## Technology Stack

| Layer       | Technology                                          |
|-------------|-----------------------------------------------------|
| Frontend    | React 19, Vite 7, TypeScript 5, React Router 7      |
| State       | TanStack Query v5                                   |
| HTTP Client | Axios with JWT interceptors + auto-refresh          |
| Styling     | Tailwind CSS v4                                     |
| Forms       | React Hook Form + Zod                               |
| Backend     | Node.js 22, Express 5, TypeScript 5                 |
| Architecture| Clean Architecture (Domain/Application/Infra/API)  |
| Auth        | JWT (access 15m) + Refresh tokens (7d), bcryptjs   |
| Database    | PostgreSQL 16 + Drizzle ORM                        |
| Validation  | Zod schemas in Application layer                   |
| Logging     | Pino + pino-http                                    |
| API Docs    | Swagger/OpenAPI 3.1 at `/api/docs`                 |
| Rate Limit  | express-rate-limit (100 req/15min, auth 10/15min)  |
| Security    | Helmet, CORS, XSS headers, SQL injection via ORM   |
| Container   | Docker + Docker Compose, Nginx reverse proxy        |

## API Design

All responses use the envelope format:
```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "errors": []
}
```

Base path: `/api/v1/`

| Route                          | Method | Auth      | Description           |
|--------------------------------|--------|-----------|-----------------------|
| `/api/healthz`                 | GET    | Public    | Health check          |
| `/api/v1/auth/login`           | POST   | Public    | Login → JWT tokens    |
| `/api/v1/auth/refresh`         | POST   | Public    | Rotate refresh token  |
| `/api/v1/auth/logout`          | POST   | Public    | Revoke refresh token  |
| `/api/v1/auth/me`              | GET    | JWT       | Current user          |
| `/api/v1/groups`               | GET    | Public    | List groups           |
| `/api/v1/groups`               | POST   | JWT+Admin | Create group          |
| `/api/v1/groups/:id`           | PATCH  | JWT+Admin | Update group          |
| `/api/v1/groups/:id`           | DELETE | JWT+Admin | Soft-delete group     |
| `/api/v1/endpoints`            | GET    | Public    | List/filter endpoints |
| `/api/v1/endpoints/:id`        | GET    | Public    | Single endpoint       |
| `/api/v1/endpoints`            | POST   | JWT+Admin | Create endpoint       |
| `/api/v1/endpoints/:id`        | PATCH  | JWT+Admin | Update endpoint       |
| `/api/v1/endpoints/:id`        | DELETE | JWT+Admin | Soft-delete endpoint  |
| `/api/v1/changelogs`           | GET    | Public    | List changelogs       |
| `/api/v1/changelogs`           | POST   | JWT+Admin | Create changelog      |
| `/api/v1/changelogs/:id`       | PATCH  | JWT+Admin | Update changelog      |
| `/api/v1/changelogs/:id`       | DELETE | JWT+Admin | Soft-delete changelog |
| `/api/v1/stats`                | GET    | Public    | Dashboard stats       |
| `/api/v1/api-keys`             | GET    | JWT+Admin | List API keys         |
| `/api/v1/api-keys`             | POST   | JWT+Admin | Create API key        |
| `/api/v1/api-keys/:id/revoke`  | PATCH  | JWT+Admin | Revoke API key        |
| `/api/v1/api-keys/:id`         | DELETE | JWT+Admin | Delete API key        |
| `/api/docs`                    | GET    | Public    | Swagger UI            |

## Quick Start (Development)

### Prerequisites
- Node.js 22+, npm 10+
- PostgreSQL 16+ (or Docker)

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

npm install
npm run db:generate    # Generate Drizzle migrations from schema
npm run db:migrate     # Apply migrations
npm run db:seed        # Create admin user (username: admin, password: Admin@12345)
npm run dev            # Dev server on :8080
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Optionally set VITE_API_URL if backend is not at localhost:8080

npm install
npm run dev            # Vite dev server on :5173
```

Visit http://localhost:5173 (docs portal), http://localhost:5173/login (admin).

## Build & Deploy (Docker Compose)

### Generate JWT secrets
```bash
openssl rand -hex 64   # run twice, use for JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
```

### Start all services
```bash
cp .env.example .env
# Fill in POSTGRES_PASSWORD, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

docker-compose up -d --build

# Apply migrations and seed
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

Services: Frontend on :80, Backend on :8080, Swagger on http://localhost:8080/api/docs.

## Production Deployment (Linux + Nginx)

### Backend systemd service
```bash
# Build
cd /opt/dst-api-docs/backend && npm ci --omit=dev && npm run build

# /etc/systemd/system/dst-api-docs.service
[Unit]
Description=DST API Docs Backend
After=network.target postgresql.service
[Service]
User=www-data
WorkingDirectory=/opt/dst-api-docs/backend
EnvironmentFile=/opt/dst-api-docs/backend/.env
ExecStart=/usr/bin/node --enable-source-maps dist/DST_API_DOCS.API/index.js
Restart=on-failure
[Install]
WantedBy=multi-user.target

sudo systemctl enable --now dst-api-docs
```

### Frontend static with Nginx
```bash
cd /opt/dst-api-docs/frontend && npm ci && npm run build
sudo cp -r dist/* /var/www/dst-api-docs/

# Nginx reverse proxy: proxy /api/ to :8080, serve SPA from /var/www/dst-api-docs
# See frontend/nginx.conf for the full config template.
```

### SSL
```bash
sudo certbot --nginx -d api-docs.yourdomain.com
```

## Environment Variables

### Backend (`backend/.env`)
| Variable             | Required | Description                              |
|----------------------|----------|------------------------------------------|
| `NODE_ENV`           | Yes      | `development` / `staging` / `production` |
| `PORT`               | Yes      | Server port (8080)                       |
| `DATABASE_URL`       | Yes      | PostgreSQL connection string             |
| `JWT_ACCESS_SECRET`  | Yes      | 64-char random hex                       |
| `JWT_REFRESH_SECRET` | Yes      | 64-char random hex (different)           |
| `CORS_ORIGIN`        | Yes      | Comma-separated allowed frontend origins |
| `LOG_LEVEL`          | No       | `info` (default)                         |

### Frontend (`frontend/.env`)
| Variable        | Required | Description                             |
|-----------------|----------|-----------------------------------------|
| `VITE_API_URL`  | No       | Backend URL (blank = same origin proxy) |
| `VITE_APP_NAME` | No       | App name in UI                          |

## Database

See [docs/DATABASE.md](docs/DATABASE.md) for ERD, migration strategy, backup/restore procedures.

```bash
npm run db:generate   # Generate SQL migration from schema change
npm run db:migrate    # Apply pending migrations
npm run db:studio     # Drizzle Studio GUI (localhost:4983)
npm run db:seed       # Seed initial admin user
```

## Security

- JWT access tokens expire in **15 minutes**; refresh tokens in **7 days** with automatic rotation
- Passwords: bcrypt with 12 salt rounds
- API keys: SHA-256 hashed — raw key shown only once at creation
- Rate limits: 100 req/15min general, 10 req/15min on auth routes
- Helmet sets `X-Frame-Options`, `Content-Security-Policy`, etc.
- Soft delete — records are never physically removed, only flagged
- Audit columns (`created_by`, `updated_by`) on all domain entities


## Troubleshooting

**JWT secret errors on startup**
```bash
echo "JWT_ACCESS_SECRET=$(openssl rand -hex 64)" >> backend/.env
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 64)" >> backend/.env
```

**Database connection refused**
```bash
pg_isready -h localhost -p 5432
psql $DATABASE_URL -c "SELECT 1"
```

**CORS errors in browser**
```
CORS_ORIGIN must match the frontend origin exactly — no trailing slash.
Example: CORS_ORIGIN=http://localhost:5173
```

**Frontend blank page after build**
```
Ensure Nginx is configured with `try_files $uri $uri/ /index.html`
for the React Router SPA fallback.
```
