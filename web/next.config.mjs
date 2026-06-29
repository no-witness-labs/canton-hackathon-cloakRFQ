/** @type {import('next').NextConfig} */

// In dev, proxy /v2/* to the Canton JSON Ledger API so the browser can call it
// same-origin (the JSON API sends no CORS headers). Override the target with
// CLOAKRFQ_JSON_API if the sandbox runs elsewhere.
const JSON_API = process.env.CLOAKRFQ_JSON_API ?? 'http://127.0.0.1:6864';

const nextConfig = {
  async rewrites() {
    return [
      { source: '/v2/:path*', destination: `${JSON_API}/v2/:path*` },
    ];
  },
};

export default nextConfig;
