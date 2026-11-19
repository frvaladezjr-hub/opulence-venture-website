/**
 * POST /api/fna-activity — Financial Needs Analysis activity alerts
 *
 * Sends a short heads-up email (no financial details) when someone:
 *   type "started"  — enters their first and last name on the form
 *   type "progress" — steps away from the form without submitting
 *
 * Uses the same environment variables as /api/fna:
 *   RESEND_API_KEY   (required)
 *   MAIL_FROM        (optional)
 *   NOTIFY_TO        (optional) defaults to info@opulenceinvestments.net
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const NAVY = '#00446a';
const BLUE = '#0084d3';
const BORDER = '#c9d6e2';
const MUTED = '#4b5d6f';
const TZ = 'America/Los_Angeles';

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function clean(value, max = 200) {
  return String(value == null ? '' : value).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}

function row(label, value) {
  return `<tr>
    <td style="padding:8px 14px;border-bottom:1px solid ${BORDER};font:600 12px/1.5 Arial,sans-serif;color:${NAVY};width:38%;vertical-align:top;">${esc(label)}</td>
    <td style="padding:8px 14px;border-bottom:1px solid ${BORDER};font:400 13px/1.6 Arial,sans-serif;color:${MUTED};">${esc(value || '—')}</td>
  </tr>`;
}

export function buildAlert(d, now = new Date()) {
  const when = now.toLocaleString('en-US', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  const started = d.type === 'started';
  const heading = started ? 'Financial Needs Analysis started' : 'Financial Needs Analysis still in progress';
  const lead = started
    ? `<strong style="color:${NAVY};">${esc(d.clientName)}</strong> has started filling out the Financial Needs Analysis.`
    : `<strong style="color:${NAVY};">${esc(d.clientName)}</strong> stepped away from the Financial Needs Analysis without submitting it. Their answers are saved in their browser, so they can pick up where they left off.`;
  const rows = [
    row('Client', d.clientName),
    d.email ? row('Email', d.email) : '',
    d.cell ? row('Cell', d.cell) : '',
    d.agentName ? row('Agent', d.agentName) : '',
    started ? '' : row('Sections with answers', d.sections.length ? `${d.sections.join(', ')} (${d.sections.length} of 7)` : 'Only the name so far'),
    started || !d.lastSection ? '' : row('Last viewed section', d.lastSection),
    row(started ? 'Started' : 'Left the form', when),
  ].join('');
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f5f8fb;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid ${BORDER};border-radius:4px;">
    <tr><td style="padding:20px 24px;background:${NAVY};">
      <div style="font:600 10px/1.4 Arial,sans-serif;letter-spacing:.17em;text-transform:uppercase;color:#a9bdd6;">Opulence Venture Group</div>
      <div style="font:400 19px/1.3 Georgia,serif;color:#ffffff;padding-top:6px;">${heading}</div>
    </td></tr>
    <tr><td style="padding:18px 24px 10px;font:400 13px/1.6 Arial,sans-serif;color:${MUTED};">${lead}</td></tr>
    <tr><td style="padding:0 10px 18px;"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${rows}</table></td></tr>
    <tr><td style="padding:12px 24px;background:#eef3f8;font:400 11px/1.6 Arial,sans-serif;color:#7c8fa0;">
      Activity alert only — no financial answers are included. ${started ? 'You will get the full analysis by email when it is submitted.' : `<span style="color:${BLUE};">A good moment for a friendly follow-up.</span>`}
    </td></tr>
  </table></body></html>`;
  const subject = `${started ? 'FNA started' : 'FNA in progress'} — ${d.clientName}${d.agentName ? ` (Agent: ${d.agentName})` : ''}`;
  return { subject, html };
}

export function parseActivity(body) {
  if (!body || typeof body !== 'object') return { error: 'Missing data.' };
  const type = body.type === 'started' || body.type === 'progress' ? body.type : '';
  if (!type) return { error: 'Unknown alert type.' };
  const client = body.client || {};
  const d = {
    type,
    firstName: clean(client.firstName, 80),
    lastName: clean(client.lastName, 80),
    email: clean(client.email, 160),
    cell: clean(client.cell, 40),
    agentName: clean(body.agent && body.agent.name, 120),
    lastSection: clean(body.lastSection, 80),
    sections: (Array.isArray(body.sections) ? body.sections : []).slice(0, 7).map((s) => clean(s, 60)).filter(Boolean),
  };
  if (!d.firstName || !d.lastName) return { error: 'Client name is required.' };
  d.clientName = `${d.firstName} ${d.lastName}`;
  return { d };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Only accept alerts sent from this website.
  const origin = req.headers.origin || '';
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  if (origin && host && origin.replace(/^https?:\/\//, '') !== host) return res.status(403).json({ error: 'Forbidden' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Email delivery is not configured yet.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON body.' }); } }
  if (body && clean(body.company)) return res.status(200).json({ ok: true }); // honeypot
  const { d, error } = parseActivity(body);
  if (error) return res.status(400).json({ error });

  const { subject, html } = buildAlert(d);
  try {
    const r = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || 'Opulence Venture Group <onboarding@resend.dev>',
        to: [process.env.NOTIFY_TO || 'info@opulenceinvestments.net'],
        subject, html,
      }),
    });
    if (!r.ok) throw new Error(`Resend responded ${r.status}: ${await r.text()}`);
  } catch (err) {
    console.error('FNA activity alert failed:', err.message);
    return res.status(502).json({ error: 'Alert could not be delivered.' });
  }
  return res.status(200).json({ ok: true });
}
