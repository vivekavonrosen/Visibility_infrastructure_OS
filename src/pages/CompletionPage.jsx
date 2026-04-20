import { useApp } from '../context/AppContext.jsx';
import { MODULES } from '../data/modules.js';
import { getEffectiveOutput } from '../utils/storage.js';
import { generateExecutiveSummary, getCompletionStats } from '../utils/export.js';
import { useState, useCallback } from 'react';

export default function CompletionPage() {
  const { state, setCurrentModule } = useApp();
  const stats = getCompletionStats(state);
  const brandName = state.businessContext?.brandName || 'Your Business';
  const [downloadStep, setDownloadStep] = useState('idle'); // idle | summarising | downloading | done

  const handleDownload = useCallback(async () => {
    setDownloadStep('summarising');
    let summary = '';
    try {
      summary = await generateExecutiveSummary(state);
    } catch (e) {
      console.warn('Summary skipped:', e.message);
    }
    setDownloadStep('downloading');
    try {
      const pdfModule = await import('../utils/pdf.js');
      pdfModule.downloadPlaybookPDF(state, summary);
      setDownloadStep('done');
    } catch (e) {
      console.error('PDF failed:', e);
      alert('PDF generation failed: ' + e.message + '\n\nCheck the browser console for details.');
      setDownloadStep('idle');
      return;
    }
    setTimeout(() => setDownloadStep('idle'), 3000);
  }, [state]);

  const completedModules = MODULES.filter(m => getEffectiveOutput(state, m.id));

  return (
    <div className="module-area fade-in" style={{ maxWidth: 860, paddingBottom: 80 }}>

      {/* ── Hero completion banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--purple) 0%, #3d1660 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '48px 52px',
        marginBottom: 40,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background lines */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)',
          pointerEvents: 'none',
        }} />
        {/* Gold top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--gold), var(--teal))' }} />

        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(223,178,74,0.15)',
            border: '1px solid rgba(223,178,74,0.35)',
            borderRadius: 20,
            padding: '5px 14px',
            marginBottom: 20,
          }}>
            <span style={{ fontSize: '0.9rem' }}>🎉</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Strategy Complete
            </span>
          </div>

          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '3rem',
            letterSpacing: '0.04em',
            color: 'white',
            lineHeight: 1.05,
            marginBottom: 12,
          }}>
            YOUR VISIBILITY<br />
            <span style={{ color: 'var(--gold)' }}>INFRASTRUCTURE OS</span><br />
            IS BUILT.
          </div>

          <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 520, marginBottom: 28 }}>
            {stats.completed} of 10 modules complete. You now have a positioning strategy,
            an audience intelligence profile, content pillars, a 30-day plan, and a
            monetization roadmap — all built around your specific expertise.
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 32, marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {[
              { num: stats.completed, label: 'Modules completed' },
              { num: '10', label: 'Strategy frameworks' },
              { num: '1', label: 'Complete playbook' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--gold)', lineHeight: 1 }}>
                  {s.num}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Download CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button
              onClick={handleDownload}
              disabled={downloadStep !== 'idle'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '14px 30px',
                background: 'var(--gold)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'var(--sidebar-bg)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: downloadStep !== 'idle' ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 24px rgba(223,178,74,0.35)',
                transition: 'all 0.18s ease',
                opacity: downloadStep !== 'idle' ? 0.75 : 1,
              }}
              onMouseEnter={e => downloadStep === 'idle' && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '')}
            >
              {downloadStep === 'summarising' && <><div style={{ width:16, height:16, border:'2px solid rgba(26,10,46,0.25)', borderTopColor:'var(--sidebar-bg)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Writing Executive Summary...</>}
              {downloadStep === 'downloading' && '⏳ Building Playbook...'}
              {downloadStep === 'done' && '✅ Downloaded!'}
              {downloadStep === 'idle' && '⬇ Download Your Playbook'}
            </button>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
              Downloads as a branded PDF — executive summary, all 10 modules,<br />and your next steps with Viveka's links.
            </div>
          </div>
        </div>
      </div>

      {/* ── Completed modules summary ── */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: 32,
      }}>
        <div style={{
          padding: '16px 24px',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
            YOUR COMPLETED MODULES
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Click any module to review or regenerate
          </div>
        </div>
        <div style={{ padding: '8px 0' }}>
          {MODULES.map((module, i) => {
            const done = !!getEffectiveOutput(state, module.id);
            return (
              <div
                key={module.id}
                onClick={() => setCurrentModule(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 24px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  borderBottom: i < MODULES.length - 1 ? '1px solid var(--bg)' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: done ? 'rgba(44,151,175,0.12)' : 'rgba(87,31,129,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', flexShrink: 0,
                }}>
                  {done ? '✅' : '○'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {module.number}. {module.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {module.subtitle}
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: done ? 'var(--teal)' : 'var(--text-muted)', fontWeight: 700 }}>
                  {done ? 'Complete' : 'Not started'} →
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── What's next ── */}
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        marginBottom: 32,
      }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.15rem',
          letterSpacing: '0.06em',
          color: 'var(--text-primary)',
          marginBottom: 6,
        }}>
          YOUR STRATEGY IS READY. NOW WHAT?
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 0 }}>
          A strategy document is only valuable when it's acted on. The next step is turning
          these outputs into consistent visibility, a growing audience, and real income.
          That's where guided implementation makes all the difference.
        </p>
      </div>

      {/* ── Viveka CTA cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>

        {/* Book a call */}
        <a
          href="https://calendly.com/vivekacoach/discovery-call"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'block',
            textDecoration: 'none',
            background: 'linear-gradient(135deg, var(--purple) 0%, #3d1660 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 24px',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(87,31,129,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>📅</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '0.06em', color: 'var(--gold)', marginBottom: 8 }}>
            BOOK A DISCOVERY CALL
          </div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 16 }}>
            Ready to turn your strategy into real traction? Let's talk about what guided
            implementation looks like for your specific business.
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 18px',
            background: 'var(--gold)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--sidebar-bg)',
            fontSize: '0.78rem',
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Schedule a Call →
          </div>
        </a>

        {/* Socials card */}
        <div style={{
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 24px',
        }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>🤝</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '0.06em', color: 'var(--purple)', marginBottom: 8 }}>
            CONNECT WITH VIVEKA
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
            Follow along for LinkedIn strategy, visibility advice, and real talk about
            building authority after 50.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                icon: '💼',
                label: 'LinkedIn',
                handle: 'Viveka von Rosen',
                url: 'https://linkedin.com/in/VivekavonRosen',
                color: '#0A66C2',
              },
              {
                icon: '📬',
                label: 'Substack',
                handle: 'vivekavonrosen.substack.com',
                url: 'https://vivekavonrosen.substack.com',
                color: 'var(--teal)',
              },
              {
                icon: '✉️',
                label: 'Email',
                handle: 'Viveka@beyondthedreamboard.com',
                url: 'mailto:Viveka@beyondthedreamboard.com',
                color: 'var(--purple)',
              },
            ].map(link => (
              <a
                key={link.label}
                href={link.url}
                target={link.label !== 'Email' ? '_blank' : undefined}
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = link.color; e.currentTarget.style.background = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = 'var(--bg)'; }}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{link.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {link.label}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {link.handle}
                  </div>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer brand sign-off ── */}
      <div style={{
        textAlign: 'center',
        padding: '32px 24px',
        borderTop: '1px solid var(--divider)',
      }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.4rem',
          letterSpacing: '0.1em',
          color: 'var(--purple)',
          marginBottom: 8,
        }}>
          BEYOND THE DREAM BOARD™
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Women's words will change the world.
        </div>
      </div>
    </div>
  );
}
