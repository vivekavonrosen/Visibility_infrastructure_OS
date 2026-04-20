import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { MODULES } from '../data/modules.js';
import { getEffectiveOutput } from '../utils/storage.js';

export default function Sidebar() {
  const { state, setCurrentModule } = useApp();
  const { user, signOut } = useAuth();

  const completed = MODULES.filter(m => getEffectiveOutput(state, m.id)).length;
  const percent = Math.round((completed / MODULES.length) * 100);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          VISIBILITY<br />
          <span>INFRASTRUCTURE</span><br />
          OS
        </div>
        <div className="sidebar-tagline">Strategy System for Women 50+</div>
      </div>

      <div className="sidebar-progress-section">
        <div className="sidebar-progress-label">
          <span>Progress</span>
          <span style={{ color: 'var(--teal-light)', fontWeight: 700 }}>
            {completed}/{MODULES.length}
          </span>
        </div>
        <div className="sidebar-progress-bar">
          <div className="sidebar-progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <nav className="sidebar-nav">
        {MODULES.map((module, index) => {
          const isActive = state.currentModule === index;
          const isCompleted = !!getEffectiveOutput(state, module.id);

          return (
            <div
              key={module.id}
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
          );
        })}
      </nav>

      {/* Completion page link */}
      <div
        className={`nav-item ${(state.currentModule || 0) >= 10 ? 'active' : ''}`}
        onClick={() => setCurrentModule(10)}
        role="button"
        tabIndex={0}
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: (state.currentModule || 0) >= 10 ? 'rgba(223,178,74,0.15)' : 'transparent',
          borderLeft: (state.currentModule || 0) >= 10 ? '3px solid var(--gold)' : '3px solid transparent',
        }}
      >
        <span className="nav-num" style={{ color: 'var(--gold)' }}>🎉</span>
        <div className="nav-icon" style={{ background: 'rgba(223,178,74,0.1)' }}>📋</div>
        <div className="nav-text">
          <div className="nav-title" style={{ color: state.view === 'complete' ? 'var(--gold)' : 'rgba(255,255,255,0.5)' }}>
            Your Playbook
          </div>
          <div className="nav-subtitle">Download & next steps</div>
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
            padding: '7px 12px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-md)',
            color: 'rgba(255,255,255,0.35)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
        >
          ← Sign Out
        </button>
      </div>
    </aside>
  );
}
