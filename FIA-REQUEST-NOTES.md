# FIA Illustration Request

The agent-only form is embedded within the Agent Resources library. It uses the
existing library session to authorize `/api/fia-illustration`, and the same
server-side email settings as the discovery form:

- `RESEND_API_KEY`: production mail provider credential.
- `MAIL_FROM`: verified sender. If omitted, the existing discovery-form testing
  sender is used; configure a verified sender for production delivery.
- Existing `AGENT_ACCESS_CODE`, `AGENT_SESSION_SECRET`, `KV_REST_API_URL`, and
  `KV_REST_API_TOKEN`: shared library authentication and durable rate limits.

The recipient is fixed server-side to `info@opulenceinvestments.net`. The agent
receives a separate acknowledgement that excludes the client's account details.
Provider acceptance is not proof of inbox delivery. The UI distinguishes a
notification failure from an acknowledgement-only failure, so agents do not
resubmit a successfully accepted case.

Requests include client name, age, state, gender, current account/plan, tax
status, amount, optional carrier, and accumulation/income goal. Income start age
is required for an income illustration. The agent name and email are required
for reply and confirmation. Do not collect SSNs or account numbers.

An optional Follow up date picker sits beneath Agent email. The chosen date is
validated as a real calendar date and included in the internal request email;
it does not create a calendar event or automatic reminder. Gender choices are
Female and Male.

The UI retains a random request identifier for retries. Provider idempotency keys
also include the validated payload hash and message type, preventing unchanged
immediate retries from creating duplicate messages within the provider's
idempotency window. Submission limits are separate from login limits.

## Preview versus production

The private preview server uses the same validation and session authorization,
but explicitly runs in dry-run mode. Preview requests send no mail and are not
stored. The source-download and production frontend use relative `/api/` routes
when no private port proxy is supplied.

No live email was sent during development. Tests inject a mock mail sender to
check recipients, rendering, failure handling, and retry keys. After production
deployment, verify one authorized test submission and actual inbox receipt.

Run `node --test tests/*.test.mjs` for library and FIA endpoint tests.
