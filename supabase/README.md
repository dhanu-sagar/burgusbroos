# Burgusbroos Supabase Backend

This directory contains the database migration, schema, seed data, and configuration for Supabase PostgreSQL.

## Quick Setup Guide

### Option 1: Supabase Cloud (Recommended for production & multi-device sync)
1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. In the Supabase Project Dashboard, navigate to the **SQL Editor** on the left menu.
3. Open `migrations/20260927000000_init_burgusbroos.sql` from this folder, copy its contents, paste it into the SQL Editor, and click **Run**.
4. Navigate to **Project Settings** -> **API**.
5. Copy your **Project URL** and **anon public key**.
6. Set these values in your `.env.local` for the web frontend:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
7. For the Flutter app (`burgusbroos_flutter`), set these in `lib/constants/supabase_config.dart`.

### Option 2: Local Supabase CLI
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Initialize and start local Docker containers
supabase start

# Apply schema migrations
supabase db reset
```

## Database Tables Overview
| Table Name | Description | RLS Protected | Realtime Enabled |
|---|---|:---:|:---:|
| `user_settings` | Mode (Simple / Advanced), sound, hints, week start | Yes | Yes |
| `daily_records` | Daily highlight, micro-commitment, brain dump | Yes | Yes |
| `tasks` | 3-Bucket system (`must`, `should`, `could`), status, priority, project | Yes | Yes |
| `projects` | Project buckets, target dates, custom hex colors | Yes | Yes |
| `habits` | Daily habits, current streak, best streak, completion dates | Yes | Yes |
| `sprint_sessions` | Finished Pomodoro/Focus sprint history & creative logs | Yes | No |
| `active_sprints` | Realtime in-flight sprint state for cross-device continuation | Yes | Yes |
