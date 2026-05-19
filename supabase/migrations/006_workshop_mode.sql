-- Workshop Mode: time-boxed access for live workshop attendees.
-- After a workshop ends, attendees retain read-only access to their outputs.
--
-- Design:
--   * One `workshops` table holds the live event (slug, name, ends_at, etc).
--   * `user_profiles` gains workshop_id + access_expires_at columns.
--   * `current_user_has_access()` is extended so an active workshop attendee
--     (now() < access_expires_at) counts as having access.
--   * A new `current_user_has_readonly_access()` returns true for ANY workshop
--     attendee, regardless of expiry — used to allow SELECT on user_outputs
--     after the workshop ends so they can still view what they made.
--   * `user_outputs` RLS: SELECT allowed if has_access OR has_readonly_access;
--     INSERT/UPDATE/DELETE only if has_access (active workshop or paid).
--   * Public RPC `workshop_join(slug, display_name)` attaches the freshly
--     signed-up auth user to a workshop. Runs as SECURITY DEFINER, validates
--     the workshop exists + has capacity + has not ended.

-- ── 1. workshops table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workshops (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  name            text NOT NULL,
  starts_at       timestamptz NOT NULL DEFAULT now(),
  ends_at         timestamptz NOT NULL,
  max_attendees   int  NOT NULL DEFAULT 50,
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ended_early_at  timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workshops_slug_idx ON public.workshops (slug);

-- Slug shape: uppercase letters, digits, dashes only. Easy to read aloud.
ALTER TABLE public.workshops
  DROP CONSTRAINT IF EXISTS workshops_slug_format;
ALTER TABLE public.workshops
  ADD CONSTRAINT workshops_slug_format
  CHECK (slug ~ '^[A-Z0-9-]{3,32}$');

-- ── 2. user_profiles columns ────────────────────────────────────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS workshop_id         uuid REFERENCES public.workshops(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS access_expires_at   timestamptz,
  ADD COLUMN IF NOT EXISTS display_name        text;

CREATE INDEX IF NOT EXISTS user_profiles_workshop_id_idx
  ON public.user_profiles (workshop_id);

-- ── 3. Access functions ─────────────────────────────────────────────
-- Replaces the version from migration 002. An active workshop attendee
-- (workshop_id is set AND access_expires_at > now()) counts as having access.

CREATE OR REPLACE FUNCTION public.current_user_has_access()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (
      SELECT
        is_admin
        OR has_access
        OR (workshop_id IS NOT NULL AND access_expires_at IS NOT NULL AND access_expires_at > now())
      FROM public.user_profiles
      WHERE user_id = auth.uid()
    ),
    false
  );
$$;

-- Read-only access: true if the user is a workshop attendee, regardless of expiry.
-- Lets ex-attendees keep viewing their outputs after the workshop ends.
CREATE OR REPLACE FUNCTION public.current_user_has_readonly_access()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (
      SELECT workshop_id IS NOT NULL
      FROM public.user_profiles
      WHERE user_id = auth.uid()
    ),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.current_user_has_readonly_access() TO authenticated;

-- ── 4. user_outputs RLS — allow read-only after expiry ──────────────
DROP POLICY IF EXISTS "own outputs select" ON public.user_outputs;
DROP POLICY IF EXISTS "own outputs insert" ON public.user_outputs;
DROP POLICY IF EXISTS "own outputs update" ON public.user_outputs;
DROP POLICY IF EXISTS "own outputs delete" ON public.user_outputs;

CREATE POLICY "own outputs select"
  ON public.user_outputs FOR SELECT
  USING (
    auth.uid() = user_id
    AND (public.current_user_has_access() OR public.current_user_has_readonly_access())
  );

CREATE POLICY "own outputs insert"
  ON public.user_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.current_user_has_access());

CREATE POLICY "own outputs update"
  ON public.user_outputs FOR UPDATE
  USING (auth.uid() = user_id AND public.current_user_has_access())
  WITH CHECK (auth.uid() = user_id AND public.current_user_has_access());

-- ── 5. workshops RLS ────────────────────────────────────────────────
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read all workshops"    ON public.workshops;
DROP POLICY IF EXISTS "admins write all workshops"   ON public.workshops;
DROP POLICY IF EXISTS "attendees read own workshop"  ON public.workshops;

CREATE POLICY "admins read all workshops"
  ON public.workshops FOR SELECT
  USING (public.current_user_is_admin());

CREATE POLICY "admins write all workshops"
  ON public.workshops FOR ALL
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

-- Attendees can read their own workshop row (so the UI can show the workshop name).
CREATE POLICY "attendees read own workshop"
  ON public.workshops FOR SELECT
  USING (
    id = (
      SELECT workshop_id FROM public.user_profiles WHERE user_id = auth.uid()
    )
  );

