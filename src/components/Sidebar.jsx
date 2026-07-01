import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { MODULES } from '../data/modules.js';
import { getEffectiveOutput } from '../utils/storage.js';

export default function Sidebar() {
  const { state, setCurrentModule } = useApp();
  const { user, signOut } = useAuth();

  const completed = MODULES.filter(m => getEffectiveOutput(state, m.id)).length;
  const percent = Math.round((completed / MODULES.length) * 100);

  // Read progress as altitude: 0% = on the runway, 100% = cleared for takeoff.
  // Display-only — no logic or data change. Cruise mapped to 35,000 ft.
  const altitudeFt = Math.round((percent / 100) * 35000);
  const altitudeCaption =
    percent === 0   ? "Runway's clear."
    : percent === 100 ? 'Cleared for takeoff.'
    : `You're at ${altitudeFt.toLocaleString()} ft — keep climbing.`;

  // Phase headings shown above modules 1, 5, and 9 (4 / 4 / 2 split).
  const PHASES = {
    0: { label: 'Pre-flight', sub: 'Inner clarity · file your flight plan' },
    4: { label: 'The Climb', sub: 'Outer infrastructure · build your instruments' },
    8: { label: 'Cruising Altitude', sub: 'Compounding visibility · fly on instruments' },
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          VISIBILITY<br />
          <span>INFRASTRUCTURE</span><br />
          OS
        </div>
        <div className="sidebar-tagline">The instrument panel for visible authority</div>
      </div>

      <div className="sidebar-progress-section">
        <div className="sidebar-progress-label">
          <span>Altitude</span>
          <span style={{ color: 'var(--teal-light)', fontWeight: 700 }}>
            {completed}/{MODULES.length}
          </span>
        </div>
        <div className="sidebar-progress-bar">
          <div className="sidebar-progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>
          {altitudeCaption}
        </div>
      </div>

      <nav className="sidebar-nav">
        {MODULES.map((module, index) => {
          const isActive = state.currentModule === index;
          const isCompleted = !!getEffectiveOutput(state, module.id);

          const phase = PHASES[index];

          return (
            <div key={module.id}>
            {phase && (
              <div style={{ padding: '14px 20px 6px' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.92rem', letterSpacing: '0.08em', color: 'var(--gold)' }}>
                  {phase.label}
                </div>
                <div style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
                  {phase.sub}
                </div>
              </div>
            )}
            <div
              className={`nav-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => setCurrentModule(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setCurrentModule(index)}
            >
              <span className="nav-num">{module.number}</span>
              <div className="nav-icon">{module.icon}</div>
              <div className="nav-text">
                <div className="nav-title">{module.title}</div>
                <div className="nav-subtitle">{module.subtitle}</div>
              </div>
              <div className="nav-status" />
            </div>
            </div>
          );
        })}
      </nav>

      {/* Completion page link */}
      <div
        className={`nav-item ${(state.currentModule || 0) >= MODULES.length ? 'active' : ''}`}
        onClick={() => setCurrentModule(MODULES.length)}
        role="button"
        tabIndex={0}
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: (state.currentModule || 0) >= MODULES.length ? 'rgba(223,178,74,0.15)' : 'transparent',
          borderLeft: (state.currentModule || 0) >= MODULES.length ? '3px solid var(--gold)' : '3px solid transparent',
        }}
      >
        <span className="nav-num" style={{ color: 'var(--gold)' }}>🎉</span>
        <div className="nav-icon" style={{ background: 'rgba(223,178,74,0.1)' }}>📋</div>
        <div className="nav-text">
          <div className="nav-title" style={{ color: state.view === 'complete' ? 'var(--gold)' : 'rgba(255,255,255,0.5)' }}>
            Your Flight Log
          </div>
          <div className="nav-subtitle">Download your flight plan</div>
        </div>
      </div>

      {/* User + Sign out */}
      <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '14px 20px' }}>
        {user && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>
              Signed in as
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.6)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user.email}
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'var(--gold)',
            border: '2px solid var(--gold)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--sidebar-bg)',
            fontSize: '0.78rem',
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold-light)'; e.currentTarget.style.borderColor = 'var(--gold-light)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
        >
          ← Sign Out
        </button>
      </div>
    </aside>
  );
}
