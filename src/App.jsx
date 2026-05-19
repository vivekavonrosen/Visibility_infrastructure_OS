import { useState } from 'react';
import { useApp } from './context/AppContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import Workspace from './pages/Workspace.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Paywall from './pages/Paywall.jsx';
import Admin from './pages/Admin.jsx';
import WorkshopJoin from './pages/WorkshopJoin.jsx';
import './globals.css';

function getQueryParam(name) {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function clearQueryParam(name) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete(name);
  window.history.replaceState({}, '', url.toString());
}

function AppRouter() {
  const { state } = useApp();
  const { isAuthenticated, isLoading, hasAccess, isAdmin, isReadonly } = useAuth();

  // Stash the workshop slug from the URL on first render. The onJoined callback
  // clears it once the attendee finishes signup, so refreshes don't trap them on
  // the join page. If a user with existing access happens to land on a workshop
  // URL, the access-gated branch below (workshopSlug && !hasAccess) skips the
  // join page entirely — the leftover query param does no harm.
  const [workshopSlug, setWorkshopSlug] = useState(() => getQueryParam('workshop'));
  const isAdminRoute = getQueryParam('admin') === '1';

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

  // Workshop join URL takes priority over everything else if there's a slug
  // and the visitor doesn't already have access. (If they do, the effect above
  // will clear the slug and drop them into the workspace on the next render.)
  if (workshopSlug && !hasAccess) {
    return (
      <WorkshopJoin
        slug={workshopSlug}
        onJoined={() => {
          clearQueryParam('workshop');
          setWorkshopSlug(null);
        }}
      />
    );
  }

  // Admin URL: if you're an admin, show admin. If you're signed in but not an admin,
  // fall through (the URL has no effect on you). If you're not signed in, force the
  // sign-in screen so you can authenticate and then land on admin.
  if (isAdminRoute) {
    if (!isAuthenticated) return <AuthPage />;
    if (isAdmin) return <Admin />;
  }

  // Landing page — always public
  if (state.view === 'landing') return <Landing />;

  // Auth required for anything else
  if (!isAuthenticated) return <AuthPage />;

  // Paywall — authenticated but no access AND not a read-only workshop alum
  if (!hasAccess && !isReadonly) return <Paywall />;

  // Read-only workshop alum, or paid in: show the workspace. The Workspace
  // itself reads `isReadonly` from context to disable writes + show a banner.
  return <Workspace />;
}

export default function App() {
  return <AppRouter />;
}
