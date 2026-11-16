/**
 * POST /api/fna — Financial Needs Analysis handler
 *
 * Emails the completed Financial Needs Analysis to the Opulence inbox with the
 * PDF summary and the editable data file attached.
 *
 * Uses the same environment variables as /api/discovery:
 *   RESEND_API_KEY   (required) API key from resend.com
 *   MAIL_FROM        (optional) sender; defaults to Resend's shared sender
 *   NOTIFY_TO        (optional) inbox; defaults to info@opulenceinvestments.net
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const NAVY = '#00446a';
const BLUE = '#0084d3';
const BORDER = '#c9d6e2';
const MUTED = '#4b5d6f';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_PDF_B64 = 3_000_000;

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clean(value, max = 4000) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function cell(value) {
  return esc(clean(value) || '—').replace(/\n/g, '<br />');
}

function sectionHtml(section) {
  const title = clean(section && section.title, 200);
  const groups = Array.isArray(section && section.groups) ? section.groups.slice(0, 40) : [];
  let inner = '';
  for (const g of groups) {
    if (g && g.table && Array.isArray(g.table.body)) {
      const head = (Array.isArray(g.table.head) ? g.table.head : []).slice(0, 12);
      const body = g.table.body.slice(0, 100);
      inner += `<tr><td colspan="2" style="padding:10px 14px 4px;font:600 12px/1.4 Arial,sans-serif;color:${NAVY};">${esc(clean(g.table.title, 200))}</td></tr>
      <tr><td colspan="2" style="padding:0 14px 8px;"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font:400 12px/1.5 Arial,sans-serif;color:${MUTED};">
        <tr>${head.map((h) => `<th align="left" style="padding:6px 8px;background:${NAVY};color:#fff;font-weight:600;">${esc(clean(h, 80))}</th>`).join('')}</tr>
        ${body.map((r) => `<tr>${(Array.isArray(r) ? r.slice(0, 12) : []).map((c) => `<td style="padding:6px 8px;border-bottom:1px solid ${BORDER};">${cell(c)}</td>`).join('')}</tr>`).join('')}
      </table></td></tr>`;
    } else if (g && Array.isArray(g.kv) && g.kv.length) {
      if (g.sub) inner += `<tr><td colspan="2" style="padding:10px 14px 4px;font:600 12px/1.4 Arial,sans-serif;color:${NAVY};">${esc(clean(g.sub, 200))}</td></tr>`;
      for (const pair of g.kv.slice(0, 80)) {
        if (!Array.isArray(pair)) continue;
        inner += `<tr>
          <td style="padding:7px 14px;border-bottom:1px solid ${BORDER};font:600 12px/1.5 Arial,sans-serif;color:${NAVY};vertical-align:top;width:40%;">${esc(clean(pair[0], 200))}</td>
          <td style="padding:7px 14px;border-bottom:1px solid ${BORDER};font:400 13px/1.6 Arial,sans-serif;color:${MUTED};">${cell(pair[1])}</td>
        </tr>`;
      }
    }
  }
  if (!inner) inner = `<tr><td colspan="2" style="padding:6px 14px;font:400 12px/1.5 Arial,sans-serif;color:#7c8fa0;">Nothing entered.</td></tr>`;
  return `<tr><td colspan="2" style="padding:18px 14px 6px;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.11em;text-transform:uppercase;color:${BLUE};">${esc(title)}</td></tr>${inner}`;
}

function emailHtml(d, sections) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f5f8fb;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:680px;margin:0 auto;background:#ffffff;border:1px solid ${BORDER};border-radius:4px;">
    <tr><td style="padding:22px 24px;background:${NAVY};">
      <div style="font:600 10px/1.4 Arial,sans-serif;letter-spacing:.17em;text-transform:uppercase;color:#a9bdd6;">Opulence Venture Group</div>
      <div style="font:400 20px/1.3 Georgia,serif;color:#ffffff;padding-top:6px;">New Financial Needs Analysis</div>
    </td></tr>
    <tr><td style="padding:18px 24px 6px;font:400 13px/1.6 Arial,sans-serif;color:${MUTED};">
      <strong style="color:${NAVY};">${esc(d.clientName)}</strong>${d.spouse ? ` &amp; ${esc(d.spouse)}` : ''}
      &middot; ${esc(d.email)} &middot; ${esc(d.cell)}${d.agentName ? ` &middot; Agent: ${esc(d.agentName)}` : ''}
      <br />The PDF summary and the editable data file are attached.
    </td></tr>
    <tr><td style="padding:0 10px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        ${sections.map(sectionHtml).join('')}
      </table>
    </td></tr>
    <tr><td style="padding:14px 24px;background:#eef3f8;font:400 11px/1.6 Arial,sans-serif;color:#7c8fa0;">
      Submitted from the Financial Needs Analysis on opulenceventuregroup.com.${d.agentEmail ? ' Reply to this message to reach the agent.' : ''}
    </td></tr>
  </table>
</body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Email delivery is not configured yet.' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON body.' }); }
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Missing submission data.' });
  if (clean(body.company)) return res.status(200).json({ ok: true }); // honeypot

  const client = body.client || {};
  const agent = body.agent || {};
  const d = {
    firstName: clean(client.firstName, 80),
    lastName: clean(client.lastName, 80),
    email: clean(client.email, 160),
    cell: clean(client.cell, 40),
    spouse: clean(body.spouse, 160),
    agentName: clean(agent.name, 120),
    agentEmail: clean(agent.email, 160),
  };
  d.clientName = `${d.firstName} ${d.lastName}`.trim();

  const missing = ['firstName', 'lastName', 'email', 'cell'].filter((k) => !d[k]);
  if (missing.length) return res.status(400).json({ error: 'Some required answers are missing.', missing });
  if (!EMAIL_RE.test(d.email)) return res.status(400).json({ error: 'Please provide a valid client email address.' });

  const sections = Array.isArray(body.sections) ? body.sections.slice(0, 12) : [];
  const fileBase = clean(body.fileBase, 120).replace(/[^A-Za-z0-9-]/g, '') || 'Opulence-FNA';
  const attachments = [];
  const pdf = typeof body.pdf === 'string' ? body.pdf.replace(/\s/g, '') : '';
  if (pdf && pdf.length <= MAX_PDF_B64 && /^[A-Za-z0-9+/=]+$/.test(pdf)) {
    attachments.push({ filename: `${fileBase}.pdf`, content: pdf });
  }
  if (body.data && typeof body.data === 'object') {
    const json = JSON.stringify(body.data, null, 2);
    if (json.length <= 1_000_000) attachments.push({ filename: `${fileBase}.json`, content: Buffer.from(json, 'utf8').toString('base64') });
  }

  const message = {
    from: process.env.MAIL_FROM || 'Opulence Venture Group <onboarding@resend.dev>',
    to: [process.env.NOTIFY_TO || 'info@opulenceinvestments.net'],
    subject: `Financial Needs Analysis — ${d.clientName}${d.agentName ? ` (Agent: ${d.agentName})` : ''}`,
    html: emailHtml(d, sections),
    attachments,
  };
  if (d.agentEmail && EMAIL_RE.test(d.agentEmail)) message.reply_to = d.agentEmail;

  try {
    const r = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    if (!r.ok) throw new Error(`Resend responded ${r.status}: ${await r.text()}`);
  } catch (error) {
    console.error('FNA notification failed:', error.message);
    return res.status(502).json({ error: 'Submission could not be delivered.' });
  }
  return res.status(200).json({ ok: true });
}
