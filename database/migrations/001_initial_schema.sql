create extension if not exists pgcrypto;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null check (btrim(name) <> ''),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null check (btrim(title) <> ''),
  course text not null check (btrim(course) <> ''),
  due_date date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.study_plan_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  day text not null check (btrim(day) <> ''),
  task text not null check (btrim(task) <> ''),
  created_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date date not null,
  duration integer not null check (duration > 0),
  created_at timestamptz not null default now()
);

create index if not exists courses_user_created_at_idx
  on public.courses (user_id, created_at);

create index if not exists assignments_user_created_at_idx
  on public.assignments (user_id, created_at desc);

create index if not exists study_plan_items_user_created_at_idx
  on public.study_plan_items (user_id, created_at);

create index if not exists study_sessions_user_created_at_idx
  on public.study_sessions (user_id, created_at desc);