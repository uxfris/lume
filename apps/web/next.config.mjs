// Phase 12 — Security headers. CSP starts in Report-Only mode so we can
// observe violations from third-party scripts (Stripe Checkout, etc.)
// before flipping to enforce. Promote `Content-Security-Policy-Report-Only`
// to `Content-Security-Policy` once the report endpoint is quiet.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "object-src 'none'",
].join("; ")

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy-Report-Only", value: cspDirectives },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.lummi.ai",
        pathname: "/assets/**",
      },
    ],
  },
  transpilePackages: [
    "@workspace/ui",
    "@workspace/utils",
    "@workspace/types",
    "@workspace/api-client",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // destination: "http://localhost:3001/:path*",
        destination: "https://lume-api-production.up.railway.app/:path*",
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
