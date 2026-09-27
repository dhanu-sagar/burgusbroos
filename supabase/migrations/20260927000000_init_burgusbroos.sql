-- ====================================================================
-- BURGUSBROOS - SUPABASE POSTGRESQL DATABASE SCHEMA & MIGRATION
-- ====================================================================
-- Description: Complete backend schema for Burgusbroos productivity app.
-- Includes tables, custom enums, Row-Level Security (RLS) policies,
-- auto-updating timestamp triggers, and helper functions.
-- ====================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
do $$ begin
  create type bucket_type as enum ('must', 'should', 'could');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('not_started', 'in_progress', 'done', 'skipped');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_priority as enum ('high', 'medium', 'low');
exception when duplicate_object then null; end $$;

do $$ begin
  create type focus_quality as enum ('locked_in', 'distracted', 'rough');
exception when duplicate_object then null; end $$;

do $$ begin
  create type creative_log_type as enum ('insight', 'idea', 'breakthrough', 'note');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_mode as enum ('simple', 'advanced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type week_start_day as enum ('monday', 'sunday');
exception when duplicate_object then null; end $$;

-- 3. UPDATED_AT TRIGGER FUNCTION
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 4. USER SETTINGS TABLE
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mode app_mode not null default 'simple',
  week_start_day week_start_day not null default 'monday',
  gentle_nudges_enabled boolean not null default true,
  sound_enabled boolean not null default false,
  dismissed_hints jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger tr_user_settings_updated_at
  before update on public.user_settings
  for each row execute function update_updated_at_column();

-- 5. DAILY RECORDS TABLE
create table if not exists public.daily_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  brain_dump text not null default '',
  daily_highlight_text text not null default '',
  daily_highlight_done boolean not null default false,
  daily_highlight_completed_at timestamp with time zone,
  micro_commitment_text text not null default '',
  micro_commitment_done boolean not null default false,
  micro_commitment_habit_id uuid,
  micro_commitment_completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, date)
);

create index if not exists idx_daily_records_user_date on public.daily_records(user_id, date);

create trigger tr_daily_records_updated_at
  before update on public.daily_records
  for each row execute function update_updated_at_column();

-- 6. PROJECTS TABLE
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  color text default '#6366F1',
  target_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_projects_user on public.projects(user_id);

create trigger tr_projects_updated_at
  before update on public.projects
  for each row execute function update_updated_at_column();

-- 7. TASKS TABLE
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  bucket bucket_type not null default 'must',
  status task_status not null default 'not_started',
  priority task_priority not null default 'medium',
  due_date date,
  project_id uuid references public.projects(id) on delete set null,
  notes text,
  estimated_minutes integer,
  "order" integer not null default 0,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_tasks_user_bucket on public.tasks(user_id, bucket);
create index if not exists idx_tasks_user_status on public.tasks(user_id, status);
create index if not exists idx_tasks_project on public.tasks(project_id);

create trigger tr_tasks_updated_at
  before update on public.tasks
  for each row execute function update_updated_at_column();

-- 8. HABITS TABLE
create table if not exists public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  last_completed_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_habits_user on public.habits(user_id);

create trigger tr_habits_updated_at
  before update on public.habits
  for each row execute function update_updated_at_column();

-- 9. SPRINT SESSIONS TABLE
create table if not exists public.sprint_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  task_name text,
  bucket bucket_type,
  project_id uuid references public.projects(id) on delete set null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  planned_duration_sec integer not null default 1500,
  actual_duration_sec integer not null default 0,
  focus_quality focus_quality,
  ended_early boolean not null default false,
  notes text,
  creative_takeaway text,
  creative_log jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_sprint_sessions_user on public.sprint_sessions(user_id);
create index if not exists idx_sprint_sessions_task on public.sprint_sessions(task_id);
create index if not exists idx_sprint_sessions_start_time on public.sprint_sessions(user_id, start_time desc);

-- 10. ACTIVE SPRINT LIVE STATE (FOR REALTIME CROSS-DEVICE SYNC)
create table if not exists public.active_sprints (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_running boolean not null default false,
  is_paused boolean not null default false,
  task_id uuid references public.tasks(id) on delete set null,
  task_name text,
  bucket bucket_type,
  project_id uuid references public.projects(id) on delete set null,
  start_timestamp bigint not null default 0,
  accumulated_sec integer not null default 0,
  planned_duration_sec integer not null default 1500,
  creative_log jsonb not null default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger tr_active_sprints_updated_at
  before update on public.active_sprints
  for each row execute function update_updated_at_column();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each authenticated user can ONLY read and write their own data
-- ====================================================================

alter table public.user_settings enable row level security;
alter table public.daily_records enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.sprint_sessions enable row level security;
alter table public.active_sprints enable row level security;

-- user_settings policies
create policy "Users can view own settings" on public.user_settings
  for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on public.user_settings
  for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on public.user_settings
  for update using (auth.uid() = user_id);

-- daily_records policies
create policy "Users can view own daily records" on public.daily_records
  for select using (auth.uid() = user_id);
create policy "Users can insert own daily records" on public.daily_records
  for insert with check (auth.uid() = user_id);
create policy "Users can update own daily records" on public.daily_records
  for update using (auth.uid() = user_id);
create policy "Users can delete own daily records" on public.daily_records
  for delete using (auth.uid() = user_id);

-- projects policies
create policy "Users can view own projects" on public.projects
  for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects
  for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- tasks policies
create policy "Users can view own tasks" on public.tasks
  for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks
  for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- habits policies
create policy "Users can view own habits" on public.habits
  for select using (auth.uid() = user_id);
create policy "Users can insert own habits" on public.habits
  for insert with check (auth.uid() = user_id);
create policy "Users can update own habits" on public.habits
  for update using (auth.uid() = user_id);
create policy "Users can delete own habits" on public.habits
  for delete using (auth.uid() = user_id);

-- sprint_sessions policies
create policy "Users can view own sprint sessions" on public.sprint_sessions
  for select using (auth.uid() = user_id);
create policy "Users can insert own sprint sessions" on public.sprint_sessions
  for insert with check (auth.uid() = user_id);
create policy "Users can update own sprint sessions" on public.sprint_sessions
  for update using (auth.uid() = user_id);
create policy "Users can delete own sprint sessions" on public.sprint_sessions
  for delete using (auth.uid() = user_id);

-- active_sprints policies
create policy "Users can view own active sprint" on public.active_sprints
  for select using (auth.uid() = user_id);
create policy "Users can insert own active sprint" on public.active_sprints
  for insert with check (auth.uid() = user_id);
create policy "Users can update own active sprint" on public.active_sprints
  for update using (auth.uid() = user_id);
create policy "Users can delete own active sprint" on public.active_sprints
  for delete using (auth.uid() = user_id);

-- ====================================================================
-- AUTOMATIC USER PROVISIONING TRIGGER
-- When a user registers via Supabase Auth, initialize their default settings
-- ====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_settings (user_id, mode, week_start_day, gentle_nudges_enabled, sound_enabled)
  values (new.id, 'simple', 'monday', true, false)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable Supabase Realtime for live cross-device syncing
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.daily_records;
alter publication supabase_realtime add table public.active_sprints;
alter publication supabase_realtime add table public.habits;
alter publication supabase_realtime add table public.projects;
