// ============================================================
// Export Utilities
// Generates clean, reusable strategy documents
// ============================================================

import { MODULES } from '../data/modules.js';
import { getEffectiveOutput } from './storage.js';

// ── Build the executive summary prompt ──────────────────────
export function buildSummaryPrompt(state) {
  const ctx = state.businessContext || {};

  // Pull the most strategically rich outputs to inform the summary
  const positioning = getEffectiveOutput(state, 'authority-positioning');
  const audience    = getEffectiveOutput(state, 'audience-psychology');
  const business    = getEffectiveOutput(state, 'business-context');

  const contextStr = `
Brand: ${ctx.brandName || ''}
Business description: ${ctx.businessDesc || ''}
Niche: ${ctx.niche || ''}
Primary offer: ${ctx.primaryOffer || ''}
Target audience: ${ctx.targetAudience || ''}
Audience problem: ${ctx.audienceProblem || ''}
Audience desire: ${ctx.audienceDesire || ''}
Unique mechanism: ${ctx.uniqueMechanism || ''}
Brand strengths: ${ctx.brandStrengths || ''}
Founder background: ${ctx.founderBg || ''}
Revenue goal: ${ctx.revenueGoal || ''}
`.trim();

  const strategyContext = [
    business    ? `BUSINESS ANALYSIS:\n${business.slice(0, 1200)}` : '',
    audience    ? `AUDIENCE PSYCHOLOGY:\n${audience.slice(0, 1200)}` : '',
    positioning ? `AUTHORITY POSITIONING:\n${positioning.slice(0, 1200)}` : '',
  ].filter(Boolean).join('\n\n---\n\n');

  return `You are writing the executive summary page for a professional strategy playbook.

Based on the business context and strategy outputs below, write a sharp, specific, single-paragraph executive summary — approximately 120–150 words. It must cover all four elements in this order, woven together as flowing prose (not bullet points):

1. ICP (Ideal Customer Profile) — who specifically this business serves
2. The ICP's core point of pain — what they struggle with most
3. How this business solves it — the mechanism or approach
4. The USP and positioning statement — what makes this brand distinct and credible

Write in third person. Use plain, grounded language. Avoid generic phrases like "empowers," "transforms," or "passionate about." Make it commercially sharp and specific to this exact business. This will appear at the top of their strategy playbook so it must read as a confident, precise declaration of what this business does and for whom.

Do not include any heading, label, or preamble — output only the paragraph itself.

---

BUSINESS CONTEXT:
${contextStr}

---

${strategyContext}`;
}

// ── Generate the summary via the API ───────────────────────
export async function generateExecutiveSummary(state) {
  const prompt = buildSummaryPrompt(state);

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error('Failed to generate executive summary');
  }

  // Collect the full streamed response
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
          fullText += parsed.delta.text;
        }
      } catch {}
    }
  }

  return fullText.trim();
}

// ── Build the full markdown document ───────────────────────
export function generateMarkdownExport(state, executiveSummary = '') {
  const ctx = state.businessContext || {};
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let md = '';

  // ── Cover ──
  md += `# VISIBILITY INFRASTRUCTURE OS PLAYBOOK\n`;
  md += `## ${ctx.brandName || 'Your Business'}\n\n`;
  md += `*Turn your wisdom into traction.*\n`;
  md += `Generated: ${dateStr}\n\n`;
  md += `---\n\n`;

  // ── Executive Summary ──
  md += `## EXECUTIVE SUMMARY\n\n`;

  if (executiveSummary) {
    md += `${executiveSummary}\n\n`;
  }

  // Key facts table beneath the paragraph
  const summaryFields = [
    ['Ideal Customer Profile', ctx.targetAudience],
    ['Core Audience Pain',     ctx.audienceProblem],
    ['Primary Offer',         ctx.primaryOffer],
    ['Unique Mechanism',      ctx.uniqueMechanism],
    ['Revenue Goal',          ctx.revenueGoal],
    ['Platforms',             ctx.platforms],
    ['Brand Voice',           ctx.brandVoice],
  ];

  md += `### AT A GLANCE\n\n`;
  summaryFields.forEach(([label, value]) => {
    if (value) md += `**${label}:** ${value}\n\n`;
  });

  md += `---\n\n`;

  // ── Module outputs ──
  MODULES.forEach((module) => {
    const output = getEffectiveOutput(state, module.id);
    if (!output) return;

    md += `## MODULE ${module.number}: ${module.title.toUpperCase()}\n`;
    md += `*${module.subtitle}*\n\n`;
    md += output;
    md += '\n\n---\n\n';
  });

  // ── Sign-off ──
  md += `\n*This playbook was generated using Visibility Infrastructure OS.*\n`;
  md += `*© ${now.getFullYear()} Beyond the Dream Board™ — Women's words will change the world.*\n`;

  return md;
}

// ── Trigger the file download ───────────────────────────────
export function downloadMarkdown(state, executiveSummary = '') {
  const md = generateMarkdownExport(state, executiveSummary);
  const brandName = (state.businessContext?.brandName || 'strategy')
    .replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  const filename = `vios-playbook-${brandName}-${date}.md`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).then(() => true).catch(() => {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const success = document.execCommand('copy');
    document.body.removeChild(el);
    return success;
  });
}

export function getCompletionStats(state) {
  const total     = MODULES.length;
  const completed = MODULES.filter(m => getEffectiveOutput(state, m.id)).length;
  const percent   = Math.round((completed / total) * 100);
  return { total, completed, percent };
}
