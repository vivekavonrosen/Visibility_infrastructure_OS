import { useApp } from '../context/AppContext.jsx';
import { getModuleData, getEffectiveOutput } from '../utils/storage.js';
import { COMMUNITY_STRATEGY_ID } from '../data/modules.js';
import OutputBlock from './OutputBlock.jsx';

// Community Strategy OUTPUT — displayed inside Module 2 (Audience
// Psychology). The intake + generation live in Module 1 (Business Context)
// via CommunityIntakeSection; both share the COMMUNITY_STRATEGY_ID store.
// Renders nothing until a strategy has actually been generated, so it
// never clutters Module 2 for users who skip the community questions.
export default function CommunityOutputSection() {
  const { state, saveEditedOutput } = useApp();

  const output = getEffectiveOutput(state, COMMUNITY_STRATEGY_ID);
  const inputs = getModuleData(state, COMMUNITY_STRATEGY_ID).inputs || {};
  const declined = inputs.q1_considering === 'No';

  if (!output || declined) return null;

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
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 6 }}>
          Generated from your answers in Module 1. Edit it inline just like any other output — it's
          included in your Flight Log export.
        </p>
      </div>

      <OutputBlock
        moduleId={COMMUNITY_STRATEGY_ID}
        output={output}
        isStreaming={false}
        streamingText=""
        onEditSave={(val) => saveEditedOutput(COMMUNITY_STRATEGY_ID, val)}
        moduleTitle="Community Strategy"
        moduleSubtitle="Whether, Where & How to Build"
        moduleNum={2}
        brandName={state.businessContext?.brandName || ''}
      />
    </div>
  );
}
