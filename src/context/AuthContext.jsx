import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, fetchUserProfile } from '../utils/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(undefined); // undefined = loading
  const [user, setUser]         = useState(null);
  const [profile, setProfile]   = useState(undefined); // undefined = not loaded yet; null = no row

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load the user_profiles row whenever the user changes (login/logout/refresh)
  useEffect(() => {
    if (!user) { setProfile(null); return; }
    setProfile(undefined); // mark "loading" so the gate doesn't flash the paywall
    fetchUserProfile(user.id).then(setProfile);
  }, [user]);

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  }

  // Workshop attendees sign up with a random password they never see.
  // We then sign them in immediately. Email confirmation is off in Supabase,
  // so signUp returns a live session.
  async function signUpForWorkshop(email) {
    const randomPassword = crypto.randomUUID() + '-' + crypto.randomUUID();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: randomPassword,
    });
    if (error) return { error };
    // If signUp didn't auto-create a session (rare — only if confirmation is back on),
    // sign them in explicitly with the password we just generated.
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: randomPassword,
      });
      if (signInError) return { error: signInError };
    }
    return { data };
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signInWithMagicLink(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return { data, error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function resendConfirmation(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    return { error };
  }

  // Lets the admin page refresh the current user's profile after toggling their own access.
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const next = await fetchUserProfile(user.id);
    setProfile(next);
  }, [user]);

  const isLoading       = session === undefined || (!!user && profile === undefined);
  const isAuthenticated = !!session;
  const isAdmin         = !!(profile && profile.is_admin);

  // Active workshop = has workshop_id AND access_expires_at is in the future.
  // Computed in an effect (not render) so Date.now() stays out of the render
  // path; the timeout flips it to false the moment the workshop expires.
  const [workshopActive, setWorkshopActive] = useState(false);
  useEffect(() => {
    if (!profile?.workshop_id || !profile?.access_expires_at) {
      setWorkshopActive(false);
      return;
    }
    const expiresAt = new Date(profile.access_expires_at).getTime();
    const msUntilExpiry = expiresAt - Date.now();
    if (msUntilExpiry <= 0) {
      setWorkshopActive(false);
      return;
    }
    setWorkshopActive(true);
    const timer = setTimeout(() => setWorkshopActive(false), msUntilExpiry);
    return () => clearTimeout(timer);
  }, [profile?.workshop_id, profile?.access_expires_at]);
  // Paying / admin / active workshop attendee → full read-write access.
  const hasAccess = !!(profile && (profile.has_access || profile.is_admin || workshopActive));
  // Workshop attendee whose access has expired → read-only view of their work.
  const isReadonly = !!(profile?.workshop_id && !hasAccess);
  const workshopId = profile?.workshop_id ?? null;

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      isLoading,
      isAuthenticated,
      hasAccess,
      isAdmin,
      isReadonly,
      workshopId,
      signUp,
      signUpForWorkshop,
      signIn,
      signInWithMagicLink,
      signOut,
      resendConfirmation,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
