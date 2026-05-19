// Vercel serverless function — /api/notify-signup
// Called by a Supabase Database Webhook on auth.users INSERT.
// Sends Viveka an email via Resend whenever someone signs up.

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Verify the request really came from our Supabase webhook
  const expectedSecret = process.env.NOTIFY_WEBHOOK_SECRET;
  const providedSecret = req.headers.get('x-webhook-secret');
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const adminTo   = process.env.ADMIN_EMAIL;
  const fromAddr  = process.env.NOTIFY_FROM || 'VIOS <notifications@beyondthedreamboard.com>';
  if (!resendKey || !adminTo) {
    return new Response('Missing RESEND_API_KEY or ADMIN_EMAIL env var', { status: 500 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Supabase Database Webhook payload shape:
  // { type: 'INSERT', table: 'users', schema: 'auth', record: { id, email, created_at, ... }, old_record: null }
  const record = payload?.record;
  if (!record?.email) {
    return new Response('No email in payload', { status: 400 });
  }

  const email     = record.email;
  const signedUp  = record.created_at || new Date().toISOString();
  const userId    = record.id;
  const adminUrl  = 'https://visibilityos.tech/?admin=1';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1a1025;">
      <h2 style="font-family: 'Bebas Neue', sans-serif; color: #571F81; letter-spacing: 0.05em; margin: 0 0 8px;">NEW VIOS SIGNUP</h2>
      <p style="color: #4a3f5c; margin: 0 0 20px;">Someone just created an account at visibilityos.tech.</p>
      <table style="width: 100%; border-collapse: collapse; background: #faf9fd; border-radius: 8px; padding: 16px;">
        <tr><td style="padding: 8px 12px; color: #8a7fa0; font-size: 13px;">Email</td><td style="padding: 8px 12px; font-weight: 700;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding: 8px 12px; color: #8a7fa0; font-size: 13px;">Signed up</td><td style="padding: 8px 12px;">${escapeHtml(signedUp)}</td></tr>
        <tr><td style="padding: 8px 12px; color: #8a7fa0; font-size: 13px;">User ID</td><td style="padding: 8px 12px; font-family: monospace; font-size: 12px;">${escapeHtml(userId || '—')}</td></tr>
      </table>
      <p style="margin: 24px 0 8px; color: #4a3f5c;">They're on the paywall page right now. Decide whether to grant access:</p>
      <a href="${adminUrl}" style="display: inline-block; padding: 12px 20px; background: #571F81; color: white; text-decoration: none; border-radius: 8px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; font-size: 13px;">Open Admin Panel →</a>
      <p style="margin: 32px 0 0; color: #8a7fa0; font-size: 12px; line-height: 1.5;">
        Sent automatically by VisibilityOS. You're receiving this because you're the admin contact.
      </p>
    </div>
  `;

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from:    fromAddr,
      to:      adminTo,
      subject: `New VIOS signup: ${email}`,
      html,
    }),
  });

  if (!resendRes.ok) {
    const errText = await resendRes.text().catch(() => '');
    return new Response(JSON.stringify({ error: 'Resend send failed', detail: errText }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
