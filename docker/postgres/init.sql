-- DST_API_DOCS initial database setup
-- Drizzle migrations will handle schema creation
-- This file just sets encoding and extensions

\set ON_ERROR_STOP on

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for future full-text search

-- Create a read-only role for analytics/reporting
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'dst_readonly') THEN
    CREATE ROLE dst_readonly;
  END IF;
END $$;
