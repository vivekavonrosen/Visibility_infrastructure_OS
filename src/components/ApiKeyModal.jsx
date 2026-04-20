import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { validateApiKey } from '../utils/api.js';

export default function ApiKeyModal({ onClose }) {
  const { state, setApiKey } = useApp();
  const [value, setValue] = useState(state.apiKey || '');
  const [error, setError] = useState('');

  function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter your API key.');
      return;
    }
    if (!validateApiKey(trimmed)) {
      setError('This doesn\'t look like a valid Anthropic API key. It should start with sk-ant-');
      return;
    }
    setApiKey(trimmed);
    onClose();
  }

  function handleClear() {
    setApiKey('');
    setValue('');
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <div className="modal-title">CONNECT YOUR <span>API KEY</span></div>
          <div className="modal-subtitle">Anthropic Claude — required for AI generation</div>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            Your API key is stored only in your browser (localStorage) and never sent anywhere
            except directly to Anthropic's API. You need an Anthropic account and API key to
            generate strategy outputs.
          </p>

          <p className="modal-desc" style={{ marginBottom: 20 }}>
            Get your key at{' '}
            <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">
              console.anthropic.com
            </a>
            . Each module generation costs a few cents of API usage.
          </p>

          <div className="form-field" style={{ marginBottom: 20 }}>
            <label className="form-label">
              Anthropic API Key <span>*</span>
            </label>
            <input
              type="password"
              className="form-input"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              placeholder="sk-ant-api03-..."
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoComplete="off"
            />
            {error && (
              <p style={{ fontSize: '0.78rem', color: '#c0392b', marginTop: 6 }}>{error}</p>
            )}
          </div>

          <div style={{
            padding: '12px 14px',
            background: 'rgba(44,151,175,0.08)',
            border: '1px solid rgba(44,151,175,0.2)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem',
            color: 'var(--teal-dark)',
            lineHeight: 1.5
          }}>
            💡 <strong>Recommended model:</strong> claude-sonnet-4 is used by default — fast and cost-effective.
            Each module generation typically costs $0.01–$0.05.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={handleSave}>
            Save API Key
          </button>
          {state.apiKey && (
            <button className="btn-secondary" onClick={handleClear}>
              Remove
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
