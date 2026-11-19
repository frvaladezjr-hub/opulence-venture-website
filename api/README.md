# Agent Discovery Form — email delivery setup

`discovery.mjs` is a Vercel serverless function that receives submissions from
`agent-discovery-form.html`, emails the case to the Advance Planning Division,
and sends the submitting agent a branded confirmation with the scheduling link.

It has no npm dependencies — it calls the Resend HTTP API with built-in `fetch`.

## One-time setup

1. Create a free account at [resend.com](https://resend.com) and generate an API key.
2. In Vercel → Project → Settings → Environment Variables, add:

   | Name | Value | Required |
   | --- | --- | --- |
   | `RESEND_API_KEY` | the key from step 1 | Yes |
   | `NOTIFY_TO` | inbox that receives submissions (default `info@opulenceinvestments.net`) | No |
   | `MAIL_FROM` | `Opulence Venture Group <no-reply@opulenceventuregroup.com>` | No |
   | `BOOKING_URL` | scheduling link in the confirmation (default `https://calendly.com/apdivision`) | No |

3. Redeploy so the function picks up the variables.

## Sending domain

Until `opulenceventuregroup.com` is verified in Resend, leave `MAIL_FROM` unset —
mail goes out from Resend's shared testing sender, which works immediately for
testing but should not be used long term.

To send from your own domain, add the domain in Resend and create the DKIM and
SPF records it provides at GoDaddy. These are **additive** TXT/CNAME records for
a sending subdomain and do not replace the existing Outlook MX, SPF, DKIM,
DMARC, or autodiscover records.

## Behavior without configuration

If `RESEND_API_KEY` is missing or the function is unreachable, the form falls
back to opening the agent's mail client with the full case summary pre-filled,
matching how the careers form on the site already behaves. Nothing is lost.

## Financial Needs Analysis (`fna.mjs`)

`/financial-needs-analysis/` posts to `/api/fna`, which emails the completed
analysis to `NOTIFY_TO` (default `info@opulenceinvestments.net`) with the PDF
summary and the editable `.json` data file attached. It uses the same
`RESEND_API_KEY` and `MAIL_FROM` variables as the discovery form — no extra
setup. If the agent enters an email in Section G, replies go to the agent.

### Activity alerts (`fna-activity.mjs`)

Short heads-up emails to `NOTIFY_TO` with the client's name, email, cell and
agent name only — never financial answers.

- **Started** — emailed right away, once, a few seconds after the client's first
  and last name are entered.
- **Still in progress (end of day)** — when a client leaves the page without
  submitting, the site notes it in the existing Upstash storage
  (`KV_REST_API_URL` / `KV_REST_API_TOKEN`). One summary email goes out at
  6 PM Pacific listing everyone who worked on the form that day without
  submitting: sections with answers, last section viewed and last active time.
  No email is sent on days with nobody in progress.
- Submitting (`/api/fna`) or clearing the form removes that client from the
  summary. Entries are deleted after the summary is sent (and expire after
  3 days regardless).

The summary runs from two Vercel Cron schedules in `vercel.json` (01:00 and
02:00 UTC) so it stays at 6 PM across daylight saving time; only the run that
lands in the 6 PM Pacific hour sends, once per day. Optionally set
`CRON_SECRET` in Vercel to lock the summary endpoint to Vercel Cron.
