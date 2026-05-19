import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { adminListUsers, adminSetAccess } from '../utils/supabase.js';

const REASON_OPTIONS = ['paid', 'WTIC member', 'client', 'beta', 'founder', 'comp'];

function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [busyId, setBusyId]   = useState(null);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const rows = await adminListUsers();
      setUsers(rows);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleToggle(targetUserId, nextHasAccess, reason) {
    setBusyId(targetUserId);
    setError('');
    try {
      await adminSetAccess(targetUserId, nextHasAccess, reason);
      // Optimistic update of the row so the UI feels snappy
      setUsers(prev => prev.map(u => u.user_id === targetUserId
        ? { ...u, has_access: nextHasAccess, granted_reason: reason || u.granted_reason, granted_at: nextHasAccess ? (u.granted_at || new Date().toISOString()) : u.granted_at }
        : u
      ));
    } catch (e) {
      setError(e.message);
      // Refresh from server to recover from any partial state
      loadUsers();
    } finally {
      setBusyId(null);
    }
  }

  const grantedCount = users.filter(u => u.has_access).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header bar */}
      <div style={{
        background: 'linear-gradient(135deg, var(--purple) 0%, #3d1660 100%)',
        borderBottom: '3px solid var(--gold)',
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.6rem',
            color: 'white',
            letterSpacing: '0.06em',
          }}>
            VIOS · ADMIN
          </div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
            {grantedCount} of {users.length} users have access · signed in as {user?.email}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <a
            href="/"
            style={{
              padding: '8px 16px',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            ← Back to App
          </a>
          <button
            type="button"
            onClick={loadUsers}
            style={{
              padding: '8px 16px',
              background: 'var(--gold)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(192,57,43,0.06)',
            border: '1px solid rgba(192,57,43,0.2)',
            borderRadius: 'var(--radius-md)',
            color: '#c0392b',
            fontSize: '0.88rem',
            marginBottom: 20,
          }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Loading users…
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead style={{ background: 'var(--bg-input)' }}>
                <tr style={{ textAlign: 'left' }}>
                  <th style={th}>Email</th>
                  <th style={th}>Signed up</th>
                  <th style={th}>Last sign-in</th>
                  <th style={th}>Reason</th>
                  <th style={th}>Granted</th>
                  <th style={{ ...th, textAlign: 'right' }}>Access</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <UserRow
                    key={u.user_id}
                    row={u}
                    busy={busyId === u.user_id}
                    onToggle={handleToggle}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          You're an admin — your own access can't be removed from this page.<br />
          <button
            type="button"
            onClick={signOut}
            style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function UserRow({ row, busy, onToggle }) {
  const { user } = useAuth();
  const isSelf  = row.user_id === user?.id;
  const [reason, setReason] = useState(row.granted_reason || 'paid');

  const canRevoke = !isSelf && !row.is_admin;

  return (
    <tr style={{ borderTop: '1px solid var(--border)' }}>
      <td style={td}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {row.email}
          {row.is_admin && (
            <span style={{
              marginLeft: 8,
              padding: '2px 6px',
              background: 'var(--purple)',
              color: 'white',
              fontSize: '0.65rem',
              borderRadius: 4,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}>
              Admin
            </span>
          )}
        </div>
      </td>
      <td style={{ ...td, color: 'var(--text-muted)' }}>{formatDate(row.signed_up_at)}</td>
      <td style={{ ...td, color: 'var(--text-muted)' }}>{formatDate(row.last_sign_in_at)}</td>
      <td style={td}>
        <select
          value={reason}
          onChange={e => setReason(e.target.value)}
          disabled={busy || !canRevoke && row.has_access}
          style={{
            padding: '4px 8px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: 'white',
            fontSize: '0.82rem',
            color: 'var(--text-primary)',
          }}
        >
          {REASON_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </td>
      <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
        {formatDate(row.granted_at)}
      </td>
      <td style={{ ...td, textAlign: 'right' }}>
        {row.has_access ? (
          canRevoke ? (
            <button
              type="button"
              onClick={() => onToggle(row.user_id, false, reason)}
              disabled={busy}
              style={{
                padding: '6px 14px',
                background: 'white',
                border: '1px solid #c0392b',
                color: '#c0392b',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.5 : 1,
              }}
            >
              {busy ? '…' : 'Revoke'}
            </button>
          ) : (
            <span style={{
              padding: '6px 14px',
              background: 'rgba(44,151,175,0.08)',
              color: 'var(--teal-dark)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              {isSelf ? 'You' : 'Active'}
            </span>
          )
        ) : (
          <button
            type="button"
            onClick={() => onToggle(row.user_id, true, reason)}
            disabled={busy}
            style={{
              padding: '6px 14px',
              background: 'var(--purple)',
              border: 'none',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 900,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.5 : 1,
            }}
          >
            {busy ? '…' : 'Grant'}
          </button>
        )}
      </td>
    </tr>
  );
}

const th = {
  padding: '12px 16px',
  fontSize: '0.72rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  fontWeight: 700,
};

const td = {
  padding: '14px 16px',
  verticalAlign: 'middle',
};
