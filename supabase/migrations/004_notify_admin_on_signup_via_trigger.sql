-- Extend the auth.users INSERT trigger to also POST to the Vercel notification endpoint.
-- This replaces the need for a Supabase Database Webhook UI configuration (which can't
-- target tables in the auth schema). The HTTP call uses pg_net (async, non-blocking)
-- and is wrapped in an exception block so notification failures never block signup.
-- Applied to project mjtrsjpaigpruigsaygo on 2026-05-19 via Supabase MCP.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1) Create the profile row (unchanged from migration 002)
  INSERT INTO public.user_profiles (user_id, has_access)
  VALUES (NEW.id, false)
  ON CONFLICT (user_id) DO NOTHING;

  -- 2) Fire-and-forget notification to /api/notify-signup
  BEGIN
    PERFORM net.http_post(
      url     := 'https://visibilityos.tech/api/notify-signup',
      headers := jsonb_build_object(
        'Content-Type',     'application/json',
        'x-webhook-secret', '8ffe0d8467d2e030cbdd6a08944215e653681fde87a5538ed6f7cc41e645a303'
      ),
      body    := jsonb_build_object(
        'type',   'INSERT',
        'table',  'users',
        'schema', 'auth',
        'record', jsonb_build_object(
          'id',         NEW.id,
          'email',      NEW.email,
          'created_at', NEW.created_at
        )
      )
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;  -- never block signup on notification failure
  END;

  RETURN NEW;
END;
$$;
