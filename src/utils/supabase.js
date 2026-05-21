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
      .select('has_access, is_admin, granted_reason')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      console.warn('Supabase fetch profile error:', error.message);
      return null;
    }
    return data; // { has_access, is_admin, granted_reason } or null
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
