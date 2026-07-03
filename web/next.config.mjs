/** @type {import('next').NextConfig} */

// `/v2/*` is proxied to the Canton JSON Ledger API by the server route handler at
// app/v2/[...path]/route.ts (so it can inject an OIDC Bearer token for DevNet).
// Target + auth are configured via CLOAKRFQ_LEDGER_TARGET / CLOAKRFQ_OIDC_* env.
const nextConfig = {};

export default nextConfig;
