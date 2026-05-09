import fp from "fastify-plugin"
import helmet from "@fastify/helmet"
import { env } from "../config/env"

/**
 * Standard security headers (HSTS, frameguard, X-Content-Type-Options, etc.).
 *
 * We deliberately disable Helmet's CSP here because:
 *  1. The API only serves JSON / form-data / Bull Board (dev only) — there
 *     is no app-level HTML for the browser to attack.
 *  2. The browser-facing CSP belongs to the Next.js app — see
 *     `apps/web/middleware.ts` (handled separately in Phase 12).
 *
 * Keep COEP/COOP off too: Bull Board pulls inline assets that would break.
 */
export default fp(async (app) => {
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    // Strict-Transport-Security only makes sense once we're on HTTPS.
    hsts: env.NODE_ENV === "production",
  })
})
