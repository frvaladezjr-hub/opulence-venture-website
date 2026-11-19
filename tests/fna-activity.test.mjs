import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { parseActivity, buildAlert } from '../api/fna-activity.mjs';

const base = { type: 'started', client: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', cell: '555-0100' }, agent: { name: 'Frank' } };
function res() { return { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } }; }

test('parses started and progress alerts, rejects bad input', () => {
  assert.equal(parseActivity(base).d.clientName, 'Jane Doe');
  assert.ok(parseActivity({ ...base, type: 'other' }).error);
  assert.ok(parseActivity({ ...base, client: { firstName: 'Jane' } }).error);
  assert.equal(parseActivity({ ...base, client: { ...base.client, firstName: 'Ja\r\nBcc: x@y.z' } }).d.firstName.includes('\n'), false);
});

test('alert emails contain names and sections but no financial data', () => {
  const s = buildAlert(parseActivity(base).d);
  assert.match(s.subject, /^FNA started — Jane Doe \(Agent: Frank\)$/);
  const p = buildAlert(parseActivity({ ...base, type: 'progress', sections: ['A · General', 'B · Retirement'], lastSection: 'B · Retirement' }).d);
  assert.match(p.subject, /^FNA in progress — Jane Doe/);
  assert.match(p.html, /A · General, B · Retirement \(2 of 7\)/);
  assert.match(p.html, /Last viewed section/);
});

test('handler sends through Resend and blocks other sites', async () => {
  process.env.RESEND_API_KEY = 'test';
  const sent = [];
  globalThis.fetch = async (url, opts) => { sent.push(JSON.parse(opts.body)); return { ok: true }; };
  const r = res();
  await handler({ method: 'POST', headers: { host: 'opulenceventuregroup.com', origin: 'https://opulenceventuregroup.com' }, body: JSON.stringify(base) }, r);
  assert.equal(r.code, 200); assert.equal(sent.length, 1); assert.deepEqual(sent[0].to, ['info@opulenceinvestments.net']);
  const r2 = res();
  await handler({ method: 'POST', headers: { host: 'opulenceventuregroup.com', origin: 'https://evil.example' }, body: base }, r2);
  assert.equal(r2.code, 403); assert.equal(sent.length, 1);
  const r3 = res(); await handler({ method: 'GET', headers: {} }, r3); assert.equal(r3.code, 405);
});
