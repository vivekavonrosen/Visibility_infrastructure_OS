// api/scrape.js
// Fetches a website URL server-side (avoids CORS),
// extracts clean text, then uses Claude to populate the intake form fields.

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

  // ── Step 1: Fetch the website ──
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
      return new Response(JSON.stringify({ error: `Could not fetch that URL (${siteRes.status}). Check the address and try again.` }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    rawHtml = await siteRes.text();
  } catch (e) {
    return new Response(JSON.stringify({ error: `Could not reach that website. Make sure the URL is correct and includes https://.` }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // ── Step 2: Strip HTML to readable text ──
  const cleanText = rawHtml
    // Remove scripts, styles, nav, footer boilerplate
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    // Remove all remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Limit to ~6000 chars — enough context, not too long for the prompt
    .slice(0, 6000);

  if (cleanText.length < 100) {
    return new Response(JSON.stringify({ error: 'The page didn\'t return enough readable content. Try your About page or Home page directly.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // ── Step 3: Ask Claude to extract structured intake data ──
  const extractionPrompt = `You are analyzing a professional woman's business website to extract information for a business strategy intake form.

Read the website content below and extract as much relevant information as you can for each field. If you cannot confidently determine a field from the content, return an empty string for it — do not guess or fabricate.

Website content:
---
${cleanText}
---

Return ONLY a valid JSON object with these exact keys. No explanation, no markdown, no code blocks — just the raw JSON:

{
  "brandName": "The business or personal brand name",
  "businessDesc": "What the business does and how it creates value — 2-3 sentences",
  "niche": "The specific niche or market category",
  "primaryOffer": "The main product, program, service, or offer",
  "secondaryOffers": "Any other offers mentioned — courses, speaking, workshops, books, memberships",
  "targetAudience": "Who the business serves — be specific about role, age, stage, context",
  "audienceProblem": "The main problem or frustration the audience faces",
  "audienceDesire": "What the audience wants — the outcome or transformation promised",
  "brandStrengths": "What makes this brand credible — results, credentials, methodology",
  "founderBg": "The founder's professional background, credentials, career history",
  "uniqueMechanism": "Any proprietary framework, system, method, or process mentioned",
  "platforms": "Any platforms mentioned — LinkedIn, podcast, newsletter, Substack, speaking",
  "brandVoice": "How the brand sounds — tone, style, personality from the writing",
  "geography": "Geographic market if mentioned — e.g. US, global, English-speaking",
  "pricePoint": "Any pricing mentioned",
  "callToAction": "The primary call to action on the site"
}`;

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: extractionPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to analyze website content.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData.content?.[0]?.text || '';

    // Parse the JSON — strip any accidental markdown fences
    const jsonText = rawText.replace(/```json|```/g, '').trim();
    let extracted;
    try {
      extracted = JSON.parse(jsonText);
    } catch {
      return new Response(JSON.stringify({ error: 'Could not parse the extracted data. Try again.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data: extracted }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: 'Something went wrong analyzing the site.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
