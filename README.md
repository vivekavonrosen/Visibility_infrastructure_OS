# Visibility Infrastructure OS

**Turn your wisdom into traction.**  
A guided AI strategy system for accomplished women 50+ building next-chapter businesses.

---

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173
```

Requires Node.js 18+ and an Anthropic API key (console.anthropic.com).

## Production Build

```bash
npm run build   # output in /dist
```

Deploy to Vercel with `vercel --prod` or drag /dist to Netlify.

---

## Architecture

```
src/
├── context/AppContext.jsx     # Global state (useReducer + localStorage)
├── data/modules.js            # All 10 module definitions + full AI prompts
├── utils/
│   ├── api.js                 # Anthropic streaming client
│   ├── storage.js             # localStorage helpers (swap for DB in v2)
│   └── export.js              # Markdown document generator
├── components/
│   ├── Sidebar.jsx            # Nav + progress tracker
│   ├── ModuleShell.jsx        # Inputs + generate + streaming output
│   ├── OutputBlock.jsx        # Markdown render + inline edit
│   ├── ExportBar.jsx          # Top bar with export action
│   └── ApiKeyModal.jsx        # API key entry
├── pages/
│   ├── Landing.jsx            # Marketing landing page
│   └── Workspace.jsx          # Main 10-module workspace
└── globals.css                # All styles + brand tokens
```

**Brand tokens** (all in globals.css):
- `--purple: #571F81` · `--gold: #DFB24A` · `--teal: #2C97AF`
- Heading font: Bebas Neue · Body font: Lato

---

## The 10 Modules

1. Business Context — Strategic foundation and market analysis
2. Audience Psychology — Buyer psychology and messaging intelligence  
3. Authority Positioning — Differentiation and credibility system
4. Competitor White Space — Content gap and opportunity analysis
5. Content Pillars — Conversion-oriented content themes
6. Platform Strategy — LinkedIn and Substack engine
7. 30-Day Content Plan — Strategic visibility calendar
8. Post Generator — Scroll-stopping content creation
9. Monetization Strategy — Audience conversion roadmap
10. Revenue Acceleration — 30-day income milestone plan

---

## What to Build Next

**Priority 1 — Auth + Cloud Storage**
Add Supabase auth + replace localStorage in `utils/storage.js` with Supabase RLS tables. ~6 hrs.

**Priority 2 — Payments**
Stripe checkout gates the workspace route. Add subscription check middleware. ~6 hrs.

**Priority 3 — PDF Export**
Styled branded PDF using jsPDF or server-side Puppeteer. ~4 hrs.

**Priority 4 — Multiple Projects**
Let users save multiple strategy sessions. ~4 hrs.

**Priority 5 — Workshop/Group Mode**
Full-screen facilitated mode for live retreats and cohorts.

---

## Notes

- API key stored in browser localStorage only — never sent anywhere except api.anthropic.com
- All outputs auto-save after generation. Safe to refresh.
- Every output is editable inline before export
- Export generates a single .md file with all completed modules

*Built on the Voice to Visibility Legacy System — Beyond the Dream Board™*
