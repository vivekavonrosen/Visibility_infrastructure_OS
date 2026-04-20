import { useApp } from './context/AppContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import Workspace from './pages/Workspace.jsx';
import AuthPage from './pages/AuthPage.jsx';
import './globals.css';

function AppRouter() {
  const { state } = useApp();
  const { isAuthenticated, isLoading } = useAuth();

  // Still checking session — show spinner to avoid flash
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

  // Landing page — always public
  if (state.view === 'landing') return <Landing />;

  // Everything else is the app — requires auth
  // Workspace internally handles module pages AND completion page
  if (!isAuthenticated) return <AuthPage />;
  return <Workspace />;
}

export default function App() {
  return <AppRouter />;
}
