# Agent Resources production release

This release adds only Agent Resources to the existing live site. The indexed-growth annuity calculator remains excluded.

## Required Vercel environment settings

Set these for Production and Preview, with sensitive values hidden:

- `AGENT_ACCESS_CODE`: the owner's chosen four-digit shared code.
- `AGENT_SESSION_SECRET`: a randomly generated secret of at least 40 characters.
- `KV_REST_API_URL` and `KV_REST_API_TOKEN`: supplied by the connected Upstash integration.
- `AGENT_MEDIA_KEY`: the separate 64-character hexadecimal media-encryption key delivered privately to the owner. Never commit it or use a `PUBLIC_` / `VITE_` prefix.

The catalog and approved PDF/video files are encrypted using AES-256-GCM before entering this public repository. The sole key is outside the repository and must be set in Vercel. Authentication, session validity and catalog allowlisting are checked before every catalog or media request. Media is delivered in authenticated chunks up to 2 MiB each, then assembled in browser memory. Static vault downloads disclose ciphertext only. Decryption remains server-side; the key is never sent to agents or browser JavaScript.

## Approved resources

- Whole Life vs. IUL: existing Perplexity artifact link, with its original sharing permissions. An MP4/full source bundle has not been supplied.
- Roth Conversions: embedded video.
- Debt Action Plan: newer 251.96-second video, artifact `8a1f062b-fa1a-4bf2-9b26-5a8a7c3853d4`. The removed older video is not bundled.
- Infinite Banking Strategy: original five-page PDF, embedded with page/zoom controls and optional download.

## Operational limitations

A shared four-digit code is a basic gate, not individual agent identity or per-agent approval. Use this library for non-sensitive training, never client records. The Redis-backed limiter permits five attempts per IP per 15 minutes and 50 globally per 15 minutes; shared office IPs can therefore encounter temporary lockouts. Sessions expire after two hours. Refresh, navigation, sign-out, and expiry clear the page; server-side sign-out revokes its token. Recipients can retain/download content they are authorized to access.

Environment changes require a new Vercel deployment. Updating the media key alone without re-encrypting the vault prevents playback. Do not overwrite the existing discovery-form or Resend settings.
