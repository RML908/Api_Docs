# DST_API_DOCS — Database Architecture

## ERD (Entity-Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DST_API_DOCS Database                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌────────────────────┐
│      users       │       │   refresh_tokens    │
├──────────────────┤       ├────────────────────┤
│ id (PK)          │◄──────│ id (PK)             │
│ username (UNIQUE)│       │ user_id (FK→users)  │
│ email (UNIQUE)   │       │ token_hash (UNIQUE) │
│ password_hash    │       │ expires_at          │
│ role             │       │ revoked_at          │
│ last_login_at    │       │ replaced_by_token_h │
│ is_deleted       │       │ created_by_ip       │
│ deleted_at       │       │ created_at          │
│ created_at       │       │ updated_at          │
│ updated_at       │       └────────────────────┘
└──────┬───────────┘
       │ created_by / updated_by (audit FK)
       │
       ▼
┌──────────────────┐       ┌────────────────────┐
│      groups      │       │     endpoints      │
├──────────────────┤       ├────────────────────┤
│ id (PK)          │◄──────│ id (PK)             │
│ name             │       │ group_id (FK)       │
│ description      │       │ method              │
│ icon             │       │ path                │
│ sort_order       │       │ summary             │
│ is_deleted       │       │ description         │
│ deleted_at       │       │ status              │
│ created_by (FK)  │       │ version             │
│ updated_by (FK)  │       │ params (JSON str)   │
│ created_at       │       │ response_example    │
│ updated_at       │       │ response_status     │
└──────────────────┘       │ sort_order          │
                           │ is_deleted          │
                           │ deleted_at          │
                           │ created_by (FK)     │
                           │ updated_by (FK)     │
                           │ created_at          │
                           │ updated_at          │
                           └────────────────────┘

┌──────────────────┐       ┌────────────────────┐
│   changelogs     │       │     api_keys        │
├──────────────────┤       ├────────────────────┤
│ id (PK)          │       │ id (PK)             │
│ version          │       │ name                │
│ title            │       │ key_hash (UNIQUE)   │
│ content          │       │ key_prefix          │
│ published_at     │       │ is_active           │
│ is_deleted       │       │ last_used_at        │
│ deleted_at       │       │ created_by (FK)     │
│ created_by (FK)  │       │ created_at          │
│ updated_by (FK)  │       │ updated_at          │
│ created_at       │       └────────────────────┘
│ updated_at       │
└──────────────────┘
```

## Tables & Constraints

### `users`
| Column         | Type      | Constraints            | Notes                        |
|----------------|-----------|------------------------|------------------------------|
| id             | serial    | PK                     |                              |
| username       | text      | NOT NULL, UNIQUE       |                              |
| email          | text      | NOT NULL, UNIQUE       |                              |
| password_hash  | text      | NOT NULL               | bcrypt, 12 rounds            |
| role           | text      | NOT NULL, DEFAULT 'admin' | 'admin' or 'viewer'       |
| last_login_at  | timestamptz|                       |                              |
| is_deleted     | boolean   | NOT NULL, DEFAULT false | Soft delete                 |
| deleted_at     | timestamptz|                       |                              |
| created_at     | timestamptz| NOT NULL, DEFAULT now()|                             |
| updated_at     | timestamptz| NOT NULL, auto-updated |                              |

### `refresh_tokens`
| Column                  | Type      | Constraints              |
|-------------------------|-----------|--------------------------|
| id                      | serial    | PK                       |
| user_id                 | integer   | FK → users(id) ON DELETE CASCADE |
| token_hash              | text      | NOT NULL, UNIQUE         |
| expires_at              | timestamptz| NOT NULL                |
| revoked_at              | timestamptz|                         |
| replaced_by_token_hash  | text      |                          |
| created_by_ip           | text      |                          |

### `groups`
| Column      | Type      | Constraints                          |
|-------------|-----------|--------------------------------------|
| id          | serial    | PK                                   |
| name        | text      | NOT NULL                             |
| description | text      |                                      |
| icon        | text      | NOT NULL, DEFAULT '📁'              |
| sort_order  | integer   | NOT NULL, DEFAULT 0                  |
| is_deleted  | boolean   | NOT NULL, DEFAULT false              |
| created_by  | integer   | FK → users(id) ON DELETE SET NULL    |
| updated_by  | integer   | FK → users(id) ON DELETE SET NULL    |

**Indexes:** `groups_sort_order_idx`, `groups_is_deleted_idx`

### `endpoints`
| Column          | Type      | Constraints                       |
|-----------------|-----------|-----------------------------------|
| id              | serial    | PK                                |
| group_id        | integer   | FK → groups(id) ON DELETE CASCADE |
| method          | text      | NOT NULL, DEFAULT 'GET'           |
| path            | text      | NOT NULL                          |
| summary         | text      | NOT NULL                          |
| status          | text      | NOT NULL, DEFAULT 'draft'         |
| version         | text      | NOT NULL, DEFAULT 'v1'            |
| is_deleted      | boolean   | NOT NULL, DEFAULT false           |

**Indexes:** `endpoints_group_id_idx`, `endpoints_status_idx`, `endpoints_version_idx`, `endpoints_is_deleted_idx`, `endpoints_sort_order_idx`

### `changelogs`
| Column      | Type      | Constraints              |
|-------------|-----------|--------------------------|
| id          | serial    | PK                       |
| version     | text      | NOT NULL                 |
| title       | text      | NOT NULL                 |
| content     | text      | NOT NULL                 |
| published_at| timestamptz|                         |
| is_deleted  | boolean   | NOT NULL, DEFAULT false  |

**Indexes:** `changelogs_version_idx`, `changelogs_is_deleted_idx`

### `api_keys`
| Column      | Type      | Constraints              |
|-------------|-----------|--------------------------|
| id          | serial    | PK                       |
| name        | text      | NOT NULL                 |
| key_hash    | text      | NOT NULL, UNIQUE         |
| key_prefix  | text      | NOT NULL                 |
| is_active   | boolean   | NOT NULL, DEFAULT true   |

**Indexes:** `api_keys_is_active_idx`

## Migration Strategy

### Initial Setup
```bash
cd backend

# 1. Copy .env.example to .env and set DATABASE_URL
cp .env.example .env

# 2. Generate migration from schema
npm run db:generate

# 3. Apply migrations
npm run db:migrate

# 4. Seed initial admin user
npm run db:seed
```

### Rolling Migrations (CI/CD)
```bash
# Before each deployment
npm run db:migrate

# Drizzle tracks applied migrations in __drizzle_migrations table
```

### Backup Strategy
```bash
# Daily backup (add to cron)
pg_dump -Fc $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).dump

# Restore
pg_restore -d $DATABASE_URL backup_20260101_000000.dump
```

### Restore Strategy
```bash
# 1. Stop the application
docker-compose stop backend

# 2. Drop and recreate the database
psql $DATABASE_URL -c "DROP DATABASE dst_api_docs"
psql postgres://postgres:password@host/postgres -c "CREATE DATABASE dst_api_docs"

# 3. Restore from backup
pg_restore -d $DATABASE_URL backup_20260101_000000.dump

# 4. Restart
docker-compose start backend
```

## Soft Delete Pattern

All domain tables use soft delete:
- `is_deleted: boolean DEFAULT false`
- `deleted_at: timestamptz NULL`

All repository queries automatically filter `WHERE is_deleted = false`.
Hard delete is reserved for sensitive data (tokens, API keys).

## Audit Columns

Groups, Endpoints, and Changelogs carry:
- `created_by → users.id`
- `updated_by → users.id`

These are set by the application layer from the authenticated user's JWT payload.
