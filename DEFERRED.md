# Deferred / external action items

Things that can't be done from this repo alone — they need infrastructure
changes, the Android app, or a manual step. Keep this list current as features
land.

## One-time secret links (`#23`, shipped 2026-05-25)

- [ ] **Mount a persistent volume for the secret store.** The API writes to
  `data/secrets/` under the app's working directory (`process.cwd()/data`).
  This path is gitignored and lives in the container's ephemeral filesystem, so
  without a volume every Coolify deploy/restart wipes all in-flight secrets.
  Mount a volume at `/app/data` (adjust to the actual working dir) in Coolify.

- [ ] **Android app must encrypt with AES-256-GCM** — not XChaCha20-Poly1305.
  The browser viewer (`/s/[id]`) decrypts with the Web Crypto API, which does
  not support XChaCha. The app side must:
  - encrypt the contact payload with **AES-256-GCM**,
  - use a **12-byte IV**, sent to `POST /api/secret` as `nonce` (base64),
  - **append the 16-byte GCM auth tag to the ciphertext** (Web Crypto's
    convention), sent as `ciphertext` (base64),
  - put the 256-bit key in the URL **fragment** as base64url:
    `https://khord.org/s/{id}#{base64url-key}` (the fragment never reaches the
    server).

- [ ] **Rate limiting is in-memory, per instance.** The `POST /api/secret`
  limit (10/IP/hr) uses an in-process map that resets on restart and is not
  shared across instances. Fine for a single Coolify instance; if the site ever
  scales horizontally, move the counter to a shared store (e.g. Redis) for an
  accurate global limit.
