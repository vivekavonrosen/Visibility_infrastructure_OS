// ============================================================
// API Client — calls your Vercel serverless function
// Your Anthropic key lives in Vercel env vars, not here.
// Users never see or need an API key.
// ============================================================

/**
 * Stream a completion via your /api/generate serverless function.
 * @param {string} prompt
 * @param {function} onChunk - called with (chunk, fullTextSoFar)
 * @param {function} onDone - called with final full text
 * @param {function} onError - called with error message string
 * @returns {AbortController}
 */
export function streamCompletion(prompt, onChunk, onDone, onError) {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        onError(errorData?.error || `Server error: ${response.status}`);
        return;
      }

      const reader = response.body.getReader();
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
              const chunk = parsed.delta.text;
              fullText += chunk;
              onChunk(chunk, fullText);
            }
          } catch {
            // Skip malformed SSE chunks
          }
        }
      }

      onDone(fullText);
    } catch (err) {
      if (err.name === 'AbortError') return;
      onError(err.message || 'An unexpected error occurred.');
    }
  })();

  return controller;
}
