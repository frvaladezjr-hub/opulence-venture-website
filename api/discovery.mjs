/**
 * POST /api/discovery — Agent Discovery Form handler
 *
 * Emails the submitted case to the Advance Planning Division inbox.
 *
 * Required environment variable (set in Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY   API key from resend.com
 *
 * Optional environment variables:
 *   MAIL_FROM        Sender, e.g. "Opulence Venture Group <no-reply@opulenceventuregroup.com>"
 *                    Defaults to Resend's shared testing sender until the domain is verified.
 *   NOTIFY_TO        Where submissions are delivered. Defaults to info@opulenceinvestments.net.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const NAVY = '#0f1e2e';
const BLUE = '#1f5c8c';
const BORDER = '#c9d6e2';
const MUTED = '#4b5d6f';

const REQUIRED_FIELDS = [
  'agentFirst',
  'agentLast',
  'agentEmail',
  'agentPhone',
  'agentState',
  'emdFirst',
  'clientName',
  'clientType',
  'clientState',
  'stage',
  'advisor',
  'discussed',
  'priorBusiness',
  'outcome',
  'relationship',
];

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

function row(label, value) {
  return `<tr>
    <td style="padding:8px 14px;border-bottom:1px solid ${BORDER};font:600 12px/1.5 Arial,sans-serif;color:${NAVY};white-space:nowrap;vertical-align:top;">${esc(label)}</td>
    <td style="padding:8px 14px;border-bottom:1px solid ${BORDER};font:400 13px/1.6 Arial,sans-serif;color:${MUTED};">${esc(value || '—').replace(/\n/g, '<br />')}</td>
  </tr>`;
}

function sectionHeader(title) {
  return `<tr><td colspan="2" style="padding:16px 14px 6px;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.11em;text-transform:uppercase;color:${BLUE};">${esc(title)}</td></tr>`;
}

function internalHtml(d) {
  const agent = `${d.agentFirst} ${d.agentLast}`.trim();
  const emd = `${d.emdFirst} ${d.emdLast}`.trim();
  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f5f8fb;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;margin:0 auto;background:#ffffff;border:1px solid ${BORDER};border-radius:4px;">
    <tr><td style="padding:22px 24px;background:${NAVY};">
      <div style="font:600 10px/1.4 Arial,sans-serif;letter-spacing:.17em;text-transform:uppercase;color:#a9bdd6;">Advance Planning Division</div>
      <div style="font:400 20px/1.3 Georgia,serif;color:#ffffff;padding-top:6px;">New Agent Discovery Form</div>
    </td></tr>
    <tr><td style="padding:18px 24px 6px;font:400 13px/1.6 Arial,sans-serif;color:${MUTED};">
      <strong style="color:${NAVY};">${esc(d.clientName)}</strong> &middot; ${esc(d.clientType)} &middot; submitted by ${esc(agent)}
    </td></tr>
    <tr><td style="padding:0 10px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        ${sectionHeader('Agent')}
        ${row('Name', agent)}
        ${row('Email', d.agentEmail)}
        ${row('Phone', d.agentPhone)}
        ${row('State', d.agentState)}
        ${row('EMD', emd)}
        ${sectionHeader('Client Profile')}
        ${row('Client', d.clientName)}
        ${row('Who is the client', d.clientType)}
        ${row('State', d.clientState)}
        ${row('Net worth', d.netWorth)}
        ${row('Income range', d.income)}
        ${sectionHeader('Case Type / Area of Need')}
        ${row('Areas', (d.needs || []).join('\n'))}
        ${sectionHeader('Readiness & Engagement')}
        ${row('Stage', d.stage)}
        ${row('Advisor involved', d.advisor)}
        ${row('Timeframe', d.timeframe)}
        ${sectionHeader('Expectations')}
        ${row('Concepts discussed', d.discussed)}
        ${row('Prior GFI business', d.priorBusiness)}
        ${row('Desired outcome', d.outcome)}
        ${row('Relationship', d.relationship)}
        ${row('Additional', d.additional)}
      </table>
    </td></tr>
    <tr><td style="padding:14px 24px;background:#eef3f8;font:400 11px/1.6 Arial,sans-serif;color:#7c8fa0;">
      Submitted from the Agent Discovery Form on opulenceventuregroup.com. Reply to this message to respond to the agent directly.
    </td></tr>
  </table>
</body></html>`;
}

function agentHtml(d, bookingUrl) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f5f8fb;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;margin:0 auto;background:#ffffff;border:1px solid ${BORDER};border-radius:4px;">
    <tr><td style="padding:24px;background:${NAVY};">
      <div style="font:600 10px/1.4 Arial,sans-serif;letter-spacing:.17em;text-transform:uppercase;color:#a9bdd6;">Advance Planning Division</div>
      <div style="font:400 21px/1.3 Georgia,serif;color:#ffffff;padding-top:6px;">We received your discovery form</div>
    </td></tr>
    <tr><td style="padding:24px;font:400 14px/1.65 Arial,sans-serif;color:${MUTED};">
      <p style="margin:0 0 14px;">${esc(d.agentFirst)} — thank you for submitting <strong style="color:${NAVY};">${esc(d.clientName)}</strong> for advanced planning review.</p>
      <p style="margin:0 0 14px;">Our team will review the case details and follow up with next steps. To move faster, book your case review now:</p>
      <p style="margin:20px 0;">
        <a href="${esc(bookingUrl)}" style="display:inline-block;background:${BLUE};color:#ffffff;text-decoration:none;font:600 14px/1 Arial,sans-serif;padding:13px 24px;border-radius:3px;">Book Your Case Review</a>
      </p>
      <p style="margin:0 0 6px;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${BLUE};">Case summary</p>
      <p style="margin:0;font:400 13px/1.7 Arial,sans-serif;">
        Client: ${esc(d.clientName)} (${esc(d.clientType)}), ${esc(d.clientState)}<br />
        Areas of need: ${esc((d.needs || []).join(', '))}<br />
        Stage: ${esc(d.stage)}${d.timeframe ? ` &middot; Timeframe: ${esc(d.timeframe)}` : ''}
      </p>
    </td></tr>
    <tr><td style="padding:16px 24px;background:#eef3f8;font:400 11px/1.6 Arial,sans-serif;color:#7c8fa0;">
      Opulence Venture Group provides business consulting and financial planning education and strategy coordination. Nothing in this message constitutes tax, legal, or investment advice.
    </td></tr>
  </table>
</body></html>`;
}

async function sendMail(apiKey, message) {
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend responded ${res.status}: ${detail}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Email delivery is not configured yet.' });
  }

  const from = process.env.MAIL_FROM || 'Opulence Venture Group <onboarding@resend.dev>';
  const notifyTo = process.env.NOTIFY_TO || 'info@opulenceinvestments.net';
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON body.' }); }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Missing submission data.' });
  }

  const d = {
    agentFirst: clean(body.agentFirst, 80),
    agentLast: clean(body.agentLast, 80),
    agentEmail: clean(body.agentEmail, 160),
    agentPhone: clean(body.agentPhone, 40),
    agentState: clean(body.agentState, 80),
    emdFirst: clean(body.emdFirst, 80),
    emdLast: clean(body.emdLast, 80),
    clientName: clean(body.clientName, 120),
    clientType: clean(body.clientType, 60),
    clientState: clean(body.clientState, 80),
    netWorth: clean(body.netWorth, 40),
    income: clean(body.income, 40),
    needs: Array.isArray(body.needs) ? body.needs.slice(0, 12).map((n) => clean(n, 120)) : [],
    stage: clean(body.stage, 80),
    advisor: clean(body.advisor, 20),
    timeframe: clean(body.timeframe, 40),
    discussed: clean(body.discussed, 20),
    priorBusiness: clean(body.priorBusiness),
    outcome: clean(body.outcome),
    relationship: clean(body.relationship),
    additional: clean(body.additional),
  };

  const missing = REQUIRED_FIELDS.filter((field) => !d[field]);
  if (missing.length || d.needs.length === 0) {
    return res.status(400).json({
      error: 'Some required answers are missing.',
      missing: d.needs.length === 0 ? [...missing, 'needs'] : missing,
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.agentEmail)) {
    return res.status(400).json({ error: 'Please provide a valid agent email address.' });
  }

  try {
    await sendMail(apiKey, {
      from,
      to: [notifyTo],
      reply_to: d.agentEmail,
      subject: `Advanced Planning Discovery — ${d.clientName} (${d.clientType})`,
      html: internalHtml(d),
    });
  } catch (error) {
    console.error('Discovery notification failed:', error.message);
    return res.status(502).json({ error: 'Submission could not be delivered.' });
  }

  return res.status(200).json({ ok: true });
}
