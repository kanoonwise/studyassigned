-- Extensions used across the schema.
create extension if not exists "pgcrypto" with schema public; -- gen_random_uuid()
create extension if not exists "pg_trgm" with schema public;  -- fast institution search (Phase 4)

-- Deadline status shared by institutions, authorities and deadlines.
create type deadline_status as enum
  ('verified', 'link_found', 'proxy', 'seasonality_only', 'manual_required');

-- App roles. Stored on profiles.role.
create type app_role as enum ('admin', 'verifier', 'ops', 'mentor', 'student');
