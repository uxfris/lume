// next.config.mjs

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Normalize trailing slash
const normalizedApiUrl = API_URL.replace(/\/$/, "")

// Presigned S3 PUT (uploads, avatars) and GET (meeting playback) hit the bucket host directly.
const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL?.replace(/\/$/, "")
const s3Origins = [s3BaseUrl, "https://*.s3.us-east-1.amazonaws.com"]
  .filter(Boolean)
  .join(" ")

// Enforcing CSP (not Report-Only): frame-ancestors is ignored in report-only mode,
// and Safari does not apply report-only policies without a report-to endpoint.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${normalizedApiUrl} https://api.stripe.com ${s3Origins}`,
  `media-src 'self' blob: ${s3Origins}`,
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
  {
    key: "Content-Security-Policy",
    value: cspDirectives,
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["jsdom"],
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
        source: "/api/auth/:path*",
        destination: `${normalizedApiUrl}/api/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${normalizedApiUrl}/:path*`,
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
