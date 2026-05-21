import { useApp } from './context/AppContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import Workspace from './pages/Workspace.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Paywall from './pages/Paywall.jsx';
import Admin from './pages/Admin.jsx';
import './globals.css';

function isAdminRoute() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') === '1';
}

function AppRouter() {
  const { state } = useApp();
  const { isAuthenticated, isLoading, hasAccess, isAdmin } = useAuth();

  // Still checking session/profile — show spinner to avoid flash of paywall
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--sidebar-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid rgba(223,178,74,0.2)',
          borderTopColor: 'var(--gold)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  // Admin URL: if you're an admin, show admin. If you're signed in but not an admin,
  // fall through (the URL has no effect on you). If you're not signed in, force the
  // sign-in screen so you can authenticate and then land on admin.
  if (isAdminRoute()) {
    if (!isAuthenticated) return <AuthPage />;
    if (isAdmin) return <Admin />;
  }

  // Landing page — always public
  if (state.view === 'landing') return <Landing />;

  // Auth required for anything else
  if (!isAuthenticated) return <AuthPage />;

  // Paywall — authenticated but no access
  if (!hasAccess) return <Paywall />;

  // Paid in. Full workspace.
  return <Workspace />;
}

export default function App() {
  return <AppRouter />;
}
