import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { getModuleData, getEffectiveOutput } from '../utils/storage.js';
import { buildCommunityPrompt, COMMUNITY_STRATEGY_ID } from '../data/modules.js';
import { streamCompletion } from '../utils/api.js';
import CommunityIntake from './CommunityIntake.jsx';

// Community Strategy INTAKE — rendered inside Module 1 (Business Context).
// The generated output is displayed separately in Module 2 (Audience
// Psychology) via CommunityOutputSection. Both share the stored data under
// the COMMUNITY_STRATEGY_ID key.
export default function CommunityIntakeSection() {
  const { state, saveModuleOutput, saveModuleInputs } = useApp();

  const moduleData = getModuleData(state, COMMUNITY_STRATEGY_ID);
  const existingOutput = getEffectiveOutput(state, COMMUNITY_STRATEGY_ID);

  const [inputs, setInputs] = useState(moduleData.inputs || {});
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  const q1 = inputs.q1_considering || '';
  const declined = q1 === 'No';
  const ready = q1 === 'Yes' || q1 === 'Maybe';

  function handleInputChange(fieldId, value) {
    const updated = { ...inputs, [fieldId]: value };
    setInputs(updated);
    saveModuleInputs(COMMUNITY_STRATEGY_ID, updated);
  }

  function handleGenerate() {
    setError('');
    setIsGenerating(true);
    setStreamingText('');

    let prompt;
    try {
      prompt = buildCommunityPrompt(inputs);
    } catch (e) {
      setError('Failed to build prompt: ' + e.message);
      setIsGenerating(false);
      return;
    }

    abortRef.current = streamCompletion(
      prompt,
      (_chunk, full) => setStreamingText(full),
      (fullText) => {
        saveModuleOutput(COMMUNITY_STRATEGY_ID, fullText);
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
      if (streamingText) saveModuleOutput(COMMUNITY_STRATEGY_ID, streamingText);
    }
  }

  return (
    <div style={{ marginTop: 32, paddingTop: 28, borderTop: '2px solid var(--divider, #e6e0f0)' }}>
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            letterSpacing: '0.06em',
            color: 'var(--purple)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          🤝 Community Strategy
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              border: '1px solid var(--divider, #e6e0f0)',
              borderRadius: 999,
              padding: '2px 8px',
            }}
          >
            Optional
          </span>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 6 }}>
          Deciding whether to build a community for your audience? Answer three quick questions here —
          your personalized strategy snapshot appears in Module 2 (Audience Psychology).
        </p>
      </div>

      <CommunityIntake values={inputs} onChange={handleInputChange} />

      {/* Generate — hidden when the client has declined a community */}
      {!declined && (
        <div className="generate-section">
          <div className="generate-section-info">
            <div className="generate-section-title">
              {existingOutput ? '↻ Re-plot your community strategy' : '⚡ Plot your community strategy'}
            </div>
            <div className="generate-section-desc">
              {existingOutput
                ? 'Your strategy is saved in Module 2. Running again will replace it.'
                : ready
                ? 'Generates a focused strategy snapshot. It will appear in Module 2.'
                : 'Answer the first question above to begin.'}
            </div>
          </div>

          {isGenerating ? (
            <button
              className="btn-generate"
              onClick={handleAbort}
              style={{ background: 'linear-gradient(135deg, #c0392b, #96281b)' }}
            >
              <div className="spinner" />
              Stop
            </button>
          ) : (
            <button className="btn-generate" onClick={handleGenerate} disabled={!ready}>
              <span>✨</span>
              {existingOutput ? 'Re-plot' : 'Plot it'}
            </button>
          )}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(192,57,43,0.08)',
            border: '1px solid rgba(192,57,43,0.25)',
            borderRadius: 'var(--radius-md)',
            color: '#c0392b',
            fontSize: '0.85rem',
            marginTop: 12,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Live progress while generating (transient — the saved result lives in Module 2) */}
      {isGenerating && (
        <div
          style={{
            marginTop: 16,
            padding: '14px 16px',
            background: 'var(--bg-alt, #f8f6fc)',
            border: '1px solid var(--divider, #e6e0f0)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            lineHeight: 1.6,
            color: 'var(--text, #2b2340)',
            whiteSpace: 'pre-wrap',
            maxHeight: 260,
            overflowY: 'auto',
          }}
        >
          {streamingText || 'Generating your community strategy…'}
        </div>
      )}

      {/* Post-generation confirmation pointing to Module 2 */}
      {!isGenerating && !declined && existingOutput && (
        <div
          style={{
            marginTop: 14,
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(44,151,175,0.1)',
            border: '1px solid rgba(44,151,175,0.3)',
            color: 'var(--teal-dark)',
            fontSize: '0.82rem',
            lineHeight: 1.5,
          }}
        >
          ✅ Your community strategy is ready — view and edit it in <strong>Module 2 · Audience Psychology</strong>.
        </div>
      )}
    </div>
  );
}
