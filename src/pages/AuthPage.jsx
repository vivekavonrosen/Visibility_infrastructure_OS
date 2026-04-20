import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
  const { signIn, signUp, signInWithMagicLink } = useAuth();

  const [mode, setMode]         = useState('signin');   // signin | signup | magic
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [status, setStatus]     = useState('idle');     // idle | loading | success | error
  const [message, setMessage]   = useState('');

  function reset() {
    setStatus('idle');
    setMessage('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    if (mode === 'magic') {
      if (!email.trim()) { setStatus('error'); setMessage('Please enter your email address.'); return; }
      const { error } = await signInWithMagicLink(email.trim());
      if (error) { setStatus('error'); setMessage(error.message); }
      else { setStatus('success'); setMessage(`Check your inbox — we sent a sign-in link to ${email}.`); }
      return;
    }

    if (!email.trim() || !password) { setStatus('error'); setMessage('Please fill in all fields.'); return; }

    if (mode === 'signup') {
      if (password !== confirm) { setStatus('error'); setMessage('Passwords don\'t match.'); return; }
      if (password.length < 8)  { setStatus('error'); setMessage('Password must be at least 8 characters.'); return; }
      const { error } = await signUp(email.trim(), password);
      if (error) { setStatus('error'); setMessage(error.message); }
      else { setStatus('success'); setMessage('Account created! Check your email to confirm, then sign in.'); }
      return;
    }

    // Sign in
    const { error } = await signIn(email.trim(), password);
    if (error) { setStatus('error'); setMessage(error.message); }
    // On success, AuthContext updates session → App re-renders to workspace
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--sidebar-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background gradients */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 60% at 20% 50%, rgba(87,31,129,0.35) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 80% 80%, rgba(44,151,175,0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.5) 60px, rgba(255,255,255,0.5) 61px)',
        pointerEvents: 'none',
      }} />

      {/* Gold top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--purple), var(--gold), var(--teal))' }} />

      {/* Logo / wordmark */}
      <div style={{ position: 'relative', textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.4rem',
          letterSpacing: '0.1em',
          color: 'white',
          marginBottom: 4,
        }}>
          VISIBILITY <span style={{ color: 'var(--gold)' }}>INFRASTRUCTURE</span> OS
        </div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Turn your wisdom into traction
        </div>
      </div>

      {/* Auth card */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 440,
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }}>
        {/* Card header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--purple) 0%, #3d1660 100%)',
          padding: '28px 32px 24px',
          borderBottom: '3px solid var(--gold)',
        }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.8rem',
            letterSpacing: '0.06em',
            color: 'white',
            marginBottom: 4,
          }}>
            {mode === 'signin' && 'WELCOME BACK'}
            {mode === 'signup' && 'CREATE ACCOUNT'}
            {mode === 'magic'  && 'MAGIC LINK'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>
            {mode === 'signin' && 'Sign in to access your strategy workspace.'}
            {mode === 'signup' && 'Create your account to get started.'}
            {mode === 'magic'  && 'Get a one-click sign-in link sent to your inbox.'}
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
        }}>
          {[
            { key: 'signin', label: 'Sign In' },
            { key: 'signup', label: 'Sign Up' },
            { key: 'magic',  label: '✉️ Magic Link' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setMode(tab.key); reset(); }}
              style={{
                flex: 1,
                padding: '12px 8px',
                background: 'none',
                border: 'none',
                borderBottom: mode === tab.key ? '2px solid var(--purple)' : '2px solid transparent',
                color: mode === tab.key ? 'var(--purple)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '28px 32px' }}>

          {/* Success state */}
          {status === 'success' && (
            <div style={{
              padding: '14px 16px',
              background: 'rgba(44,151,175,0.08)',
              border: '1px solid rgba(44,151,175,0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--teal-dark)',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              marginBottom: 20,
            }}>
              ✅ {message}
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(192,57,43,0.06)',
              border: '1px solid rgba(192,57,43,0.2)',
              borderRadius: 'var(--radius-md)',
              color: '#c0392b',
              fontSize: '0.85rem',
              marginBottom: 20,
            }}>
              ⚠️ {message}
            </div>
          )}

          {/* Email field */}
          <div className="form-field" style={{ marginBottom: 16 }}>
            <label className="form-label">Email Address <span>*</span></label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => { setEmail(e.target.value); reset(); }}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={status === 'loading'}
            />
          </div>

          {/* Password fields (not shown for magic link) */}
          {mode !== 'magic' && (
            <div className="form-field" style={{ marginBottom: mode === 'signup' ? 16 : 24 }}>
              <label className="form-label">Password <span>*</span></label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={e => { setPassword(e.target.value); reset(); }}
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                disabled={status === 'loading'}
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="form-field" style={{ marginBottom: 24 }}>
              <label className="form-label">Confirm Password <span>*</span></label>
              <input
                type="password"
                className="form-input"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); reset(); }}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                disabled={status === 'loading'}
              />
            </div>
          )}

          {mode === 'magic' && <div style={{ height: 8 }} />}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            style={{
              width: '100%',
              padding: '13px',
              background: status === 'loading'
                ? 'rgba(87,31,129,0.6)'
                : 'linear-gradient(135deg, var(--purple), #3d1660)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(87,31,129,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'all 0.18s ease',
            }}
          >
            {status === 'loading' ? (
              <>
                <div style={{
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
                {mode === 'magic' ? 'Sending Link...' : mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>
                {mode === 'magic'  && '✉️ Send Magic Link'}
                {mode === 'signup' && '⚡ Create Account'}
                {mode === 'signin' && '→ Sign In'}
              </>
            )}
          </button>

          {/* Mode switcher hint */}
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {mode === 'signin' && (
              <>Don't have an account?{' '}
                <button type="button" onClick={() => { setMode('signup'); reset(); }}
                  style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                  Sign up
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>Already have an account?{' '}
                <button type="button" onClick={() => { setMode('signin'); reset(); }}
                  style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                  Sign in
                </button>
              </>
            )}
            {mode === 'magic' && (
              <>Prefer a password?{' '}
                <button type="button" onClick={() => { setMode('signin'); reset(); }}
                  style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                  Sign in with password
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Footer */}
      <div style={{
        position: 'relative',
        marginTop: 28,
        textAlign: 'center',
        fontSize: '0.72rem',
        color: 'rgba(255,255,255,0.25)',
        lineHeight: 1.6,
      }}>
        Beyond the Dream Board™ · Women's words will change the world.<br />
        Your data is private and never shared.
      </div>
    </div>
  );
}
