import { useApp } from '../context/AppContext.jsx';

const MODULES_PREVIEW = [
  { num: '01', icon: '🏗️', title: 'Business Context', desc: 'Strategic foundation and market analysis' },
  { num: '02', icon: '🧠', title: 'Audience Psychology', desc: 'Buyer psychology and messaging intelligence' },
  { num: '03', icon: '🎯', title: 'Authority Positioning', desc: 'Differentiation and credibility system' },
  { num: '04', icon: '🔭', title: 'Competitor White Space', desc: 'Content gap and opportunity analysis' },
  { num: '05', icon: '🏛️', title: 'Content Pillars', desc: 'Conversion-oriented content themes' },
  { num: '06', icon: '📡', title: 'Platform Strategy', desc: 'LinkedIn and Substack engine' },
  { num: '07', icon: '📅', title: '30-Day Content Plan', desc: 'Strategic visibility calendar' },
  { num: '08', icon: '✍️', title: 'Post Generator', desc: 'Scroll-stopping content creation' },
  { num: '09', icon: '💰', title: 'Monetization Strategy', desc: 'Audience conversion roadmap' },
  { num: '10', icon: '🚀', title: 'Revenue Acceleration', desc: '30-day income milestone plan' },
];

const FOR_WHOM = [
  { icon: '💼', title: 'The Departing Executive', desc: 'Leaving corporate and turning decades of expertise into consulting, coaching, or speaking.' },
  { icon: '🏢', title: 'The Experienced Founder', desc: 'Has results and credibility but lacks clear positioning, visible authority, and scalable revenue.' },
  { icon: '📣', title: 'The Invisible Expert', desc: 'Knows she has real value to offer but feels overwhelmed by LinkedIn, Substack, content, and AI.' },
  { icon: '🔄', title: 'The Strategic Transitioner', desc: 'Bored, burned out, or being pushed out — and knows she isn\'t done. Ready for a business built around her life.' },
];

const STEPS = [
  { num: '01', title: 'Complete Your Context', desc: 'The intake form builds your strategic foundation. Every module draws directly from it.' },
  { num: '02', title: 'Run Each Module', desc: 'Ten modules move you from clarity to positioning to content to revenue — in sequence.' },
  { num: '03', title: 'Strategy Compounds', desc: 'Each output feeds the next. Prior decisions become fixed context for deeper strategy.' },
  { num: '04', title: 'Edit and Refine', desc: 'Every output is editable. Shape the language until it sounds exactly like you.' },
  { num: '05', title: 'Export Your Document', desc: 'Download your complete strategy as a clean, reusable document you can act on immediately.' },
];

const OUTCOMES = [
  { label: 'Positioning Statement', desc: 'One sentence that says exactly who you serve and why you\'re different.' },
  { label: 'Audience Psychology Profile', desc: 'A deep understanding of what your audience thinks, fears, and needs to hear.' },
  { label: 'Authority Lane', desc: 'The specific territory you\'ll own — credibly and memorably.' },
  { label: 'Content Pillars', desc: 'Five strategic themes, each with a conversion purpose and 10 post ideas.' },
  { label: '30-Day Content Plan', desc: 'A full month of intentional posts mapped to reach, trust, and revenue goals.' },
  { label: 'Monetization Roadmap', desc: 'Your path from content and visibility to qualified leads and paying clients.' },
];

