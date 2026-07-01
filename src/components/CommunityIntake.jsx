// ============================================================
// Community Strategy — branching intake (Module 11)
// Q1 gates the rest. "No" → encouragement + exit (no generation).
// Q2 = multi-select platforms + Other. Q3 = one screen, three
// single-select chip rows (+ Other on the audience row).
// ============================================================

const Q1_OPTIONS = ['Yes', 'No', 'Maybe'];

const Q2_PLATFORMS = [
  'Skool',
  'Circle',
  'Mighty Networks',
  'Kajabi',
  'Facebook Group',
  'Not sure yet',
];

const Q3_PURPOSE = [
  'Feed a lower-ticket, high-volume offer',
  'Feed into higher-ticket coaching or consulting',
  'Be a stand-alone paid membership on its own',
  'Build authority and stay free for now',
];

const Q3_PRICE = ['Free', 'Under $50/mo', '$50–150/mo', '$150+/mo', "Haven't priced it yet"];

const Q3_AUDIENCE = [
  'LinkedIn',
  'Instagram',
  'YouTube',
  'Email list',
  'Substack',
  "I don't really have one yet",
  'Other',
];

// ── Shared chip styles ──────────────────────────────────────
function chipStyle(selected) {
  return {
    padding: '9px 16px',
    borderRadius: '999px',
    fontSize: '0.83rem',
    fontWeight: selected ? 700 : 500,
    cursor: 'pointer',
    border: selected ? '1.5px solid var(--purple)' : '1.5px solid var(--border, #d9d2e6)',
    background: selected ? 'var(--purple)' : 'white',
    color: selected ? 'white' : 'var(--text, #2b2340)',
    transition: 'all 0.15s ease',
    userSelect: 'none',
    lineHeight: 1.3,
  };
}

function Chip({ label, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} style={chipStyle(selected)}>
      {label}
    </button>
  );
}

function ChipRow({ options, selected, onSelect, multi = false }) {
  const isSelected = (opt) =>
    multi ? Array.isArray(selected) && selected.includes(opt) : selected === opt;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => (
        <Chip key={opt} label={opt} selected={isSelected(opt)} onClick={() => onSelect(opt)} />
      ))}
    </div>
  );
}

function otherInputStyle() {
  return {
    marginTop: 10,
    padding: '9px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border, #d9d2e6)',
    fontSize: '0.86rem',
    width: '100%',
    maxWidth: 360,
    outline: 'none',
  };
}

function SubQuestion({ label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text, #2b2340)', marginBottom: 10 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────
// values: the module's localInputs object
// onChange(fieldId, value): mirrors ModuleShell.handleInputChange
export default function CommunityIntake({ values = {}, onChange }) {
  const q1 = values.q1_considering || '';
  const platforms = Array.isArray(values.q2_platforms) ? values.q2_platforms : [];
  const showRest = q1 === 'Yes' || q1 === 'Maybe';

  function togglePlatform(opt) {
    const next = platforms.includes(opt)
      ? platforms.filter((p) => p !== opt)
      : [...platforms, opt];
    onChange('q2_platforms', next);
  }

  return (
    <div className="form-section">
      {/* Q1 — gate */}
      <SubQuestion label="1. Are you considering creating a community for your audience?">
        <ChipRow options={Q1_OPTIONS} selected={q1} onSelect={(v) => onChange('q1_considering', v)} />
      </SubQuestion>

      {/* No → encouragement, exit */}
      {q1 === 'No' && (
        <div
          style={{
            marginTop: 4,
            padding: '18px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(44,151,175,0.08)',
            border: '1px solid rgba(44,151,175,0.3)',
            color: 'var(--teal-dark)',
            fontSize: '0.92rem',
            lineHeight: 1.6,
          }}
        >
          No problem — building a community isn't the right move for every business. If that
          changes, this is here whenever you're ready.
        </div>
      )}

      {/* Yes / Maybe → Q2 + Q3 */}
      {showRest && (
        <>
          <SubQuestion label="2. What platform(s) are you considering, if any?">
            <ChipRow options={Q2_PLATFORMS} selected={platforms} onSelect={togglePlatform} multi />
            <input
              type="text"
              placeholder="Other…"
              value={values.q2_other || ''}
              onChange={(e) => onChange('q2_other', e.target.value)}
              style={otherInputStyle()}
            />
          </SubQuestion>

          <div
            style={{
              marginTop: 6,
              paddingTop: 20,
              borderTop: '1px solid var(--border, #e6e0f0)',
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text, #2b2340)', marginBottom: 18 }}>
              3. A few quick details — tell us about the community itself.
            </div>

            <SubQuestion label="What's the main job this community needs to do for your business?">
              <ChipRow options={Q3_PURPOSE} selected={values.q3_purpose || ''} onSelect={(v) => onChange('q3_purpose', v)} />
            </SubQuestion>

            <SubQuestion label="What's your rough monthly price point?">
              <ChipRow options={Q3_PRICE} selected={values.q3_price_point || ''} onSelect={(v) => onChange('q3_price_point', v)} />
            </SubQuestion>

            <SubQuestion label="Where does most of your existing audience already live?">
              <ChipRow
                options={Q3_AUDIENCE}
                selected={values.q3_audience_location || ''}
                onSelect={(v) => onChange('q3_audience_location', v)}
              />
              {values.q3_audience_location === 'Other' && (
                <input
                  type="text"
                  placeholder="Where do they live?"
                  value={values.q3_audience_other || ''}
                  onChange={(e) => onChange('q3_audience_other', e.target.value)}
                  style={otherInputStyle()}
                />
              )}
            </SubQuestion>
          </div>
        </>
      )}
    </div>
  );
}
