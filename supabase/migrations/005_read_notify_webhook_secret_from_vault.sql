-- Replace migration 004's hardcoded webhook secret with a Supabase Vault lookup.
-- The actual secret value is stored encrypted in vault.secrets under name
-- 'notify_webhook_secret' (created via direct SQL, not committed). This means
-- this migration file is safe to commit — it contains no secrets.
--
-- The old secret (the one embedded in migration 004, flagged by GitGuardian on
-- 2026-05-19) is now dead: this trigger only reads from Vault, and the matching
-- Vercel env var was rotated to the new value.
--
-- Applied to project mjtrsjpaigpruigsaygo on 2026-05-19 via Supabase MCP.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  webhook_secret text;
BEGIN
  -- 1) Create the profile row (unchanged from migration 002)
  INSERT INTO public.user_profiles (user_id, has_access)
  VALUES (NEW.id, false)
  ON CONFLICT (user_id) DO NOTHING;

  -- 2) Fire-and-forget notification to /api/notify-signup, reading the
  --    shared secret from Supabase Vault.
  BEGIN
    SELECT decrypted_secret INTO webhook_secret
    FROM vault.decrypted_secrets
    WHERE name = 'notify_webhook_secret'
    LIMIT 1;

    IF webhook_secret IS NOT NULL THEN
      PERFORM net.http_post(
        url     := 'https://visibilityos.tech/api/notify-signup',
        headers := jsonb_build_object(
          'Content-Type',     'application/json',
          'x-webhook-secret', webhook_secret
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
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;  -- never block signup on notification failure
  END;

  RETURN NEW;
END;
$$;
