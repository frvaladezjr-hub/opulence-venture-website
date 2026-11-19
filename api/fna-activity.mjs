/**
 * POST /api/fna-activity — Financial Needs Analysis activity alerts
 *
 * Short heads-up emails (no financial answers):
 *   POST type "started"  — emailed right away once the client's name is entered
 *   POST type "progress" — the client left without submitting; remembered (not
 *                           emailed) until the end-of-day summary
 *   POST type "cleared"  — the form was cleared; drop it from today's summary
 *   GET  (Vercel Cron)   — sends one "still in progress" summary at 6 PM Pacific
 *
 * /api/fna removes a client from the summary when they submit.
 *
 * Environment (all already used elsewhere on the site):
 *   RESEND_API_KEY, MAIL_FROM, NOTIFY_TO          — email (same as /api/fna)
 *   KV_REST_API_URL, KV_REST_API_TOKEN           — Upstash storage
 *   CRON_SECRET (optional)                       — if set, required on the digest
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const NAVY = '#00446a';
const BLUE = '#0084d3';
const BORDER = '#c9d6e2';
const MUTED = '#4b5d6f';
const TZ = 'America/Los_Angeles';
const DIGEST_HOUR = 18; // 6 PM Pacific
export const PENDING_KEY = 'opulence:fna:v1:inprogress';
const LOCK_PREFIX = 'opulence:fna:v1:digest:';
const ID_RE = /^[a-z0-9]{8,32}$/;

export function kv(env = process.env) {
  if (!env.KV_REST_API_URL || !env.KV_REST_API_TOKEN) return null;
  return async (parts) => {
    const r = await fetch(env.KV_REST_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.KV_REST_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(parts), signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) throw new Error('Storage unavailable.');
    const j = await r.json();
    if (j.error) throw new Error('Storage unavailable.');
    return j.result;
  };
}
export function isValidId(id) { return ID_RE.test(String(id || '')); }

function pacific(now) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(now).map((p) => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}
const fmtWhen = (ms) => new Date(ms).toLocaleString('en-US', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });

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

function shell(heading, inner, foot) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f5f8fb;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;margin:0 auto;background:#ffffff;border:1px solid ${BORDER};border-radius:4px;">
    <tr><td style="padding:20px 24px;background:${NAVY};">
      <div style="font:600 10px/1.4 Arial,sans-serif;letter-spacing:.17em;text-transform:uppercase;color:#a9bdd6;">Opulence Venture Group</div>
      <div style="font:400 19px/1.3 Georgia,serif;color:#ffffff;padding-top:6px;">${heading}</div>
    </td></tr>
    ${inner}
    <tr><td style="padding:12px 24px;background:#eef3f8;font:400 11px/1.6 Arial,sans-serif;color:#7c8fa0;">${foot}</td></tr>
  </table></body></html>`;
}

export function buildAlert(d, now = new Date()) {
  const rows = [
    row('Client', d.clientName),
    d.email ? row('Email', d.email) : '',
    d.cell ? row('Cell', d.cell) : '',
    d.agentName ? row('Agent', d.agentName) : '',
    row('Started', fmtWhen(now.getTime())),
  ].join('');
  const html = shell('Financial Needs Analysis started',
    `<tr><td style="padding:18px 24px 10px;font:400 13px/1.6 Arial,sans-serif;color:${MUTED};"><strong style="color:${NAVY};">${esc(d.clientName)}</strong> has started filling out the Financial Needs Analysis.</td></tr>
    <tr><td style="padding:0 10px 18px;"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${rows}</table></td></tr>`,
    'Activity alert only — no financial answers are included. You will get the full analysis by email when it is submitted.');
  return { subject: `FNA started — ${d.clientName}${d.agentName ? ` (Agent: ${d.agentName})` : ''}`, html };
}

export function buildDigest(entries, now = new Date()) {
  const list = entries.slice().sort((a, b) => b.at - a.at);
  const day = now.toLocaleDateString('en-US', { timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric' });
  const cards = list.map((e) => `<tr><td style="padding:0 10px 14px;"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid ${BORDER};border-radius:4px;">
      <tr><td colspan="2" style="padding:10px 14px;background:#f5f8fb;font:600 14px/1.4 Arial,sans-serif;color:${NAVY};">${esc(e.clientName)}${e.agentName ? `<span style="font-weight:400;color:${MUTED};"> &middot; Agent: ${esc(e.agentName)}</span>` : ''}</td></tr>
      ${e.email ? row('Email', e.email) : ''}${e.cell ? row('Cell', e.cell) : ''}
      ${row('Sections with answers', e.sections.length ? `${e.sections.join(', ')} (${e.sections.length} of 7)` : 'Only the name so far')}
      ${e.lastSection ? row('Last viewed section', e.lastSection) : ''}
      ${row('Last active', fmtWhen(e.at))}
    </table></td></tr>`).join('');
  const n = list.length;
  const html = shell('Financial Needs Analysis — still in progress',
    `<tr><td style="padding:18px 24px 12px;font:400 13px/1.6 Arial,sans-serif;color:${MUTED};">${n === 1 ? '1 person' : `${n} people`} worked on the Financial Needs Analysis today and left without submitting. Their answers are saved on their device, so they can pick up where they left off.</td></tr>${cards}`,
    `Daily summary for ${esc(day)} — no financial answers are included. <span style="color:${BLUE};">A good moment for a friendly follow-up.</span>`);
  return { subject: `FNA still in progress — ${n} ${n === 1 ? 'client' : 'clients'} (${day})`, html };
}

async function sendEmail(apiKey, subject, html) {
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
}

// Runs from Vercel Cron. Two UTC schedules cover daylight saving; only the run
// that lands in the 6 PM Pacific hour sends, and only once per day.
export async function runDigest(req, res, { now = new Date(), store = kv() } = {}) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'Unauthorized' });
  const { date, hour } = pacific(now);
  if (hour !== DIGEST_HOUR) return res.status(200).json({ ok: true, skipped: 'not 6 PM Pacific' });
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !store) return res.status(503).json({ error: 'Not configured.' });
  try {
    const got = await store(['SET', LOCK_PREFIX + date, '1', 'NX', 'EX', 7200]);
    if (got !== 'OK') return res.status(200).json({ ok: true, skipped: 'already sent' });
    const flat = (await store(['HGETALL', PENDING_KEY])) || [];
    const entries = [], ids = [];
    for (let i = 0; i + 1 < flat.length; i += 2) {
      ids.push(flat[i]);
      try { const e = JSON.parse(flat[i + 1]); if (e && e.clientName) entries.push(e); } catch {}
    }
    if (!entries.length) { if (ids.length) await store(['HDEL', PENDING_KEY, ...ids]); return res.status(200).json({ ok: true, sent: 0 }); }
    const { subject, html } = buildDigest(entries, now);
    try { await sendEmail(apiKey, subject, html); }
    catch (err) { await store(['DEL', LOCK_PREFIX + date]); throw err; }
    await store(['HDEL', PENDING_KEY, ...ids]);
    return res.status(200).json({ ok: true, sent: entries.length });
  } catch (err) {
    console.error('FNA digest failed:', err.message);
    return res.status(502).json({ error: 'Digest could not be sent.' });
  }
}

export function parseActivity(body) {
  if (!body || typeof body !== 'object') return { error: 'Missing data.' };
  const type = ['started', 'progress', 'cleared'].includes(body.type) ? body.type : '';
  const id = isValidId(body.id) ? String(body.id) : '';
  if (!type) return { error: 'Unknown alert type.' };
  const client = body.client || {};
  const d = {
    type, id,
    firstName: clean(client.firstName, 80),
    lastName: clean(client.lastName, 80),
    email: clean(client.email, 160),
    cell: clean(client.cell, 40),
    agentName: clean(body.agent && body.agent.name, 120),
    lastSection: clean(body.lastSection, 80),
    sections: (Array.isArray(body.sections) ? body.sections : []).slice(0, 7).map((s) => clean(s, 60)).filter(Boolean),
  };
  if (type !== 'started' && !id) return { error: 'Missing form id.' };
  if (type !== 'cleared' && (!d.firstName || !d.lastName)) return { error: 'Client name is required.' };
  d.clientName = `${d.firstName} ${d.lastName}`;
  return { d };
}

export default async function handler(req, res, deps = {}) {
  if (req.method === 'GET') return runDigest(req, res, deps);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Only accept alerts sent from this website.
  const origin = req.headers.origin || '';
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  if (origin && host && origin.replace(/^https?:\/\//, '') !== host) return res.status(403).json({ error: 'Forbidden' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON body.' }); } }
  if (body && clean(body.company)) return res.status(200).json({ ok: true }); // honeypot
  const { d, error } = parseActivity(body);
  if (error) return res.status(400).json({ error });

  if (d.type === 'started') {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'Email delivery is not configured yet.' });
    const { subject, html } = buildAlert(d);
    try { await sendEmail(apiKey, subject, html); }
    catch (err) { console.error('FNA started alert failed:', err.message); return res.status(502).json({ error: 'Alert could not be delivered.' }); }
    return res.status(200).json({ ok: true });
  }

  const store = deps.store || kv();
  if (!store) return res.status(503).json({ error: 'Storage is not configured.' });
  try {
    if (d.type === 'cleared') await store(['HDEL', PENDING_KEY, d.id]);
    else {
      const entry = { clientName: d.clientName, email: d.email, cell: d.cell, agentName: d.agentName, sections: d.sections, lastSection: d.lastSection, at: Date.now() };
      await store(['HSET', PENDING_KEY, d.id, JSON.stringify(entry)]);
      await store(['EXPIRE', PENDING_KEY, 3 * 86400]);
    }
  } catch (err) {
    console.error('FNA progress save failed:', err.message);
    return res.status(502).json({ error: 'Could not save.' });
  }
  return res.status(200).json({ ok: true });
}
