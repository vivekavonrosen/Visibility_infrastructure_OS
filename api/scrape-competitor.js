// api/scrape-competitor.js
// Fetches a competitor's website server-side (avoids CORS), strips it to
// readable text, then uses Claude to summarize their positioning, offers,
// content themes, and messaging. Used by Module 4 (Competitor White Space)
// so the analysis is grounded in the competitor's actual site, not guesses.

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured on server.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { url } = body;
  if (!url) {
    return new Response(JSON.stringify({ error: 'No URL provided' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // ── Step 1: Fetch the competitor site ──
  let rawHtml;
  try {
    const siteRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VisibilityOS/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!siteRes.ok) {
      return new Response(JSON.stringify({ error: `Could not fetch (${siteRes.status})` }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    rawHtml = await siteRes.text();
  } catch {
    return new Response(JSON.stringify({ error: 'Could not reach that website.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // ── Step 2: Strip HTML to readable text ──
  const cleanText = rawHtml
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 6000);

  if (cleanText.length < 100) {
    return new Response(JSON.stringify({ error: 'Not enough readable content on that page.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // ── Step 3: Summarize the competitor ──
  const summaryPrompt = `You are a competitive analyst reviewing a competitor's website for a strategy report. Read the site content below and write a tight, factual summary of THIS competitor — based only on what the content actually shows. Do not invent details.

Website content:
---
${cleanText}
---

Write a concise summary (150–220 words) covering, as far as the content reveals:
- Positioning & primary claim (how they present themselves; who they say they're for)
- Main offers / programs / products and any pricing signals
- Recurring content themes and topics they emphasize
- Messaging patterns, hooks, and language they lean on
- Tone and credibility signals (proof, results, credentials)
Return plain prose only — no headings, no preamble, no markdown.`;

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 700,
        messages: [{ role: 'user', content: summaryPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      const errData = await claudeRes.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: errData?.error?.message || `Anthropic API error ${claudeRes.status}` }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const claudeData = await claudeRes.json();
    const summary = (claudeData.content?.[0]?.text || '').trim();

    return new Response(JSON.stringify({ success: true, summary }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Something went wrong analyzing the site.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
