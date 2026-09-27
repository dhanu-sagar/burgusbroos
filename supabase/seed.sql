-- ====================================================================
-- BURGUSBROOS - SUPABASE SEED DATA (OPTIONAL / TESTING)
-- ====================================================================
-- To test with an authenticated user, replace YOUR_USER_ID with your
-- Supabase auth user UUID (from auth.users table).
-- ====================================================================

-- Example:
-- DO $$
-- DECLARE
--   test_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- Replace with actual UUID
-- BEGIN
--   -- Insert Projects
--   INSERT INTO public.projects (id, user_id, name, description, color, target_date)
--   VALUES 
--     ('a1111111-1111-1111-1111-111111111111', test_user_id, 'Deep Work & Systems', 'Productivity architectures and cognitive flow', '#6366F1', '2026-10-15'),
--     ('a2222222-2222-2222-2222-222222222222', test_user_id, 'App Launch', 'Cross-platform app development with Flutter & Supabase', '#10B981', '2026-11-01')
--   ON CONFLICT (id) DO NOTHING;

--   -- Insert Habits
--   INSERT INTO public.habits (id, user_id, name, current_streak, best_streak)
--   VALUES
--     ('b1111111-1111-1111-1111-111111111111', test_user_id, 'Morning Brain Dump', 5, 14),
--     ('b2222222-2222-2222-2222-222222222222', test_user_id, '25-Minute Focus Sprint', 3, 9)
--   ON CONFLICT (id) DO NOTHING;

--   -- Insert Tasks
--   INSERT INTO public.tasks (user_id, name, bucket, status, priority, estimated_minutes, project_id)
--   VALUES
--     (test_user_id, 'Complete Supabase backend integration', 'must', 'in_progress', 'high', 30, 'a1111111-1111-1111-1111-111111111111'),
--     (test_user_id, 'Test Flutter cross-platform mobile views', 'should', 'not_started', 'medium', 45, 'a2222222-2222-2222-2222-222222222222'),
--     (test_user_id, 'Review weekly report analytics', 'could', 'not_started', 'low', 15, null);

-- END $$;
