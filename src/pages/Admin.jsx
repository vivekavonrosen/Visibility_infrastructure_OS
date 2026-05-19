import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  adminListUsers,
  adminSetAccess,
  adminListWorkshops,
  adminCreateWorkshop,
  adminListWorkshopAttendees,
  adminEndWorkshop,
} from '../utils/supabase.js';

const REASON_OPTIONS = ['paid', 'WTIC member', 'client', 'beta', 'founder', 'comp', 'workshop'];

function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState('users'); // 'users' | 'workshops'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header bar */}
      <div style={{
        background: 'linear-gradient(135deg, var(--purple) 0%, #3d1660 100%)',
        borderBottom: '3px solid var(--gold)',
        padding: '20px 32px 0',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 16,
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
              Signed in as {user?.email}
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
              onClick={signOut}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.4)',
                color: 'white',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4 }}>
          <TabButton active={tab === 'users'}     onClick={() => setTab('users')}>Users</TabButton>
          <TabButton active={tab === 'workshops'} onClick={() => setTab('workshops')}>Workshops</TabButton>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {tab === 'users'     && <UsersTab />}
        {tab === 'workshops' && <WorkshopsTab />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '10px 22px',
        background: active ? 'var(--bg)' : 'transparent',
        border: 'none',
        color: active ? 'var(--purple)' : 'rgba(255,255,255,0.7)',
        fontSize: '0.82rem',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottom: active ? '3px solid var(--gold)' : '3px solid transparent',
        marginBottom: -1,
      }}
    >
      {children}
    </button>
  );
}

// ── Users tab (existing functionality) ──────────────────────────────

function UsersTab() {
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
      setUsers(prev => prev.map(u => u.user_id === targetUserId
        ? { ...u, has_access: nextHasAccess, granted_reason: reason || u.granted_reason, granted_at: nextHasAccess ? (u.granted_at || new Date().toISOString()) : u.granted_at }
        : u
      ));
    } catch (e) {
      setError(e.message);
      loadUsers();
    } finally {
      setBusyId(null);
    }
  }

  const grantedCount = users.filter(u => u.has_access).length;

  return (
    <>
      <SectionHeader
        title={`${grantedCount} of ${users.length} users have access`}
        action={<RefreshButton onClick={loadUsers} />}
      />
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {loading ? (
        <Loading>Loading users…</Loading>
      ) : (
        <Card>
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
                <UserRow key={u.user_id} row={u} busy={busyId === u.user_id} onToggle={handleToggle} />
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
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
          {row.is_admin && <Pill bg="var(--purple)" color="white">Admin</Pill>}
        </div>
      </td>
      <td style={{ ...td, color: 'var(--text-muted)' }}>{formatDate(row.signed_up_at)}</td>
      <td style={{ ...td, color: 'var(--text-muted)' }}>{formatDate(row.last_sign_in_at)}</td>
      <td style={td}>
        <select
          value={reason}
          onChange={e => setReason(e.target.value)}
          disabled={busy}
          style={selectStyle}
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
            <Button kind="danger" onClick={() => onToggle(row.user_id, false, reason)} disabled={busy}>
              {busy ? '…' : 'Revoke'}
            </Button>
          ) : (
            <Pill bg="rgba(44,151,175,0.08)" color="var(--teal-dark)">{isSelf ? 'You' : 'Active'}</Pill>
          )
        ) : (
          <Button kind="primary" onClick={() => onToggle(row.user_id, true, reason)} disabled={busy}>
            {busy ? '…' : 'Grant'}
          </Button>
        )}
      </td>
    </tr>
  );
}

// ── Workshops tab ───────────────────────────────────────────────────

