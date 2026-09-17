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
