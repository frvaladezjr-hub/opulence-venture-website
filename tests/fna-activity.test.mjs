import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { parseActivity, buildAlert, buildDigest, PENDING_KEY } from '../api/fna-activity.mjs';

const base = { type: 'started', id: 'abc12345xyz', client: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', cell: '555-0100' }, agent: { name: 'Frank' } };
const host = { host: 'opulenceventuregroup.com', origin: 'https://opulenceventuregroup.com' };
function res() { return { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } }; }
function memStore() {
  const h = new Map(), keys = new Map();
  const store = async ([cmd, key, ...a]) => {
    if (cmd === 'HSET') { h.set(a[0], a[1]); return 1; }
    if (cmd === 'HDEL') { a.forEach((f) => h.delete(f)); return 1; }
    if (cmd === 'HGETALL') return [...h].flat();
    if (cmd === 'EXPIRE') return 1;
    if (cmd === 'SET') { if (keys.has(key)) return null; keys.set(key, a[0]); return 'OK'; }
    if (cmd === 'DEL') { keys.delete(key); return 1; }
  };
  store.h = h; return store;
}
let sent = [];
process.env.RESEND_API_KEY = 'test';
globalThis.fetch = async (url, opts) => { sent.push(JSON.parse(opts.body)); return { ok: true }; };

test('parses alerts and rejects bad input', () => {
  assert.equal(parseActivity(base).d.clientName, 'Jane Doe');
  assert.ok(parseActivity({ ...base, type: 'other' }).error);
  assert.ok(parseActivity({ ...base, client: { firstName: 'Jane' } }).error);
  assert.ok(parseActivity({ ...base, type: 'progress', id: 'bad id!' }).error);
  assert.equal(parseActivity({ type: 'cleared', id: 'abc12345xyz' }).d.type, 'cleared');
  assert.equal(parseActivity({ ...base, client: { ...base.client, firstName: 'Ja\r\nBcc: x@y.z' } }).d.firstName.includes('\n'), false);
});

test('started alert is emailed immediately; other sites are blocked', async () => {
  sent = [];
  const r = res(); await handler({ method: 'POST', headers: host, body: JSON.stringify(base) }, r);
  assert.equal(r.code, 200); assert.equal(sent.length, 1);
  assert.match(sent[0].subject, /^FNA started — Jane Doe \(Agent: Frank\)$/);
  const r2 = res(); await handler({ method: 'POST', headers: { ...host, origin: 'https://evil.example' }, body: base }, r2);
  assert.equal(r2.code, 403); assert.equal(sent.length, 1);
});

test('progress is stored, not emailed; cleared removes it', async () => {
  sent = []; const store = memStore();
  const r = res(); await handler({ method: 'POST', headers: host, body: { ...base, type: 'progress', sections: ['A · General'] } }, r, { store });
  assert.equal(r.code, 200); assert.equal(sent.length, 0); assert.equal(store.h.size, 1);
  await handler({ method: 'POST', headers: host, body: { type: 'cleared', id: base.id } }, res(), { store });
  assert.equal(store.h.size, 0);
});

test('digest sends once at 6 PM Pacific (both DST seasons) and empties the list', async () => {
  const store = memStore();
  store.h.set('a1b2c3d4e5', JSON.stringify({ clientName: 'Jane Doe', email: 'jane@example.com', sections: ['A · General', 'B · Retirement'], lastSection: 'B · Retirement', at: Date.now() }));
  store.h.set('f6g7h8i9j0', JSON.stringify({ clientName: 'Sam Lee', sections: [], at: Date.now() }));
  sent = [];
  // 01:00 UTC in November = 5 PM PST -> skip
  let r = res(); await handler({ method: 'GET', headers: {} }, r, { store, now: new Date('2026-11-20T01:00:00Z') });
  assert.equal(r.body.skipped, 'not 6 PM Pacific'); assert.equal(sent.length, 0);
  // 02:00 UTC in November = 6 PM PST -> send
  r = res(); await handler({ method: 'GET', headers: {} }, r, { store, now: new Date('2026-11-20T02:00:00Z') });
  assert.equal(r.body.sent, 2); assert.equal(sent.length, 1); assert.equal(store.h.size, 0);
  assert.match(sent[0].subject, /^FNA still in progress — 2 clients/);
  assert.match(sent[0].html, /A · General, B · Retirement \(2 of 7\)/);
  assert.match(sent[0].html, /Only the name so far/);
  // second run same evening -> no duplicate
  r = res(); await handler({ method: 'GET', headers: {} }, r, { store, now: new Date('2026-11-20T02:30:00Z') });
  assert.equal(sent.length, 1);
  // July: 01:00 UTC = 6 PM PDT -> runs; nothing pending -> no email
  r = res(); await handler({ method: 'GET', headers: {} }, r, { store, now: new Date('2027-07-02T01:00:00Z') });
  assert.equal(r.body.sent, 0); assert.equal(sent.length, 1);
});

test('CRON_SECRET is enforced when set', async () => {
  process.env.CRON_SECRET = 's3cret';
  const r = res(); await handler({ method: 'GET', headers: {} }, r, { store: memStore() });
  assert.equal(r.code, 401);
  delete process.env.CRON_SECRET;
});

test('digest email lists newest first', () => {
  const { html } = buildDigest([{ clientName: 'Old', sections: [], at: 1 }, { clientName: 'New', sections: [], at: 2 }]);
  assert.ok(html.indexOf('New') < html.indexOf('Old'));
  assert.ok(buildAlert(parseActivity(base).d).html.includes('has started'));
});
