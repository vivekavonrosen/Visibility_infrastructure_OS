import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getWorkshopBySlug, joinWorkshop } from '../utils/supabase.js';

export default function WorkshopJoin({ slug, onJoined }) {
  const { signUpForWorkshop, refreshProfile, isAuthenticated } = useAuth();

  const [workshop, setWorkshop]   = useState(undefined); // undefined = loading; null = not found
  const [email, setEmail]         = useState('');
  const [displayName, setName]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  // Look up the workshop on mount.
  useEffect(() => {
    let cancelled = false;
    getWorkshopBySlug(slug).then((w) => { if (!cancelled) setWorkshop(w); });
    return () => { cancelled = true; };
  }, [slug]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName  = displayName.trim();

      if (!cleanEmail) throw new Error('Email is required.');
      if (!cleanName)  throw new Error('Name is required.');

      // If they're already signed in, skip the signup step.
      if (!isAuthenticated) {
        const { error: signUpError } = await signUpForWorkshop(cleanEmail);
        if (signUpError) {
          if (/already/i.test(signUpError.message)) {
            throw new Error('This email is already registered. Please sign in normally instead.');
          }
          throw signUpError;
        }
      }

      // Attach the (now-authenticated) user to the workshop.
      await joinWorkshop(slug, cleanName);
      await refreshProfile();
      onJoined?.();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setSubmitting(false);
    }
  }

  // Loading
  if (workshop === undefined) {
    return (
      <CenteredShell>
        <div style={{
          width: 36, height: 36,
          border: '3px solid rgba(223,178,74,0.2)',
          borderTopColor: 'var(--gold)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </CenteredShell>
    );
  }

  // Not found / unjoinable
  if (!workshop || !workshop.is_joinable) {
    return (
      <CenteredShell>
        <Card>
          <CardHeader title="WORKSHOP UNAVAILABLE" subtitle={
            !workshop
              ? "We couldn't find a workshop with that code."
              : "This workshop has ended or is full."
          } />
          <div style={{ padding: '28px 36px 32px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Double-check the link, or contact your facilitator.
            <div style={{ marginTop: 16 }}>
              <a href="/" style={{ color: 'var(--purple)', fontWeight: 700, textDecoration: 'underline', fontSize: '0.85rem' }}>
                ← Back to visibilityos.tech
              </a>
            </div>
          </div>
        </Card>
      </CenteredShell>
    );
  }

  // Joinable — main form
  return (
    <CenteredShell>
      <Card>
        <CardHeader
          title="YOU'RE INVITED"
          subtitle={`Welcome to ${workshop.name}. Enter your name + email to get started — no password needed.`}
        />
        <form onSubmit={handleSubmit} style={{ padding: '28px 36px 32px' }}>
          <Field
            label="Your name"
            id="ws-name"
            value={displayName}
            onChange={setName}
            placeholder="First + Last"
            autoFocus
          />
          <Field
            label="Email"
            id="ws-email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(220,38,38,0.06)',
              border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: 'var(--radius-md)',
              color: '#991b1b',
              fontSize: '0.85rem',
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px',
              background: submitting
                ? 'rgba(87,31,129,0.5)'
                : 'linear-gradient(135deg, var(--purple), #3d1660)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: submitting ? 'wait' : 'pointer',
              boxShadow: '0 4px 16px rgba(87,31,129,0.3)',
            }}
          >
            {submitting ? 'Joining…' : 'Enter the Workshop →'}
          </button>

          <div style={{
            marginTop: 18,
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            lineHeight: 1.6,
          }}>
            Your access stays open through the workshop. After it ends, you'll keep a read-only copy of everything you built.
          </div>
        </form>
      </Card>
    </CenteredShell>
  );
}

// ── Local UI helpers ────────────────────────────────────────────────

function CenteredShell({ children }) {
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
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 60% at 20% 50%, rgba(87,31,129,0.35) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 80% 80%, rgba(44,151,175,0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--purple), var(--gold), var(--teal))' }} />

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
          Live Workshop Mode
        </div>
      </div>

      {children}

      <div style={{
        position: 'relative',
        marginTop: 28,
        textAlign: 'center',
        fontSize: '0.72rem',
        color: 'rgba(255,255,255,0.25)',
        lineHeight: 1.6,
      }}>
        Beyond the Dream Board™ · Women's words will change the world.
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 520,
      background: 'white',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--purple) 0%, #3d1660 100%)',
      padding: '32px 36px 28px',
      borderBottom: '3px solid var(--gold)',
    }}>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '2.1rem',
        letterSpacing: '0.05em',
        color: 'white',
        marginBottom: 8,
        lineHeight: 1.1,
      }}>
        {title}
      </div>
      <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>
        {subtitle}
      </div>
    </div>
  );
}

function Field({ label, id, value, onChange, type = 'text', placeholder, autoFocus }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{
        display: 'block',
        fontSize: '0.78rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
        marginBottom: 6,
      }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required
        style={{
          width: '100%',
          padding: '12px 14px',
          fontSize: '0.95rem',
          fontFamily: 'var(--font-body)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          background: 'white',
          color: 'var(--text-primary)',
          outline: 'none',
        }}
      />
    </div>
  );
}
