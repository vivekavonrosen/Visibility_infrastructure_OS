-- VisibilityOS paywall: user_profiles table + trigger + RLS + admin RPC functions.
-- Applied to project mjtrsjpaigpruigsaygo on 2026-05-19 via Supabase MCP.

-- 1. Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  has_access      boolean NOT NULL DEFAULT false,
  is_admin        boolean NOT NULL DEFAULT false,
  granted_reason  text,
  granted_at      timestamptz,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 2. updated_at touch trigger
CREATE OR REPLACE FUNCTION public.touch_user_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_profiles_set_updated_at ON public.user_profiles;
CREATE TRIGGER user_profiles_set_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_user_profiles_updated_at();

-- 3. Auto-create a profile row when a new auth.users row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, has_access)
  VALUES (NEW.id, false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 4. Backfill rows for existing users (default has_access=false)
INSERT INTO public.user_profiles (user_id, has_access)
SELECT id, false FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 5. Helper functions (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.user_profiles WHERE user_id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_has_access()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT (has_access OR is_admin) FROM public.user_profiles WHERE user_id = auth.uid()),
    false
  );
$$;

-- 6. RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own profile"    ON public.user_profiles;
DROP POLICY IF EXISTS "admins read all profiles"  ON public.user_profiles;
DROP POLICY IF EXISTS "admins update profiles"    ON public.user_profiles;

CREATE POLICY "users read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "admins read all profiles"
  ON public.user_profiles FOR SELECT
  USING (public.current_user_is_admin());

CREATE POLICY "admins update profiles"
  ON public.user_profiles FOR UPDATE
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

-- 7. Admin RPCs (callable by any authenticated user; the function body checks admin status)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id          uuid,
  email            text,
  has_access       boolean,
  is_admin         boolean,
  granted_reason   text,
  granted_at       timestamptz,
  notes            text,
  signed_up_at     timestamptz,
  last_sign_in_at  timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    p.user_id,
    u.email::text,
    p.has_access,
    p.is_admin,
    p.granted_reason,
    p.granted_at,
    p.notes,
    u.created_at,
    u.last_sign_in_at
  FROM public.user_profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE public.current_user_is_admin()
  ORDER BY u.created_at ASC;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_access(
  target_user_id uuid,
  new_has_access boolean,
  new_reason     text DEFAULT NULL,
  new_notes      text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.user_profiles
  SET
    has_access     = new_has_access,
    granted_reason = COALESCE(new_reason, granted_reason),
    notes          = COALESCE(new_notes, notes),
    granted_at     = CASE WHEN new_has_access THEN COALESCE(granted_at, now()) ELSE granted_at END
  WHERE user_id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_user_is_admin()                          TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_has_access()                        TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users()                               TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_access(uuid, boolean, text, text)      TO authenticated;
