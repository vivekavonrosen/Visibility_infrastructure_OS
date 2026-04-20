import { useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { MODULES, INTAKE_FIELDS } from '../data/modules.js';
import { getModuleData, getEffectiveOutput } from '../utils/storage.js';
import { streamCompletion } from '../utils/api.js';
import OutputBlock from './OutputBlock.jsx';


// Business Context gets special treatment — it's the intake form
function BusinessContextInputs({ data, onChange }) {
  const sections = [
    {
      title: 'Core Business',
      fields: INTAKE_FIELDS.filter(f => ['brandName','businessDesc','niche','primaryOffer','secondaryOffers'].includes(f.id)),
    },
    {
      title: 'Your Audience',
      fields: INTAKE_FIELDS.filter(f => ['targetAudience','audienceProblem','audienceDesire'].includes(f.id)),
    },
    {
      title: 'Your Authority',
      fields: INTAKE_FIELDS.filter(f => ['brandStrengths','founderBg','uniqueMechanism'].includes(f.id)),
    },
    {
      title: 'Competitive Landscape',
      fields: INTAKE_FIELDS.filter(f => ['competitor1','competitor2','competitor3'].includes(f.id)),
    },
    {
      title: 'Platforms & Content',
      fields: INTAKE_FIELDS.filter(f => ['platforms','contentApproach','brandVoice','callToAction'].includes(f.id)),
    },
    {
      title: 'Goals & Business Model',
      fields: INTAKE_FIELDS.filter(f => ['growthGoal','revenueGoal','pricePoint','salesModel','geography','constraints'].includes(f.id)),
    },
  ];

  return (
    <>
      {sections.map((section) => (
        <div key={section.title} className="form-section">
          <div className="form-section-title">{section.title}</div>
          <div className="form-grid">
            {section.fields.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                value={data[field.id] || ''}
                onChange={(val) => onChange(field.id, val)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

// Reusable field input
function FieldInput({ field, value, onChange }) {
  const isWide = field.type === 'textarea';

  return (
    <div className={`form-field ${isWide ? 'span-2' : ''}`}>
      <label className="form-label">
        {field.label}
        {field.required && <span> *</span>}
      </label>
      {field.hint && <p className="form-hint">{field.hint}</p>}

      {field.type === 'textarea' ? (
        <textarea
          className={`form-textarea ${field.tall ? 'tall' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ''}
        />
      ) : field.type === 'select' ? (
        <select
          className="form-select form-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          className="form-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ''}
        />
      )}
    </div>
  );
}

export default function ModuleShell({ moduleIndex, onNavigate }) {
  const { state, setBusinessContext, saveModuleOutput, saveModuleInputs, saveEditedOutput, setCurrentModule } = useApp();
  const module = MODULES[moduleIndex];
  const moduleData = getModuleData(state, module.id);
  const existingOutput = getEffectiveOutput(state, module.id);

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  // Website scraper state (Module 1 only)
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapeStatus, setScrapeStatus] = useState('idle');
  const [scrapeMsg, setScrapeMsg] = useState('');

  // Local state for additional module inputs
  const [localInputs, setLocalInputs] = useState(moduleData.inputs || {});
  const [localCtx, setLocalCtx] = useState(state.businessContext || {});

  // Website scraper handler
  async function handleScrape() {
    const trimmed = scrapeUrl.trim();
    if (!trimmed) return;
    const fullUrl = trimmed.startsWith('http') ? trimmed : 'https://' + trimmed;
    setScrapeStatus('loading');
    setScrapeMsg('');
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setScrapeStatus('error');
        setScrapeMsg(json.error || 'Something went wrong. Try again.');
        return;
      }
      const filled = Object.fromEntries(
        Object.entries(json.data).filter(([, v]) => v && v.trim())
      );
      const updated = { ...localCtx, ...filled };
      setLocalCtx(updated);
      setBusinessContext(updated);
      setScrapeStatus('success');
      setScrapeMsg(`${Object.keys(filled).length} fields pre-filled from your site. Review and edit below, then generate.`);
    } catch {
      setScrapeStatus('error');
      setScrapeMsg('Could not reach the server. Try again.');
    }
  }

  // Get prior module's output for context
  function getPriorOutput() {
    if (moduleIndex === 0) return null;
    // Collect outputs from all prior modules
    const priorOutputs = MODULES
      .slice(0, moduleIndex)
      .map(m => getEffectiveOutput(state, m.id))
      .filter(Boolean);
    if (!priorOutputs.length) return null;
    // Use immediately prior module's output as primary context
    return priorOutputs[priorOutputs.length - 1];
  }

  function handleBusinessContextChange(fieldId, value) {
    const updated = { ...localCtx, [fieldId]: value };
    setLocalCtx(updated);
    setBusinessContext(updated);
  }

  function handleInputChange(fieldId, value) {
    const updated = { ...localInputs, [fieldId]: value };
    setLocalInputs(updated);
    saveModuleInputs(module.id, updated);
  }

  async function handleGenerate() {
    setError('');
    setIsGenerating(true);
    setStreamingText('');

    // Build prompt
    const ctx = moduleIndex === 0 ? localCtx : state.businessContext;
    const prior = getPriorOutput();
    const extras = moduleIndex === 0 ? null : localInputs;

    let prompt;
    try {
      if (moduleIndex === 0) {
        prompt = module.buildPrompt(ctx);
      } else {
        prompt = module.buildPrompt(ctx, prior, extras);
      }
    } catch (e) {
      setError('Failed to build prompt: ' + e.message);
      setIsGenerating(false);
      return;
    }

    abortRef.current = streamCompletion(
      prompt,
      (chunk, full) => {
        setStreamingText(full);
      },
      (fullText) => {
        saveModuleOutput(module.id, fullText);
        setIsGenerating(false);
        setStreamingText('');
      },
      (errMsg) => {
        setError(errMsg);
        setIsGenerating(false);
        setStreamingText('');
      }
    );
  }

  function handleAbort() {
    if (abortRef.current) {
      abortRef.current.abort();
      setIsGenerating(false);
      if (streamingText) {
        saveModuleOutput(module.id, streamingText);
      }
    }
  }

  const priorOutput = getPriorOutput();
  const hasPriorContext = moduleIndex > 0 && !!priorOutput;
  const isFirstModule = moduleIndex === 0;

  return (
    <div className="module-area fade-in">
      {/* Module Header */}
      <div className="module-header">
        <div className="module-num-badge">
          {module.icon} Module {module.number} of {MODULES.length}
        </div>
        <h1 className="module-title">{module.title}</h1>
        <div className="module-subtitle">{module.subtitle}</div>
        <p className="module-desc">{module.description}</p>
      </div>

      {/* Prior Context Banner */}
      {hasPriorContext && (
        <div className="context-banner">
          <span className="context-banner-icon">🔗</span>
          <div className="context-banner-text">
            <strong>Context carried forward</strong> from Module {MODULES[moduleIndex - 1].number}: {MODULES[moduleIndex - 1].title}.
            The AI will use your prior strategy output as fixed context for this module.
          </div>
        </div>
      )}

      {/* Inputs */}
      {isFirstModule && (
        <div style={{
          background: 'linear-gradient(135deg, var(--purple) 0%, #3d1660 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          marginBottom: 28,
          boxShadow: '0 4px 20px rgba(87,31,129,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
            <div style={{ fontSize: '1.6rem', lineHeight: 1, flexShrink: 0 }}>🌐</div>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                letterSpacing: '0.08em',
                color: 'white',
                marginBottom: 5,
              }}>
                START WITH YOUR WEBSITE
              </div>
              <div style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                Enter your URL and we'll read your site and pre-fill as many fields as possible.
                You review and edit everything before generating.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="url"
              value={scrapeUrl}
              onChange={e => { setScrapeUrl(e.target.value); setScrapeStatus('idle'); setScrapeMsg(''); }}
              placeholder="https://yourdomain.com"
              onKeyDown={e => e.key === 'Enter' && handleScrape()}
              disabled={scrapeStatus === 'loading'}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.12)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            <button
              onClick={handleScrape}
              disabled={!scrapeUrl.trim() || scrapeStatus === 'loading'}
              style={{
                padding: '10px 22px',
                background: scrapeStatus === 'loading' ? 'rgba(223,178,74,0.5)' : 'var(--gold)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'var(--sidebar-bg)',
                fontSize: '0.82rem',
                fontWeight: 900,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: scrapeStatus === 'loading' ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.18s ease',
              }}
            >
              {scrapeStatus === 'loading' ? (
                <><div style={{
                  width: 14, height: 14,
                  border: '2px solid rgba(26,10,46,0.3)',
                  borderTopColor: 'var(--sidebar-bg)',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} /> Reading...</>
              ) : <>⚡ Read My Site</>}
            </button>
          </div>

          {scrapeMsg && (
            <div style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              background: scrapeStatus === 'success'
                ? 'rgba(44,151,175,0.2)'
                : 'rgba(192,57,43,0.2)',
              border: `1px solid ${scrapeStatus === 'success' ? 'rgba(44,151,175,0.5)' : 'rgba(255,100,80,0.4)'}`,
              color: scrapeStatus === 'success' ? '#a8e6d8' : '#ffb3a7',
            }}>
              {scrapeStatus === 'success' ? '✅ ' : '⚠️ '}{scrapeMsg}
            </div>
          )}

          <div style={{ marginTop: 10, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
            Works best with your home page or about page. All fields are editable after import.
          </div>
        </div>
      )}

      {isFirstModule ? (
        <BusinessContextInputs
            data={localCtx}
            onChange={handleBusinessContextChange}
          />
      ) : (
        module.additionalFields && module.additionalFields.length > 0 && (
          <div className="form-section">
            <div className="form-section-title">Additional Context</div>
            <div className="form-grid">
              {module.additionalFields.map((field) => (
                <FieldInput
                  key={field.id}
                  field={field}
                  value={localInputs[field.id] || (field.type === 'select' ? field.options?.[0] : '')}
                  onChange={(val) => handleInputChange(field.id, val)}
                />
              ))}
            </div>
          </div>
        )
      )}

      {/* Generate Section */}
      <div className="generate-section">
        <div className="generate-section-info">
          <div className="generate-section-title">
            {existingOutput ? '↻ Regenerate Strategy Output' : '⚡ Generate Strategy Output'}
          </div>
          <div className="generate-section-desc">
            {existingOutput
              ? 'You have a saved output. Regenerating will replace it.'
              : isFirstModule
              ? 'Fill in your business context above, then generate your strategic foundation.'
              : 'The AI will use your business context plus all prior strategy outputs.'
            }
          </div>
        </div>

        {isGenerating ? (
          <button className="btn-generate" onClick={handleAbort} style={{ background: 'linear-gradient(135deg, #c0392b, #96281b)' }}>
            <div className="spinner" />
            Stop Generation
          </button>
        ) : (
          <button
            className="btn-generate"
            onClick={handleGenerate}
            disabled={isFirstModule && !localCtx.brandName?.trim()}
          >
            <span>✨</span>
            {existingOutput ? 'Regenerate' : 'Generate'}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(192,57,43,0.08)',
          border: '1px solid rgba(192,57,43,0.25)',
          borderRadius: 'var(--radius-md)',
          color: '#c0392b',
          fontSize: '0.85rem',
          marginBottom: 16,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Output */}
      <OutputBlock
        moduleId={module.id}
        output={existingOutput}
        isStreaming={isGenerating}
        streamingText={streamingText}
        onEditSave={(val) => saveEditedOutput(module.id, val)}
        moduleTitle={module.title}
        moduleSubtitle={module.subtitle}
        moduleNum={module.number}
        brandName={state.businessContext?.brandName || ''}
      />

      {/* Bottom Navigation */}
      <div className="module-nav-footer">
        <button
          className="btn-nav"
          onClick={() => setCurrentModule(Math.max(0, moduleIndex - 1))}
          disabled={moduleIndex === 0}
          style={{ opacity: moduleIndex === 0 ? 0 : 1 }}
        >
          ← Previous
        </button>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {moduleIndex + 1} of {MODULES.length}
        </span>

        {moduleIndex < MODULES.length - 1 ? (
          <button
            className="btn-nav btn-nav-next"
            onClick={() => setCurrentModule(moduleIndex + 1)}
          >
            Next Module →
          </button>
        ) : (
          <button
            className="btn-nav btn-nav-next"
            onClick={() => setCurrentModule(10)}
            style={{
              background: 'linear-gradient(135deg, var(--gold), var(--gold-muted))',
              borderColor: 'var(--gold)',
              color: 'var(--sidebar-bg)',
              boxShadow: '0 4px 16px rgba(223,178,74,0.35)',
            }}
          >
            🎉 View Your Playbook →
          </button>
        )}
      </div>
    </div>
  );
}
