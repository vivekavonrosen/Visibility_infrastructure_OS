import { useAuth } from '../context/AuthContext.jsx';

const SALES_PAGE_URL = 'https://www.beyondthedreamboard.com/visibility-os-sales-page';
const COMP_CONTACT   = 'viveka@beyondthedreamboard.com';

export default function Paywall() {
  const { user, signOut, refreshProfile } = useAuth();

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
      {/* Background gradients (same as AuthPage for visual continuity) */}
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

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--purple), var(--gold), var(--teal))' }} />

      {/* Wordmark */}
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

      {/* Card */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 520,
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
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
            YOU'RE IN — ONE LAST STEP
          </div>
          <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
            Your VisibilityOS account is ready. Complete your purchase to open the full 10-module system.
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '32px 36px' }}>

          {/* Logged-in-as line */}
          <div style={{
            padding: '12px 16px',
            background: 'rgba(87,31,129,0.04)',
            border: '1px solid rgba(87,31,129,0.12)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: 24,
            lineHeight: 1.5,
          }}>
            Signed in as <strong style={{ color: 'var(--purple)' }}>{user?.email}</strong>.<br />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Use this same email at checkout so I can link your purchase to this account.
            </span>
          </div>

          {/* Price + CTA */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(223,178,74,0.08) 0%, rgba(44,151,175,0.06) 100%)',
            border: '1px solid rgba(223,178,74,0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 24px 22px',
            marginBottom: 20,
          }}>
            <div style={{
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 6,
            }}>
              VIOS Self-Guided · One-time
            </div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2.6rem',
              color: 'var(--purple)',
              letterSpacing: '0.02em',
              lineHeight: 1,
              marginBottom: 14,
            }}>
              $197
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.5 }}>
              Lifetime access to all 10 strategy modules, the AI engine, and the export system.
            </div>

            <a
              href={SALES_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, var(--purple), #3d1660)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textAlign: 'center',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(87,31,129,0.3)',
              }}
            >
              Complete Purchase →
            </a>
          </div>

          {/* Already paid? */}
          <div style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            textAlign: 'center',
            padding: '4px 8px 16px',
          }}>
            Already paid?{' '}
            <button
              type="button"
              onClick={refreshProfile}
              style={{
                background: 'none', border: 'none', color: 'var(--purple)',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem',
                textDecoration: 'underline', padding: 0,
              }}
            >
              Refresh access
            </button>
            {' '}— or email{' '}
            <a href={`mailto:${COMP_CONTACT}`} style={{ color: 'var(--purple)', fontWeight: 700 }}>
              {COMP_CONTACT}
            </a>
            {' '}and I'll grant access manually.
          </div>

          {/* Secondary actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 18,
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
            fontSize: '0.8rem',
          }}>
            <button
              type="button"
              onClick={signOut}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
              }}
            >
              Sign out (use a different email)
            </button>
          </div>
        </div>
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
        Beyond the Dream Board™ · Women's words will change the world.
      </div>
    </div>
  );
}
