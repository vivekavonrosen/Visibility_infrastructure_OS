// Vercel serverless function — /api/generate
// Your Anthropic API key lives here as an environment variable.
// Users never see it. It never touches the browser.

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Your key comes from Vercel environment variables — never from the client
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key not configured on server. Add ANTHROPIC_API_KEY to your Vercel environment variables.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { prompt } = body;

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'No prompt provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Forward to Anthropic — streaming response passes straight through to client
  const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      stream: true,
      system: `You are a senior business strategist specializing in helping accomplished professional women 50+ build visible authority businesses from their expertise. You give specific, grounded, commercially sharp advice. You avoid generic motivation, buzzwords, and vague inspiration. Every output is structured, actionable, and respects the intelligence of the reader. Use clear headers, short paragraphs, and concrete examples. Format your response in clean Markdown.`,
      messages: [
        { role: 'user', content: prompt }
      ],
    }),
  });

  if (!anthropicResponse.ok) {
    const error = await anthropicResponse.json().catch(() => ({}));
    return new Response(
      JSON.stringify({ error: error?.error?.message || `Anthropic API error: ${anthropicResponse.status}` }),
      { status: anthropicResponse.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Stream the response directly back to the client
  return new Response(anthropicResponse.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
