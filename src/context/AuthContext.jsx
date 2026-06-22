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

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  // Passwordless sign-in via a 6-digit email code (OTP).
  // We deliberately use a code rather than a clickable link: corporate mail
  // scanners (Defender SafeLinks, Mimecast, Proofpoint, etc.) pre-fetch links
  // in emails and consume the one-time token before the user ever clicks,
  // which silently breaks magic-link / reset-link sign-in. A code can't be
  // consumed by a scanner. shouldCreateUser:false → only existing accounts get
  // a code (new users sign up with a password on the Sign Up tab).
  async function sendEmailCode(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    return { data, error };
  }

  async function verifyEmailCode(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
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
  const hasAccess       = !!(profile && (profile.has_access || profile.is_admin));
  const isAdmin         = !!(profile && profile.is_admin);

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      isLoading,
      isAuthenticated,
      hasAccess,
      isAdmin,
      signUp,
      signIn,
      sendEmailCode,
      verifyEmailCode,
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
