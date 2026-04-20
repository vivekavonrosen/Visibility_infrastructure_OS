// ============================================================
// PDF Generator — Visibility Infrastructure OS
// Light background, dark text, clean typography throughout
// ============================================================

import { jsPDF } from 'jspdf';

const C = {
  purple:   [87,  31,  129],
  purpleL:  [240, 234, 250],  // very light purple for section headers
  gold:     [190, 148, 40],   // slightly darker gold for readability on white
  goldL:    [253, 247, 229],  // light gold background
  teal:     [30,  120, 140],
  dark:     [26,  10,  46],
  text:     [35,  25,  55],   // near-black, readable
  sub:      [80,  70,  100],  // secondary text
  muted:    [140, 130, 160],
  divider:  [210, 200, 228],
  bg:       [255, 255, 255],
  bgAlt:    [248, 246, 252],  // very subtle off-white for alternating rows
};

const PW  = 210;
const PH  = 297;
const M   = 18;
const CW  = PW - M * 2;
const FH  = 13;
const LH  = 5.2;   // line height for body text (9pt)
const BLH = 5.5;   // bullet line height

// ── Blob-based download — works everywhere ─────────────────
function savePDF(doc, filename) {
  const blob = doc.output('blob');
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 400);
}

// ── Strip markdown inline syntax ───────────────────────────
function clean(t) {
  return (t || '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g,   '$1')
    .replace(/`(.+?)`/g,     '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim();
}

function wrap(doc, text, maxW) {
  return doc.splitTextToSize(text, maxW);
}

// ── Tokenise markdown ───────────────────────────────────────
function tokenize(text) {
  const out = [];
  for (const raw of (text || '').split('\n')) {
    const line = raw;
    if      (line.startsWith('# '))  out.push({ t:'h1', v: line.slice(2).trim() });
    else if (line.startsWith('## ')) out.push({ t:'h2', v: line.slice(3).trim() });
    else if (line.startsWith('### '))out.push({ t:'h3', v: line.slice(4).trim() });
    else if (/^[-*] /.test(line))    out.push({ t:'li', v: line.replace(/^[-*] /,'').trim() });
    else if (/^\d+\. /.test(line))   out.push({ t:'ol', v: line.replace(/^\d+\. /,'').trim(), n: line.match(/^(\d+)/)[1] });
    else if (line.startsWith('> '))  out.push({ t:'bq', v: line.slice(2).trim() });
    else if (/^---/.test(line))      out.push({ t:'hr' });
    else if (line.trim() === '')     out.push({ t:'sp' });
    else {
      const last = out[out.length - 1];
      if (last && last.t === 'p') last.v += ' ' + line.trim();
      else out.push({ t:'p', v: line.trim() });
    }
  }
  return out;
}

// Estimate height a token will need
function tokenHeight(doc, tok) {
  switch (tok.t) {
    case 'h1': return 16;
    case 'h2': return 14;
    case 'h3': return 10;
    case 'p':  { const l = wrap(doc, clean(tok.v), CW); return l.length * LH + 4; }
    case 'li': { const l = wrap(doc, clean(tok.v), CW - 8); return l.length * BLH + 1; }
    case 'ol': { const l = wrap(doc, clean(tok.v), CW - 10); return l.length * BLH + 1; }
    case 'bq': { const l = wrap(doc, clean(tok.v), CW - 10); return l.length * LH + 8; }
    case 'hr': return 8;
    case 'sp': return 2;
    default:   return 6;
  }
}

// ── Page footer ────────────────────────────────────────────
function footer(doc, pageNum, label) {
  // Light footer — dark text on white
  doc.setFillColor(...C.bgAlt);
  doc.rect(0, PH - FH, PW, FH, 'F');
  doc.setFillColor(...C.divider);
  doc.rect(0, PH - FH, PW, 0.5, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);

  doc.setTextColor(...C.muted);
  doc.text((label || '').slice(0, 45).toUpperCase(), M, PH - 4.5);

  doc.setTextColor(...C.purple);
  doc.setFont('helvetica', 'bold');
  doc.text('BEYOND THE DREAM BOARD\u2122', PW / 2, PH - 4.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.muted);
  doc.text(String(pageNum), PW - M, PH - 4.5, { align: 'right' });
}

// ── Page header (continuation pages) ──────────────────────
function pageHeader(doc, label) {
  doc.setFillColor(...C.bgAlt);
  doc.rect(0, 0, PW, 11, 'F');
  doc.setFillColor(...C.divider);
  doc.rect(0, 11, PW, 0.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.purple);
  doc.text((label || '').toUpperCase().slice(0, 70), M, 7.5);
}

// ── Module section header (replaces blank divider page) ────
function moduleHeader(doc, num, title, subtitle) {
  // Full-width purple band — compact, single page section
  doc.setFillColor(...C.purple);
  doc.rect(0, 0, PW, 28, 'F');
  doc.setFillColor(...C.gold);
  doc.rect(0, 0, PW, 2.5, 'F');

  // Badge
  doc.setFillColor(...C.gold);
  doc.rect(M, 6, 34, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.dark);
  doc.text(`MODULE ${num} OF 10`, M + 2.5, 10.8);

  // Title + subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(title.toUpperCase(), M + 38, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.gold);
  doc.text(subtitle, M + 38, 20);

  // Return starting Y for content below header
  return 34;
}

// ── Render tokens onto pages ───────────────────────────────
// Returns the final page number after rendering
function renderContent(doc, tokens, label, startY, startPage) {
  let y    = startY;
  let page = startPage;

  function needsPage(h) {
    return y + h > PH - FH - 8;
  }

  function newPage() {
    footer(doc, page, label);
    doc.addPage();
    page++;
    // White background explicitly
    doc.setFillColor(...C.bg);
    doc.rect(0, 0, PW, PH, 'F');
    pageHeader(doc, label);
    y = 18;
  }

  function checkRoom(h) {
    if (needsPage(h)) newPage();
  }

  // Try to keep heading + first para/bullet together
  function checkSection(i, h) {
    // Look ahead: if token is a heading, add height of next token too
    const tok = tokens[i];
    if (tok.t === 'h1' || tok.t === 'h2' || tok.t === 'h3') {
      const next = tokens[i + 1];
      const extra = next ? tokenHeight(doc, next) : 0;
      if (needsPage(h + extra + 4)) newPage();
    } else {
      checkRoom(h);
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const h   = tokenHeight(doc, tok);

    switch (tok.t) {

      case 'h1': {
        checkSection(i, h);
        y += 3;
        // Light purple band for H1
        doc.setFillColor(...C.purpleL);
        doc.rect(M - 3, y - 4.5, CW + 6, 11, 'F');
        doc.setFillColor(...C.purple);
        doc.rect(M - 3, y - 4.5, 3, 11, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(...C.purple);
        doc.text(clean(tok.v), M + 2, y + 2.5);
        y += 12;
        break;
      }

      case 'h2': {
        checkSection(i, h);
        y += 4;
        doc.setFillColor(...C.gold);
        doc.rect(M, y - 3, 2.5, 9, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...C.purple);
        doc.text(clean(tok.v), M + 6, y + 2);
        doc.setFillColor(...C.divider);
        doc.rect(M + 6, y + 5.5, CW - 6, 0.4, 'F');
        y += 11;
        break;
      }

      case 'h3': {
        checkSection(i, h);
        y += 3;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...C.teal);
        doc.text(clean(tok.v).toUpperCase(), M, y);
        y += 7;
        break;
      }

      case 'p': {
        const txt = clean(tok.v);
        if (!txt) break;
        const lines = wrap(doc, txt, CW);
        // Orphan prevention: if only 1 line would be left on page, go to next now
        const totalH = lines.length * LH + 3;
        if (needsPage(totalH) && lines.length > 1) {
          // Check if at least 2 lines fit
          const linesOnPage = Math.floor((PH - FH - 8 - y) / LH);
          if (linesOnPage < 2) newPage();
          else checkRoom(totalH);
        } else {
          checkRoom(totalH);
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...C.text);
        // Render line by line to handle page breaks mid-paragraph
        for (const line of lines) {
          if (needsPage(LH)) newPage();
          doc.text(line, M, y);
          y += LH;
        }
        y += 3;
        break;
      }

      case 'li': {
        const txt = clean(tok.v);
        if (!txt) break;
        const lines = wrap(doc, txt, CW - 8);
        checkRoom(lines.length * BLH + 1);
        // Gold square bullet
        doc.setFillColor(...C.gold);
        doc.rect(M + 1, y - 1.8, 2, 2, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...C.text);
        for (let li = 0; li < lines.length; li++) {
          if (li > 0 && needsPage(BLH)) newPage();
          doc.text(lines[li], M + 6, y);
          y += BLH;
        }
        y += 1;
        break;
      }

      case 'ol': {
        const txt = clean(tok.v);
        if (!txt) break;
        const lines = wrap(doc, txt, CW - 10);
        checkRoom(lines.length * BLH + 1);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...C.purple);
        doc.text(`${tok.n}.`, M, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.text);
        for (let li = 0; li < lines.length; li++) {
          if (li > 0 && needsPage(BLH)) newPage();
          doc.text(lines[li], M + 8, y);
          y += BLH;
        }
        y += 1;
        break;
      }

      case 'bq': {
        const txt = clean(tok.v);
        if (!txt) break;
        const lines = wrap(doc, txt, CW - 10);
        const bh = lines.length * LH + 8;
        checkRoom(bh);
        y += 2;
        doc.setFillColor(...C.goldL);
        doc.rect(M, y - 3, CW, lines.length * LH + 6, 'F');
        doc.setFillColor(...C.gold);
        doc.rect(M, y - 3, 2.5, lines.length * LH + 6, 'F');
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(...C.text);
        doc.text(lines, M + 6, y);
        y += lines.length * LH + 6;
        break;
      }

      case 'hr': {
        checkRoom(8);
        y += 3;
        doc.setFillColor(...C.divider);
        doc.rect(M, y, CW, 0.5, 'F');
        y += 5;
        break;
      }

      case 'sp': {
        y += 2;
        break;
      }
    }
  }

  footer(doc, page, label);
  return page;
}

// ============================================================
// SINGLE MODULE PDF
// ============================================================
export function downloadModulePDF(moduleTitle, moduleSubtitle, moduleNum, outputText, brandName = '') {
  const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // White background
  doc.setFillColor(...C.bg);
  doc.rect(0, 0, PW, PH, 'F');

  // Cover — purple top band
  doc.setFillColor(...C.purple);
  doc.rect(0, 0, PW, 60, 'F');
  doc.setFillColor(...C.gold);
  doc.rect(0, 0, PW, 2.5, 'F');

  doc.setFillColor(...C.gold);
  doc.rect(M, 12, 34, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.dark);
  doc.text(`MODULE ${moduleNum} OF 10`, M + 2.5, 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  const titleLines = wrap(doc, moduleTitle.toUpperCase(), CW);
  doc.text(titleLines, M, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...C.gold);
  doc.text(moduleSubtitle, M, 38 + titleLines.length * 9 + 4);

  // White content area below
  doc.setFillColor(...C.bg);
  doc.rect(0, 60, PW, PH - 80, 'F');

  if (brandName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.sub);
    doc.text(brandName, M, 74);
  }

  // Footer on cover
  doc.setFillColor(...C.bgAlt);
  doc.rect(0, PH - FH, PW, FH, 'F');
  doc.setFillColor(...C.divider);
  doc.rect(0, PH - FH, PW, 0.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.purple);
  doc.text('BEYOND THE DREAM BOARD\u2122', PW / 2, PH - 4.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.muted);
  doc.text(`Generated ${date}`, PW - M, PH - 4.5, { align: 'right' });

  // Content pages
  doc.addPage();
  doc.setFillColor(...C.bg);
  doc.rect(0, 0, PW, PH, 'F');
  pageHeader(doc, `Module ${moduleNum}: ${moduleTitle}`);
  renderContent(doc, tokenize(outputText), `Module ${moduleNum}: ${moduleTitle}`, 18, 2);

  const slug    = moduleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const brand   = brandName ? `-${brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  savePDF(doc, `vios-module-${String(moduleNum).padStart(2,'0')}-${slug}${brand}.pdf`);
}

// ============================================================
// FULL PLAYBOOK PDF
// ============================================================
export function downloadPlaybookPDF(state, executiveSummary = '') {
  const doc   = new jsPDF({ unit: 'mm', format: 'a4' });
  const ctx   = state.businessContext || {};
  const brand = ctx.brandName || '';
  const date  = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  let   page  = 1;

  function whitePage() {
    doc.setFillColor(...C.bg);
    doc.rect(0, 0, PW, PH, 'F');
  }

  // ── PAGE 1: Cover ──────────────────────────────────────────
  whitePage();

  // Top purple band
  doc.setFillColor(...C.purple);
  doc.rect(0, 0, PW, 72, 'F');
  doc.setFillColor(...C.gold);
  doc.rect(0, 0, PW, 2.5, 'F');

  // Badge
  doc.setFillColor(...C.gold);
  doc.rect(M, 12, 74, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.dark);
  doc.text('VISIBILITY INFRASTRUCTURE OS', M + 3, 17.8);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('YOUR VISIBILITY', M, 38);
  doc.setTextColor(...C.gold);
  doc.text('INFRASTRUCTURE', M, 50);
  doc.setTextColor(255, 255, 255);
  doc.text('OS PLAYBOOK', M, 62);

  // White content area
  let y = 86;

  if (brand) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...C.purple);
    doc.text(brand, M, y);
    y += 8;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.sub);
  doc.text('Complete Strategy Document', M, y);
  y += 6;
  doc.setFillColor(...C.divider);
  doc.rect(M, y, CW, 0.5, 'F');
  y += 10;

  // What's inside — dark text on white
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.purple);
  doc.text("WHAT'S INSIDE", M, y);
  y += 8;

  const contents = [
    'Executive Summary — ICP, pain point, USP and positioning statement',
    'Module 1: Business Context — Strategic foundation and market analysis',
    'Module 2: Audience Psychology — Buyer psychology and messaging intelligence',
    'Module 3: Authority Positioning — Differentiation and credibility system',
    'Module 4: Competitor White Space — Content gap and opportunity analysis',
    'Module 5: Content Pillars — Conversion-oriented content themes',
    'Module 6: Platform Strategy — LinkedIn and Substack engine',
    'Module 7: 30-Day Content Plan — Strategic visibility calendar',
    'Module 8: Post Generator — Scroll-stopping content creation',
    'Module 9: Monetization Strategy — Audience conversion roadmap',
    'Module 10: Revenue Acceleration — 30-day income milestone plan',
  ];

  contents.forEach(item => {
    doc.setFillColor(...C.gold);
    doc.rect(M + 1, y - 1.8, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.text);
    const lines = wrap(doc, item, CW - 8);
    doc.text(lines[0], M + 6, y);
    y += 6.5;
  });

  // Cover footer
  doc.setFillColor(...C.bgAlt);
  doc.rect(0, PH - FH, PW, FH, 'F');
  doc.setFillColor(...C.divider);
  doc.rect(0, PH - FH, PW, 0.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.purple);
  doc.text('BEYOND THE DREAM BOARD\u2122', PW / 2, PH - 4.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.muted);
  doc.text(`Generated ${date}`, PW - M, PH - 4.5, { align: 'right' });
  doc.text("Women's words will change the world.", M, PH - 4.5);

  // ── PAGE 2: Executive Summary ───────────────────────────────
  doc.addPage();
  page++;
  whitePage();
  pageHeader(doc, 'Executive Summary');

  // Section header band
  doc.setFillColor(...C.purple);
  doc.rect(0, 12, PW, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('EXECUTIVE SUMMARY', M, 25);

  y = 38;

  if (executiveSummary) {
    const lines = wrap(doc, executiveSummary, CW);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...C.text);
    doc.text(lines, M, y);
    y += lines.length * 5.5 + 10;
  }

  // At a glance
  doc.setFillColor(...C.gold);
  doc.rect(M, y - 2, 2.5, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.purple);
  doc.text('AT A GLANCE', M + 6, y + 3);
  doc.setFillColor(...C.divider);
  doc.rect(M + 6, y + 7, CW - 6, 0.4, 'F');
  y += 14;

  const fields = [
    ['Ideal Customer Profile', ctx.targetAudience],
    ['Core Audience Pain',     ctx.audienceProblem],
    ['Primary Offer',          ctx.primaryOffer],
    ['Unique Mechanism',       ctx.uniqueMechanism],
    ['Revenue Goal',           ctx.revenueGoal],
    ['Platforms',              ctx.platforms],
    ['Brand Voice',            ctx.brandVoice],
  ];

  let rowAlt = false;
  fields.forEach(([label, value]) => {
    if (!value) return;
    const vlines = wrap(doc, value, CW - 50);
    const rowH   = Math.max(9, vlines.length * LH + 5);
    if (rowAlt) { doc.setFillColor(...C.bgAlt); } else { doc.setFillColor(...C.bg); }
    doc.rect(M - 3, y - 3, CW + 6, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.purple);
    doc.text(label, M, y + 1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.text);
    doc.text(vlines, M + 50, y + 1);
    doc.setFillColor(...C.divider);
    doc.rect(M - 3, y - 3 + rowH, CW + 6, 0.3, 'F');
    y += rowH + 1;
    rowAlt = !rowAlt;
  });

  footer(doc, page, 'Executive Summary');

  // ── MODULE SECTIONS ─────────────────────────────────────────
  const modules = [
    { number: 1,  id: 'business-context',     title: 'Business Context',     subtitle: 'Strategic Brand and Market Analysis' },
    { number: 2,  id: 'audience-psychology',  title: 'Audience Psychology',   subtitle: 'Messaging Intelligence' },
    { number: 3,  id: 'authority-positioning',title: 'Authority Positioning', subtitle: 'Differentiation System' },
    { number: 4,  id: 'competitor-whitespace',title: 'Competitor White Space',subtitle: 'Content Gap Analysis' },
    { number: 5,  id: 'content-pillars',      title: 'Content Pillars',       subtitle: 'Conversion-Oriented Strategy' },
    { number: 6,  id: 'platform-strategy',    title: 'Platform Strategy',     subtitle: 'LinkedIn and Substack Engine' },
    { number: 7,  id: 'content-plan',         title: '30-Day Content Plan',   subtitle: 'Strategic Visibility Calendar' },
    { number: 8,  id: 'post-generator',       title: 'Post Generator',        subtitle: 'Scroll-Stopping Content' },
    { number: 9,  id: 'monetization-strategy',title: 'Monetization Strategy', subtitle: 'Audience Conversion System' },
    { number: 10, id: 'revenue-acceleration', title: 'Revenue Acceleration',  subtitle: 'Monetization Clarity Engine' },
  ];

  for (const mod of modules) {
    const output = state.moduleData?.[mod.id]?.editedOutput
                || state.moduleData?.[mod.id]?.output || '';
    if (!output) continue;

    // New page with module header band — no blank divider page
    doc.addPage();
    page++;
    whitePage();

    const contentStartY = moduleHeader(doc, mod.number, mod.title, mod.subtitle);
    const label = `Module ${mod.number}: ${mod.title}`;

    page = renderContent(doc, tokenize(output), label, contentStartY, page);
  }

  // ── FINAL PAGE: Next Steps ──────────────────────────────────
  doc.addPage();
  page++;
  whitePage();

  // Top purple band
  doc.setFillColor(...C.purple);
  doc.rect(0, 0, PW, 46, 'F');
  doc.setFillColor(...C.gold);
  doc.rect(0, 0, PW, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('YOUR STRATEGY IS READY.', M, 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...C.gold);
  doc.text("Now it's time to act on it.", M, 35);

  y = 60;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.purple);
  doc.text('NEXT STEPS WITH VIVEKA', M, y);
  doc.setFillColor(...C.divider);
  doc.rect(M, y + 4, CW, 0.5, 'F');
  y += 12;

  const links = [
    ['📅  Book a Discovery Call',  'calendly.com/vivekacoach/discovery-call', 'Ready to turn your strategy into real traction?'],
    ['💼  Connect on LinkedIn',    'LinkedIn.com/in/VivekavonRosen', 'LinkedIn authority strategy for accomplished women.'],
    ['📬  Subscribe on Substack',  'vivekavonrosen.substack.com', 'Visibility advice and visibility infrastructure in your inbox.'],
    ['✉️  Email Viveka directly',   'Viveka@beyondthedreamboard.com', 'Questions? Ideas? Just want to say hello?'],
  ];

  links.forEach(([label, url, desc]) => {
    doc.setFillColor(...C.bgAlt);
    doc.rect(M - 3, y - 4, CW + 6, 19, 'F');
    doc.setFillColor(...C.purple);
    doc.rect(M - 3, y - 4, 2.5, 19, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...C.text);
    doc.text(label, M + 3, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.purple);
    doc.text(url, M + 3, y + 8.5);
    doc.setTextColor(...C.sub);
    doc.text(desc, M + 3, y + 14);
    y += 24;
  });

  // Final branding
  doc.setFillColor(...C.bgAlt);
  doc.rect(0, PH - 22, PW, 22, 'F');
  doc.setFillColor(...C.divider);
  doc.rect(0, PH - 22, PW, 0.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.purple);
  doc.text('BEYOND THE DREAM BOARD\u2122', PW / 2, PH - 13, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.sub);
  doc.text("Women's words will change the world.", PW / 2, PH - 7, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.muted);
  doc.text(`Generated ${date}  ·  Visibility Infrastructure OS`, PW / 2, PH - 2.5, { align: 'center' });

  // Save
  const brandSlug = brand ? `-${brand.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
  const dateStr   = new Date().toISOString().slice(0, 10);
  savePDF(doc, `vios-playbook${brandSlug}-${dateStr}.pdf`);
}