export default function Landing() {
  const { setView } = useApp();

  function handleStart() {
    setView('app');
  }

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          VISIBILITY <span>INFRASTRUCTURE</span> OS
        </div>
        <button className="btn-nav-cta" onClick={handleStart}>
          Start Building →
        </button>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-bg-gradient" />
        <div className="hero-bg-lines" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 60, position: 'relative', zIndex: 1 }}>
        <div className="hero-content" style={{ flex: '0 0 auto', maxWidth: 620 }}>
          <div className="hero-eyebrow">
            ✦ For Accomplished Women 50+ Building Next-Chapter Businesses
          </div>
          <h1 className="hero-title">
            TURN YOUR<br />
            <span>WISDOM</span><br />
            INTO TRACTION
          </h1>
          <div className="hero-subtitle">
            Clarity. Authority. Revenue.
          </div>
          <p className="hero-desc">
            Visibility Infrastructure OS is a guided strategy system that moves you from
            decades of expertise to visible authority to profitable business — using
            structured AI prompts, proven frameworks, and a clear path to income.
          </p>
          <div className="hero-cta-group">
            <button className="btn-hero-primary" onClick={handleStart}>
              <span>⚡</span> Build Your Strategy
            </button>
            <button
              className="btn-hero-secondary"
              onClick={() => document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See all 10 modules ↓
            </button>
          </div>

          {/* Inline stats — no floating cards */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            marginTop: 48,
            paddingTop: 28,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            {[
              { num: '10', label: 'Strategy modules' },
              { num: '1', label: 'Complete system' },
              { num: '60–90 min', label: 'To complete' },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2.2rem',
                  letterSpacing: '0.04em',
                  color: 'var(--gold)',
                  lineHeight: 1,
                }}>
                  {stat.num}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

          {/* Logo — right side of hero */}
          <div style={{
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingRight: 20,
          }}>
            <img
              src="/logo.png"
              alt="Beyond the Dream Board"
              style={{
                width: 260,
                height: 260,
                objectFit: 'contain',
                opacity: 0.88,
                filter: 'drop-shadow(0 8px 40px rgba(223,178,74,0.2))',
              }}
            />
          </div>
        </div>
      </section>

      {/* Gold Value Bar */}
      <div style={{
        background: 'var(--gold)',
        padding: '14px 60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        flexWrap: 'wrap',
      }}>
        {['Positioning Clarity', 'LinkedIn Authority', 'Substack Strategy', '30-Day Content Plan', 'Revenue Roadmap'].map(item => (
          <span key={item} style={{
            fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--sidebar-bg)'
          }}>
            ✦ {item}
          </span>
        ))}
      </div>

      {/* ── 10 MODULES — prominent, right after hero ── */}
      <section className="landing-section light" id="modules">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <span className="section-eyebrow">The System</span>
              <h2 className="section-title" style={{ marginBottom: 10 }}>
                10 modules.<br /><span>One clear path.</span>
              </h2>
              <p className="section-desc">
                From strategic foundation to revenue roadmap — each module builds on the last.
                Run them in sequence in a single session.
              </p>
            </div>
            <button className="btn-hero-primary" onClick={handleStart} style={{ flexShrink: 0 }}>
              <span>⚡</span> Start Now
            </button>
          </div>

          {/* 2-row × 5-col grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
          }}>
            {MODULES_PREVIEW.map((m, i) => (
              <div key={m.num} style={{
                background: 'white',
                border: '1px solid var(--border)',
                borderTop: `3px solid ${i < 5 ? 'var(--purple)' : 'var(--teal)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '20px 16px',
                transition: 'box-shadow 0.18s ease, transform 0.18s ease',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
                onClick={handleStart}
              >
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Module {m.num}
                </div>
                <div style={{ fontSize: '1.4rem', marginBottom: 10 }}>{m.icon}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.2 }}>
                  {m.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {m.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Row labels */}
          <div style={{ display: 'flex', marginTop: 12, gap: 16 }}>
            <div style={{ flex: '0 0 calc(50% - 8px)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--purple)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Modules 01–05: Strategy foundation — clarity, positioning, and content</span>
            </div>
            <div style={{ flex: '0 0 calc(50% - 8px)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--teal)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Modules 06–10: Execution — platform, content creation, and revenue</span>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, var(--purple), var(--teal))' }} />

      {/* Problem / positioning */}
      <section className="landing-section muted" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <span className="section-eyebrow">Why This Exists</span>
          <h2 className="section-title" style={{ fontSize: '2.2rem' }}>
            You have decades of expertise.<br />
            <span>What you need is a system to make it visible.</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginTop: 16 }}>
            Most accomplished women 50+ don't have a knowledge problem.
            They have a packaging problem. A positioning problem. A visibility problem.
            They know what they know — they just don't have a clear system to turn it into
            authority, audience, and income.
          </p>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginTop: 14 }}>
            Visibility Infrastructure OS solves that — module by module, in one session.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-section light" id="how-it-works">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <span className="section-eyebrow">How It Works</span>
          <h2 className="section-title">
            Clarity first. Positioning next.<br />
            <span>Content after that. Conversion throughout.</span>
          </h2>

          <div className="steps-row">
            {STEPS.map(step => (
              <div key={step.num} className="step-item">
                <div className="step-circle">{step.num}</div>
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Have */}
      <section className="landing-section muted">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <span className="section-eyebrow">What You Leave With</span>
          <h2 className="section-title">Six strategy assets.<br /><span>Built for your business. In one session.</span></h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 20,
            marginTop: 40,
          }}>
            {OUTCOMES.map(item => (
              <div key={item.label} style={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px 20px',
                borderTop: '3px solid var(--purple)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.05em',
                  color: 'var(--purple)',
                  marginBottom: 8,
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Whom */}
      <section className="landing-section dark">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <span className="section-eyebrow" style={{ color: 'var(--gold)' }}>Who This Is For</span>
          <h2 className="section-title" style={{ color: 'white', marginBottom: 12 }}>
            Built for women who are<br /><span style={{ color: 'var(--gold)' }}>accomplished, not starting over.</span>
          </h2>
          <p className="section-desc" style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 40 }}>
            You've already built something. Now it's time to make that expertise work for you
            — on your terms, in your voice, at your pace.
          </p>

          <div className="for-whom-grid">
            {FOR_WHOM.map(item => (
              <div key={item.title} className="for-whom-card">
                <div className="for-whom-icon">{item.icon}</div>
                <div>
                  <div className="for-whom-title">{item.title}</div>
                  <div className="for-whom-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, var(--teal), var(--gold))' }} />

      {/* What You Need */}
      <section className="landing-section light" style={{ padding: '60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <span className="section-eyebrow">What You Need to Get Started</span>
            <h2 className="section-title" style={{ fontSize: '2rem' }}>
              Two things.<br /><span>That's it.</span>
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 16 }}>
              You need access to this tool and about 60–90 minutes to run through all ten modules.
              No tech background required. No existing audience needed. No finished offer necessary.
            </p>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 12 }}>
              Clarity comes through the process — that's exactly what this system is designed to do.
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(87,31,129,0.06), rgba(44,151,175,0.06))',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: 32,
          }}>
            {[
              ['✅', '60–90 minutes of focused time'],
              ['✅', 'Honest answers about your business and goals'],
              ['✅', 'A willingness to think strategically about your expertise'],
              ['❌', 'A tech background — none required'],
              ['❌', 'An existing audience — start from zero'],
              ['❌', 'A finished offer — clarity comes through the process'],
            ].map(([icon, text]) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '10px 0',
                borderBottom: '1px solid var(--border)',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-cta-content">
          <div className="cta-title">
            YOUR WISDOM<br />
            IS THE <span>STRATEGY.</span>
          </div>
          <p className="cta-desc">
            Stop waiting for the right moment or the perfect plan. This system
            builds the plan — from what you already know. Start now.
          </p>
          <button className="btn-hero-primary" onClick={handleStart} style={{ margin: '0 auto', display: 'inline-flex' }}>
            <span>⚡</span> Build Your Visibility Strategy
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-logo">
          VISIBILITY <span>INFRASTRUCTURE</span> OS
        </div>
        <div className="footer-copy">
          © {new Date().getFullYear()} Beyond the Dream Board™ · Women's words will change the world.
        </div>
      </footer>
    </div>
  );
}
