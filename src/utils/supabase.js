import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  console.warn('Supabase env vars missing. Auth will not work until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnon || 'placeholder-anon-key'
);

// ── user_outputs table helpers ──────────────────────────────
// Table DDL (run once in Supabase SQL editor):
//
//   CREATE TABLE user_outputs (
//     id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//     user_id     UUID NOT NULL REFERENCES auth.users(id),
//     module_id   TEXT NOT NULL,
//     output_text TEXT,
//     updated_at  TIMESTAMPTZ DEFAULT now(),
//     UNIQUE (user_id, module_id)
//   );
//   ALTER TABLE user_outputs ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "own outputs select" ON user_outputs FOR SELECT USING (auth.uid() = user_id);
//   CREATE POLICY "own outputs insert" ON user_outputs FOR INSERT WITH CHECK (auth.uid() = user_id);
//   CREATE POLICY "own outputs update" ON user_outputs FOR UPDATE USING (auth.uid() = user_id);

export async function fetchUserOutputs(userId) {
  try {
    const { data, error } = await supabase
      .from('user_outputs')
      .select('module_id, output_text')
      .eq('user_id', userId);
    if (error) {
      console.warn('Supabase fetch outputs error:', error.message);
      return {};
    }
    return Object.fromEntries((data || []).map(row => [row.module_id, row.output_text]));
  } catch (e) {
    console.warn('Supabase fetch outputs exception:', e.message);
    return {};
  }
}

// ── user_profiles helpers ────────────────────────────────────
// Used by AuthContext to gate the workspace behind has_access.

export async function fetchUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('has_access, is_admin, granted_reason, workshop_id, access_expires_at, display_name')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      console.warn('Supabase fetch profile error:', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.warn('Supabase fetch profile exception:', e.message);
    return null;
  }
}

export async function adminListUsers() {
  const { data, error } = await supabase.rpc('admin_list_users');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function adminSetAccess(targetUserId, hasAccess, reason, notes) {
  const { error } = await supabase.rpc('admin_set_access', {
    target_user_id: targetUserId,
    new_has_access: hasAccess,
    new_reason: reason ?? null,
    new_notes:  notes  ?? null,
  });
  if (error) throw new Error(error.message);
}

// ── workshops ────────────────────────────────────────────────
// Public: anyone (incl. unauthenticated) can look up a workshop by slug.
// Returns { id, slug, name, ends_at, is_joinable } or null.
export async function getWorkshopBySlug(slug) {
  try {
    const { data, error } = await supabase.rpc('get_workshop_by_slug', {
      workshop_slug: slug,
    });
    if (error) {
      console.warn('Supabase get_workshop_by_slug error:', error.message);
      return null;
    }
    return (data && data[0]) || null;
  } catch (e) {
    console.warn('Supabase get_workshop_by_slug exception:', e.message);
    return null;
  }
}

// Called after a workshop attendee has signed up (so auth.uid() is set).
// Attaches them to the workshop. Returns the workshop_id on success.
export async function joinWorkshop(slug, displayName) {
  const { data, error } = await supabase.rpc('workshop_join', {
    workshop_slug:     slug,
    new_display_name:  displayName ?? null,
  });
  if (error) throw new Error(error.message);
  return data;
}

// Admin helpers
export async function adminListWorkshops() {
  const { data, error } = await supabase.rpc('admin_list_workshops');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function adminCreateWorkshop({ slug, name, endsAt, maxAttendees }) {
  const { data, error } = await supabase.rpc('admin_create_workshop', {
    new_slug:           slug,
    new_name:           name,
    new_ends_at:        endsAt,
    new_max_attendees:  maxAttendees ?? 50,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function adminListWorkshopAttendees(workshopId) {
  const { data, error } = await supabase.rpc('admin_list_workshop_attendees', {
    target_workshop_id: workshopId,
  });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function adminEndWorkshop(workshopId) {
  const { error } = await supabase.rpc('admin_end_workshop', {
    target_workshop_id: workshopId,
  });
  if (error) throw new Error(error.message);
}

export async function upsertUserOutput(userId, moduleId, outputText) {
  try {
    const { error } = await supabase
      .from('user_outputs')
      .upsert(
        { user_id: userId, module_id: moduleId, output_text: outputText, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,module_id' }
      );
    if (error) console.warn('Supabase upsert error:', error.message);
  } catch (e) {
    console.warn('Supabase upsert exception:', e.message);
  }
}
