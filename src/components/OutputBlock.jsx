import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { copyToClipboard } from '../utils/export.js';
// PDF loaded dynamically so it doesn't bloat the initial bundle

export default function OutputBlock({
  moduleId, output, isStreaming, streamingText, onEditSave,
  moduleTitle, moduleSubtitle, moduleNum, brandName,
}) {
  const [isEditing, setIsEditing]     = useState(false);
  const [editValue, setEditValue]     = useState('');
  const [copyLabel, setCopyLabel]     = useState('Copy');
  const [pdfLabel, setPdfLabel]       = useState('PDF');

  const displayText = output || '';
  const liveText    = isStreaming ? streamingText : displayText;

  const handleEdit     = useCallback(() => { setEditValue(displayText); setIsEditing(true); }, [displayText]);
  const handleSaveEdit = useCallback(() => { onEditSave(editValue); setIsEditing(false); }, [editValue, onEditSave]);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(displayText);
    setCopyLabel('Copied!');
    setTimeout(() => setCopyLabel('Copy'), 2000);
  }, [displayText]);

  const handlePDF = useCallback(async () => {
    if (!displayText) return;
    setPdfLabel('Saving...');
    try {
      const { downloadModulePDF } = await import('../utils/pdf.js');
      downloadModulePDF(moduleTitle, moduleSubtitle, moduleNum, displayText, brandName);
    } catch (e) {
      console.error('PDF error:', e);
    }
    setTimeout(() => setPdfLabel('PDF'), 2000);
  }, [displayText, moduleTitle, moduleSubtitle, moduleNum, brandName]);

  if (!liveText && !isStreaming) {
    return (
      <div className="output-block">
        <div className="output-block-header">
          <div className="output-block-title">
            <span>📄</span> Strategy Output
          </div>
        </div>
        <div className="output-empty">
          <div className="output-empty-icon">✨</div>
          <div className="output-empty-title">Ready to Generate</div>
          <div className="output-empty-desc">
            Fill in the fields above and click Generate to build your strategy output.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="output-block fade-in">
      <div className="output-block-header">
        <div className="output-block-title">
          {isStreaming ? (
            <><div className="streaming-dot" /> Generating Strategy...</>
          ) : (
            <><span>✅</span> Strategy Output</>
          )}
          {!isStreaming && displayText && (
            <span className="output-saved-badge" style={{ marginLeft: 12 }}>Saved</span>
          )}
        </div>

        {!isStreaming && displayText && (
          <div className="output-actions">
            {/* Edit / Save */}
            <button
              className={`btn-output-action ${isEditing ? 'active' : ''}`}
              onClick={isEditing ? handleSaveEdit : handleEdit}
            >
              {isEditing ? '💾 Save' : '✏️ Edit'}
            </button>
            {isEditing && (
              <button className="btn-output-action" onClick={() => setIsEditing(false)}>
                ✕ Cancel
              </button>
            )}

            {/* Copy */}
            <button className="btn-output-action" onClick={handleCopy}>
              {copyLabel === 'Copied!' ? '✓' : '📋'} {copyLabel}
            </button>

            {/* PDF Download */}
            <button
              className="btn-output-action"
              onClick={handlePDF}
              style={{
                background: pdfLabel === 'Saving...'
                  ? 'rgba(223,178,74,0.2)'
                  : 'rgba(223,178,74,0.15)',
                borderColor: 'rgba(223,178,74,0.4)',
                color: '#DFB24A',
              }}
            >
              {pdfLabel === 'Saving...' ? '⏳' : '⬇'} {pdfLabel}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="output-edit-area">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            spellCheck="true"
          />
        </div>
      ) : (
        <div className="output-content md-content">
          {isStreaming && (
            <div className="streaming-indicator">
              <div className="streaming-dot" />
              Building your strategy...
            </div>
          )}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {liveText}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
