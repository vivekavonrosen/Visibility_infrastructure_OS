import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { generateExecutiveSummary, getCompletionStats } from '../utils/export.js';

export default function ExportBar() {
  const { state, setView } = useApp();
  const stats = getCompletionStats(state);
  const [exportStep, setExportStep] = useState('idle');

  async function handleExport() {
    setExportStep('summarising');
    let summary = '';
    try {
      summary = await generateExecutiveSummary(state);
    } catch (e) {
      console.error('Summary failed:', e);
    }
    setExportStep('downloading');
    try {
      const pdfModule = await import('../utils/pdf.js');
      pdfModule.downloadPlaybookPDF(state, summary);
      setExportStep('done');
    } catch (e) {
      console.error('PDF export failed:', e);
      alert('PDF generation failed: ' + e.message);
      setExportStep('idle');
      return;
    }
    setTimeout(() => setExportStep('idle'), 2500);
  }

  return (
    <div className="export-bar">
      <div className="export-bar-left">
        <div className="export-bar-logo">
          VISIBILITY <span>INFRASTRUCTURE</span> OS
        </div>
        <div className="export-bar-progress">
          <strong>{stats.completed}</strong>/{stats.total} modules complete &nbsp;·&nbsp; <strong>{stats.percent}%</strong>
        </div>
      </div>

      <div className="export-bar-right">
        <button className="btn-export" onClick={handleExport} disabled={stats.completed === 0 || exportStep !== 'idle'}>
          {exportStep === 'summarising' && '✍️ Writing Summary...'}
          {exportStep === 'downloading' && '⏳ Building...'}
          {exportStep === 'done'        && '✅ Downloaded!'}
          {exportStep === 'idle'        && '⬇ Export Playbook'}
        </button>

        <button
          style={{
            padding: '6px 14px',
            background: 'transparent',
            border: '1.5px solid rgba(255,255,255,0.6)',
            borderRadius: 'var(--radius-sm)',
            color: '#ffffff',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
          onClick={() => setView('landing')}
        >
          ← Home
        </button>
      </div>
    </div>
  );
}