-- ── 6. Admin RPCs ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_create_workshop(
  new_slug          text,
  new_name          text,
  new_ends_at       timestamptz,
  new_max_attendees int DEFAULT 50
)
RETURNS public.workshops
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.workshops;
BEGIN
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  INSERT INTO public.workshops (slug, name, ends_at, max_attendees, created_by)
  VALUES (upper(new_slug), new_name, new_ends_at, new_max_attendees, auth.uid())
  RETURNING * INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_workshops()
RETURNS TABLE (
  id              uuid,
  slug            text,
  name            text,
  starts_at       timestamptz,
  ends_at         timestamptz,
  max_attendees   int,
  ended_early_at  timestamptz,
  attendee_count  bigint,
  is_active       boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    w.id, w.slug, w.name, w.starts_at, w.ends_at, w.max_attendees, w.ended_early_at,
    (SELECT count(*) FROM public.user_profiles p WHERE p.workshop_id = w.id) AS attendee_count,
    (w.ended_early_at IS NULL AND w.ends_at > now()) AS is_active
  FROM public.workshops w
  WHERE public.current_user_is_admin()
  ORDER BY w.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_workshop_attendees(target_workshop_id uuid)
RETURNS TABLE (
  user_id            uuid,
  email              text,
  display_name       text,
  joined_at          timestamptz,
  access_expires_at  timestamptz,
  last_sign_in_at    timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    p.user_id,
    u.email::text,
    p.display_name,
    p.created_at,
    p.access_expires_at,
    u.last_sign_in_at
  FROM public.user_profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE p.workshop_id = target_workshop_id
    AND public.current_user_is_admin()
  ORDER BY p.created_at ASC;
$$;

CREATE OR REPLACE FUNCTION public.admin_end_workshop(target_workshop_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  -- Mark the workshop ended.
  UPDATE public.workshops
  SET ended_early_at = now()
  WHERE id = target_workshop_id;

  -- Expire all active attendees of this workshop. They keep workshop_id (so
  -- read-only access is preserved), but access_expires_at moves to now().
  UPDATE public.user_profiles
  SET access_expires_at = now()
  WHERE workshop_id = target_workshop_id
    AND (access_expires_at IS NULL OR access_expires_at > now());
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_workshop(text, text, timestamptz, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_workshops()                              TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_workshop_attendees(uuid)                 TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_end_workshop(uuid)                            TO authenticated;

-- ── 7. Public join RPC ──────────────────────────────────────────────
-- Called by the freshly signed-up auth user. Validates the workshop is
-- joinable (exists, not ended, not full) and attaches the user to it.

CREATE OR REPLACE FUNCTION public.workshop_join(
  workshop_slug    text,
  new_display_name text
)
RETURNS uuid -- the workshop_id they joined
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w                public.workshops;
  current_count    int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO w
  FROM public.workshops
  WHERE slug = upper(workshop_slug);

  IF w.id IS NULL THEN
    RAISE EXCEPTION 'workshop not found';
  END IF;

  IF w.ended_early_at IS NOT NULL OR w.ends_at <= now() THEN
    RAISE EXCEPTION 'workshop has ended';
  END IF;

  SELECT count(*) INTO current_count
  FROM public.user_profiles
  WHERE workshop_id = w.id;

  IF current_count >= w.max_attendees THEN
    RAISE EXCEPTION 'workshop is full';
  END IF;

  UPDATE public.user_profiles
  SET
    workshop_id       = w.id,
    access_expires_at = w.ends_at,
    display_name      = COALESCE(new_display_name, display_name),
    granted_reason    = COALESCE(granted_reason, 'workshop:' || w.slug)
  WHERE user_id = auth.uid();

  RETURN w.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.workshop_join(text, text) TO authenticated;

-- ── 8. Public RPC to look up a workshop by slug ─────────────────────
-- Called from the /?workshop=SLUG landing page BEFORE the user signs up,
-- so we can show them the workshop name and confirm it's joinable. Returns
-- only safe fields — no created_by, no created_at.

CREATE OR REPLACE FUNCTION public.get_workshop_by_slug(workshop_slug text)
RETURNS TABLE (
  id            uuid,
  slug          text,
  name          text,
  ends_at       timestamptz,
  is_joinable   boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    w.id, w.slug, w.name, w.ends_at,
    (w.ended_early_at IS NULL AND w.ends_at > now()
      AND (SELECT count(*) FROM public.user_profiles p WHERE p.workshop_id = w.id) < w.max_attendees
    ) AS is_joinable
  FROM public.workshops w
  WHERE w.slug = upper(workshop_slug);
$$;

GRANT EXECUTE ON FUNCTION public.get_workshop_by_slug(text) TO anon, authenticated;