function WorkshopsTab() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  async function loadWorkshops() {
    setLoading(true);
    setError('');
    try {
      const rows = await adminListWorkshops();
      setWorkshops(rows);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadWorkshops(); }, []);

  async function handleEnd(workshopId) {
    if (!confirm('End this workshop now? All active attendees lose write access immediately and switch to read-only.')) return;
    setError('');
    try {
      await adminEndWorkshop(workshopId);
      await loadWorkshops();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <SectionHeader
        title={`${workshops.length} workshop${workshops.length === 1 ? '' : 's'}`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <RefreshButton onClick={loadWorkshops} />
            <Button kind="primary" onClick={() => setShowForm(true)}>+ New Workshop</Button>
          </div>
        }
      />

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {showForm && (
        <CreateWorkshopForm
          onClose={() => setShowForm(false)}
          onCreated={async () => {
            setShowForm(false);
            await loadWorkshops();
          }}
        />
      )}

      {loading ? (
        <Loading>Loading workshops…</Loading>
      ) : workshops.length === 0 ? (
        <Card>
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No workshops yet. Click <strong>+ New Workshop</strong> to create one.
          </div>
        </Card>
      ) : (
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead style={{ background: 'var(--bg-input)' }}>
              <tr style={{ textAlign: 'left' }}>
                <th style={th}>Slug · Name</th>
                <th style={th}>Ends</th>
                <th style={th}>Attendees</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workshops.map(w => (
                <WorkshopRow
                  key={w.id}
                  row={w}
                  expanded={expandedId === w.id}
                  onToggleExpand={() => setExpandedId(prev => prev === w.id ? null : w.id)}
                  onEnd={() => handleEnd(w.id)}
                />
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

function WorkshopRow({ row, expanded, onToggleExpand, onEnd }) {
  const joinUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/?workshop=${row.slug}`;
  }, [row.slug]);

  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <tr style={{ borderTop: '1px solid var(--border)' }}>
        <td style={td}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.slug}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{row.name}</div>
        </td>
        <td style={{ ...td, color: 'var(--text-muted)' }}>{formatDateTime(row.ends_at)}</td>
        <td style={{ ...td, color: 'var(--text-secondary)' }}>
          {row.attendee_count} / {row.max_attendees}
        </td>
        <td style={td}>
          {row.is_active
            ? <Pill bg="rgba(44,151,175,0.12)" color="var(--teal-dark)">Active</Pill>
            : <Pill bg="rgba(0,0,0,0.05)" color="var(--text-muted)">Ended</Pill>}
        </td>
        <td style={{ ...td, textAlign: 'right' }}>
          <div style={{ display: 'inline-flex', gap: 6 }}>
            <Button kind="ghost" onClick={copy}>{copied ? 'Copied!' : 'Copy link'}</Button>
            <Button kind="ghost" onClick={onToggleExpand}>{expanded ? 'Hide roster' : 'Roster'}</Button>
            {row.is_active && <Button kind="danger" onClick={onEnd}>End now</Button>}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} style={{ padding: 0, background: 'var(--bg-input)' }}>
            <div style={{ padding: '12px 16px 6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Join link: <code style={{ background: 'white', padding: '2px 6px', borderRadius: 4 }}>{joinUrl}</code>
            </div>
            <AttendeeRoster key={row.id} workshopId={row.id} />
          </td>
        </tr>
      )}
    </>
  );
}

// Keyed on workshopId by the parent so it remounts (and refetches) when a
// different roster is opened. Lets the load state initialize cleanly without
// needing to reset inside the effect.
function AttendeeRoster({ workshopId }) {
  const [rows, setRows]       = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    let cancelled = false;
    adminListWorkshopAttendees(workshopId)
      .then(r => { if (!cancelled) setRows(r); })
      .catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [workshopId]);

  if (error) return <div style={{ padding: 16, color: '#c0392b', fontSize: '0.85rem' }}>{error}</div>;
  if (rows === null) return <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading roster…</div>;
  if (rows.length === 0) return <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: '0.85rem' }}>No one's joined yet.</div>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
      <thead>
        <tr style={{ textAlign: 'left' }}>
          <th style={{ ...th, padding: '8px 16px' }}>Name</th>
          <th style={{ ...th, padding: '8px 16px' }}>Email</th>
          <th style={{ ...th, padding: '8px 16px' }}>Joined</th>
          <th style={{ ...th, padding: '8px 16px' }}>Access until</th>
          <th style={{ ...th, padding: '8px 16px' }}>Last seen</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.user_id} style={{ borderTop: '1px solid var(--border)' }}>
            <td style={{ ...td, padding: '8px 16px' }}>{r.display_name || '—'}</td>
            <td style={{ ...td, padding: '8px 16px' }}>{r.email}</td>
            <td style={{ ...td, padding: '8px 16px', color: 'var(--text-muted)' }}>{formatDateTime(r.joined_at)}</td>
            <td style={{ ...td, padding: '8px 16px', color: 'var(--text-muted)' }}>{formatDateTime(r.access_expires_at)}</td>
            <td style={{ ...td, padding: '8px 16px', color: 'var(--text-muted)' }}>{formatDateTime(r.last_sign_in_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CreateWorkshopForm({ onClose, onCreated }) {
  const [slug, setSlug]               = useState('');
  const [name, setName]               = useState('');
  const [duration, setDuration]       = useState('4'); // hours
  const [maxAttendees, setMax]        = useState('50');
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const cleanSlug = slug.trim().toUpperCase();
      if (!/^[A-Z0-9-]{3,32}$/.test(cleanSlug)) {
        throw new Error('Slug must be 3-32 chars: A-Z, 0-9, dashes only.');
      }
      if (!name.trim()) throw new Error('Workshop name is required.');
      const hours = parseFloat(duration);
      if (!hours || hours <= 0) throw new Error('Duration must be > 0.');

      const endsAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();

      await adminCreateWorkshop({
        slug:          cleanSlug,
        name:          name.trim(),
        endsAt,
        maxAttendees:  parseInt(maxAttendees, 10) || 50,
      });
      onCreated();
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px 28px',
      marginBottom: 20,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.2rem',
        color: 'var(--purple)',
        marginBottom: 4,
      }}>
        Create Workshop
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
        Attendees will join at <code>visibilityos.tech/?workshop=YOUR-SLUG</code>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormField label="Slug (the URL code)" hint="Uppercase, dashes ok. e.g. MAY-DALLAS">
            <input
              type="text"
              value={slug}
              onChange={e => setSlug(e.target.value.toUpperCase())}
              placeholder="MAY-DALLAS"
              style={inputStyle}
              autoFocus
            />
          </FormField>
          <FormField label="Workshop name" hint="Shown to attendees on the join page">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Dallas WTIC May 2026"
              style={inputStyle}
            />
          </FormField>
          <FormField label="Duration (hours)" hint="Access expires after this much time">
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              style={inputStyle}
            />
          </FormField>
          <FormField label="Max attendees" hint="Hard cap on signups">
            <input
              type="number"
              min="1"
              value={maxAttendees}
              onChange={e => setMax(e.target.value)}
              style={inputStyle}
            />
          </FormField>
        </div>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button kind="primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Workshop'}
          </Button>
          <Button kind="ghost" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Shared bits ─────────────────────────────────────────────────────

function SectionHeader({ title, action }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    }}>
      <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{title}</div>
      {action}
    </div>
  );
}

function ErrorBanner({ children }) {
  return (
    <div style={{
      padding: '12px 16px',
      background: 'rgba(192,57,43,0.06)',
      border: '1px solid rgba(192,57,43,0.2)',
      borderRadius: 'var(--radius-md)',
      color: '#c0392b',
      fontSize: '0.88rem',
      marginBottom: 20,
    }}>
      ⚠️ {children}
    </div>
  );
}

function Loading({ children }) {
  return <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>{children}</div>;
}

function Card({ children }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {children}
    </div>
  );
}

function Pill({ children, bg, color }) {
  return (
    <span style={{
      display: 'inline-block',
      marginLeft: 8,
      padding: '2px 8px',
      background: bg,
      color: color,
      fontSize: '0.7rem',
      borderRadius: 4,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      fontWeight: 700,
    }}>
      {children}
    </span>
  );
}

function RefreshButton({ onClick }) {
  return (
    <Button kind="gold" onClick={onClick}>Refresh</Button>
  );
}

function Button({ kind, children, onClick, disabled, type = 'button' }) {
  const styles = {
    primary: { background: 'var(--purple)',            color: 'white',             border: 'none' },
    gold:    { background: 'var(--gold)',              color: 'var(--text-primary)', border: 'none' },
    danger:  { background: 'white',                    color: '#c0392b',           border: '1px solid #c0392b' },
    ghost:   { background: 'white',                    color: 'var(--purple)',     border: '1px solid var(--border)' },
  }[kind] || {};
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles,
        padding: '6px 14px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.78rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function FormField({ label, hint, children }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '0.74rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
        marginBottom: 4,
      }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>}
    </div>
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

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  fontSize: '0.9rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  background: 'white',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)',
  outline: 'none',
};

const selectStyle = {
  padding: '4px 8px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  background: 'white',
  fontSize: '0.82rem',
  color: 'var(--text-primary)',
};
