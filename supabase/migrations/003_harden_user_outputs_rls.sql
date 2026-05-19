-- Tighten user_outputs RLS: even on own rows, require current_user_has_access().
-- This means non-paying users can never read or write workspace data,
-- even if they bypass the React paywall gate.
-- Applied to project mjtrsjpaigpruigsaygo on 2026-05-19 via Supabase MCP.

DROP POLICY IF EXISTS "own outputs select" ON public.user_outputs;
DROP POLICY IF EXISTS "own outputs insert" ON public.user_outputs;
DROP POLICY IF EXISTS "own outputs update" ON public.user_outputs;
DROP POLICY IF EXISTS "own outputs delete" ON public.user_outputs;

CREATE POLICY "own outputs select"
  ON public.user_outputs FOR SELECT
  USING (auth.uid() = user_id AND public.current_user_has_access());

CREATE POLICY "own outputs insert"
  ON public.user_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.current_user_has_access());

CREATE POLICY "own outputs update"
  ON public.user_outputs FOR UPDATE
  USING (auth.uid() = user_id AND public.current_user_has_access())
  WITH CHECK (auth.uid() = user_id AND public.current_user_has_access());
