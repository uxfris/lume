import pino from "pino"

/**
 * Pino logger for the worker. In production we emit structured JSON to
 * stdout (Better Stack / Axiom slurp it from the platform log stream).
 * In dev we use pino-pretty for readability.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { service: "lume-worker" },
  redact: {
    paths: ["err.config.headers.authorization", "*.audioUrl"],
    censor: "[REDACTED]",
  },
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : { target: "pino-pretty", options: { colorize: true } },
})
