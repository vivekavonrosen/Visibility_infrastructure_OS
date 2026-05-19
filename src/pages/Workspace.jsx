import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { MODULES } from '../data/modules.js';
import Sidebar from '../components/Sidebar.jsx';
import ModuleShell from '../components/ModuleShell.jsx';
import ExportBar from '../components/ExportBar.jsx';
import CompletionPage from './CompletionPage.jsx';

const SALES_PAGE_URL = 'https://www.beyondthedreamboard.com/visibility-os-sales-page';

export default function Workspace() {
  const { state } = useApp();
  const { isReadonly } = useAuth();
  const showCompletion = (state.currentModule || 0) >= MODULES.length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {isReadonly && <ReadonlyBanner />}
        <ExportBar />
        {showCompletion
          ? <CompletionPage />
          : <ModuleShell moduleIndex={state.currentModule || 0} />
        }
      </div>
    </div>
  );
}

function ReadonlyBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--purple) 0%, #3d1660 100%)',
      borderBottom: '3px solid var(--gold)',
      padding: '14px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      color: 'white',
      flexWrap: 'wrap',
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.95rem',
          letterSpacing: '0.06em',
          marginBottom: 2,
        }}>
          YOUR WORKSHOP HAS ENDED — READ-ONLY MODE
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
          Everything you built is still here. Upgrade to keep editing, generating, and adding new modules.
        </div>
      </div>
      <a
        href={SALES_PAGE_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '10px 18px',
          background: 'var(--gold)',
          color: 'var(--text-primary)',
          fontSize: '0.82rem',
          fontWeight: 900,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          borderRadius: 'var(--radius-md)',
          whiteSpace: 'nowrap',
        }}
      >
        Upgrade to keep going →
      </a>
    </div>
  );
}
