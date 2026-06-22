import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
  const { signIn, signUp, sendEmailCode, verifyEmailCode, resendConfirmation } = useAuth();

  // Note: the 'magic' mode is a passwordless EMAIL CODE flow (6-digit OTP), not a
  // clickable link — codes survive corporate mail scanners that consume link tokens.
  const [mode, setMode]         = useState('signin');   // signin | signup | magic
  const [otpStep, setOtpStep]   = useState('request');  // request | verify  (magic mode only)
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [code, setCode]         = useState('');
  const [status, setStatus]     = useState('idle');     // idle | loading | success | error
  const [message, setMessage]   = useState('');

  function goToMode(next) {
    setMode(next);
    setOtpStep('request');
    setCode('');
    reset();
  }

  // Confirmation modal state (shown after successful signup OR sign-in attempt with unconfirmed email)
  const [confirmModal, setConfirmModal] = useState(null); // { email } | null

  function reset() {
    setStatus('idle');
    setMessage('');
  }

  async function handleResendCode() {
    if (!email.trim()) return;
    setStatus('loading');
    setMessage('');
    const { error } = await sendEmailCode(email.trim());
    if (error) { setStatus('error'); setMessage(error.message); }
    else { setStatus('success'); setMessage('New code sent — check your inbox.'); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    if (mode === 'magic') {
      // Step 1: request a 6-digit code by email.
      if (otpStep === 'request') {
        if (!email.trim()) { setStatus('error'); setMessage('Please enter your email address.'); return; }
        const { error } = await sendEmailCode(email.trim());
        if (error) { setStatus('error'); setMessage(error.message); return; }
        setStatus('idle'); setMessage(''); setCode(''); setOtpStep('verify');
        return;
      }
      // Step 2: verify the code → establishes a session.
      const cleaned = code.replace(/\D/g, '');
      if (cleaned.length < 6) { setStatus('error'); setMessage('Enter the 6-digit code from your email.'); return; }
      const { error } = await verifyEmailCode(email.trim(), cleaned);
      if (error) { setStatus('error'); setMessage(error.message); }
      // On success, AuthContext updates session → App re-renders to workspace
      return;
    }

    if (!email.trim() || !password) { setStatus('error'); setMessage('Please fill in all fields.'); return; }

    if (mode === 'signup') {
      if (password !== confirm) { setStatus('error'); setMessage('Passwords don\'t match.'); return; }
      if (password.length < 8)  { setStatus('error'); setMessage('Password must be at least 8 characters.'); return; }
      const { error } = await signUp(email.trim(), password);
      if (error) { setStatus('error'); setMessage(error.message); }
      else { setStatus('idle'); setConfirmModal({ email: email.trim() }); }
      return;
    }

    // Sign in
    const { error } = await signIn(email.trim(), password);
    if (error) {
      // Special case: Supabase returns "Email not confirmed" when account exists but unconfirmed.
      // Surface the modal so they can resend instead of just showing a cryptic error.
      if (/not confirmed/i.test(error.message)) {
        setStatus('idle');
        setConfirmModal({ email: email.trim() });
        return;
      }
      setStatus('error'); setMessage(error.message);
    }
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
            {mode === 'magic'  && 'EMAIL CODE'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>
            {mode === 'signin' && 'Sign in to access your strategy workspace.'}
            {mode === 'signup' && 'Create your account to get started.'}
            {mode === 'magic' && otpStep === 'request' && 'No password needed — we\'ll email you a 6-digit sign-in code.'}
            {mode === 'magic' && otpStep === 'verify'  && 'Enter the 6-digit code we just emailed you.'}
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
            { key: 'magic',  label: '✉️ Email Code' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => goToMode(tab.key)}
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
              disabled={status === 'loading' || (mode === 'magic' && otpStep === 'verify')}
            />
          </div>

          {/* 6-digit code field (email-code mode, verify step) */}
          {mode === 'magic' && otpStep === 'verify' && (
            <div className="form-field" style={{ marginBottom: 20 }}>
              <label className="form-label">6-Digit Code <span>*</span></label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="form-input"
                value={code}
                onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); reset(); }}
                placeholder="••••••"
                maxLength={6}
                required
                disabled={status === 'loading'}
                style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.3rem', fontWeight: 700 }}
              />
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <button type="button" onClick={handleResendCode} disabled={status === 'loading'}
                  style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                  Resend code
                </button>
                <button type="button" onClick={() => { setOtpStep('request'); setCode(''); reset(); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                  Use a different email
                </button>
              </div>
            </div>
          )}

          {/* Password fields (not shown for email-code mode) */}
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

          {mode === 'magic' && otpStep === 'request' && <div style={{ height: 8 }} />}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading'}
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
                {mode === 'magic'
                  ? (otpStep === 'request' ? 'Sending Code...' : 'Verifying...')
                  : mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>
                {mode === 'magic'  && (otpStep === 'request' ? '✉️ Email Me a Code' : '→ Verify & Sign In')}
                {mode === 'signup' && '⚡ Create Account'}
                {mode === 'signin' && '→ Sign In'}
              </>
            )}
          </button>

          {/* Mode switcher hint */}
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {mode === 'signin' && (
              <>
                <div>Don't have an account?{' '}
                  <button type="button" onClick={() => goToMode('signup')}
                    style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                    Sign up
                  </button>
                </div>
                <div style={{ marginTop: 8 }}>Forgot your password, or can't get in?{' '}
                  <button type="button" onClick={() => goToMode('magic')}
                    style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                    Email yourself a code
                  </button>
                </div>
              </>
            )}
            {mode === 'signup' && (
              <>Already have an account?{' '}
                <button type="button" onClick={() => goToMode('signin')}
                  style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                  Sign in
                </button>
              </>
            )}
            {mode === 'magic' && (
              <>Prefer a password?{' '}
                <button type="button" onClick={() => goToMode('signin')}
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

      {confirmModal && (
        <ConfirmEmailModal
          email={confirmModal.email}
          onResend={() => resendConfirmation(confirmModal.email)}
          onClose={() => {
            setConfirmModal(null);
            setMode('signin');
            setPassword('');
            setConfirm('');
          }}
        />
      )}
    </div>
  );
}

function ConfirmEmailModal({ email, onResend, onClose }) {
  const [resendStatus, setResendStatus] = useState('idle'); // idle | sending | sent | error
  const [resendError,  setResendError]  = useState('');

  async function handleResend() {
    setResendStatus('sending');
    setResendError('');
    const { error } = await onResend();
    if (error) { setResendStatus('error'); setResendError(error.message); }
    else       { setResendStatus('sent'); }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,5,20,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460,
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.18s ease',
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, var(--purple) 0%, #3d1660 100%)',
          padding: '28px 32px 22px',
          borderBottom: '3px solid var(--gold)',
        }}>
          <div style={{ fontSize: '2.4rem', marginBottom: 6 }}>✉️</div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.8rem',
            letterSpacing: '0.05em',
            color: 'white',
            lineHeight: 1.1,
          }}>
            CHECK YOUR INBOX
          </div>
        </div>

        <div style={{ padding: '24px 32px 28px' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.55, marginBottom: 16 }}>
            We just sent a confirmation link to:
          </p>
          <div style={{
            padding: '12px 14px',
            background: 'rgba(87,31,129,0.06)',
            border: '1px solid rgba(87,31,129,0.18)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'monospace',
            fontSize: '0.92rem',
            color: 'var(--purple)',
            textAlign: 'center',
            marginBottom: 20,
            wordBreak: 'break-all',
          }}>
            {email}
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 20 }}>
            Click the link in that email to confirm your account, then come back here to sign in.
            <br /><br />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Don't see it? Check your spam folder, or resend below.
            </span>
          </p>

          {resendStatus === 'sent' && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(44,151,175,0.08)',
              border: '1px solid rgba(44,151,175,0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--teal-dark)',
              fontSize: '0.85rem',
              marginBottom: 16,
            }}>
              ✅ Sent again — check your inbox.
            </div>
          )}
          {resendStatus === 'error' && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(192,57,43,0.06)',
              border: '1px solid rgba(192,57,43,0.2)',
              borderRadius: 'var(--radius-md)',
              color: '#c0392b',
              fontSize: '0.85rem',
              marginBottom: 16,
            }}>
              ⚠️ {resendError}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendStatus === 'sending' || resendStatus === 'sent'}
              style={{
                flex: 1,
                padding: '12px',
                background: 'white',
                border: '1px solid var(--purple)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--purple)',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: resendStatus === 'sending' ? 'not-allowed' : 'pointer',
                opacity: resendStatus === 'sending' ? 0.6 : 1,
              }}
            >
              {resendStatus === 'sending' ? 'Sending…' : 'Resend Email'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg, var(--purple), #3d1660)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                fontSize: '0.82rem',
                fontWeight: 900,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(87,31,129,0.3)',
              }}
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
