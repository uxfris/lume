import { lookup } from "node:dns/promises"
import path from "node:path"
import { isIP } from "node:net"
import {
  isAllowedUploadMime,
  MAX_UPLOAD_FILE_SIZE_BYTES,
} from "@workspace/types"

const MAX_REDIRECTS = 5
const FETCH_TIMEOUT_MS = 60_000

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
])

const EXTENSION_MIME: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
}

export type RemoteUploadPayload = {
  fileName: string
  fileType: string
  fileSize: number
  body: Buffer
}

export class RemoteUrlError extends Error {
  constructor(
    message: string,
    readonly code:
      | "INVALID_URL"
      | "BLOCKED_HOST"
      | "UNSUPPORTED_TYPE"
      | "FILE_TOO_LARGE"
      | "FETCH_FAILED"
      | "REDIRECT_LOOP"
  ) {
    super(message)
    this.name = "RemoteUrlError"
  }
}

function isPrivateOrReservedIp(ip: string): boolean {
  const version = isIP(ip)
  if (version === 4) {
    const [a, b = 0] = ip.split(".").map(Number)
    if (a === 127 || a === 10 || a === 0) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 169 && b === 254) return true
    return false
  }

  if (version === 6) {
    const normalized = ip.toLowerCase()
    if (normalized === "::1") return true
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true
    if (normalized.startsWith("fe80:")) return true
    return false
  }

  return true
}

export async function assertSafeRemoteUrl(urlString: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(urlString)
  } catch {
    throw new RemoteUrlError("Invalid URL", "INVALID_URL")
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new RemoteUrlError("Only HTTP(S) URLs are supported", "INVALID_URL")
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase()
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new RemoteUrlError("URL hostname is not allowed", "BLOCKED_HOST")
  }

  if (isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      throw new RemoteUrlError(
        "URL points to a private network address",
        "BLOCKED_HOST"
      )
    }
    return url
  }

  const records = await lookup(hostname, { all: true })
  for (const record of records) {
    if (isPrivateOrReservedIp(record.address)) {
      throw new RemoteUrlError(
        "URL resolves to a private network address",
        "BLOCKED_HOST"
      )
    }
  }

  return url
}

function parseContentDisposition(header: string | null): string | null {
  if (!header) return null
  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim())
    } catch {
      return utf8Match[1].trim()
    }
  }
  const quoted = header.match(/filename="([^"]+)"/i)
  if (quoted?.[1]) return quoted[1].trim()
  const plain = header.match(/filename=([^;]+)/i)
  return plain?.[1]?.trim() ?? null
}

function deriveFileName(url: URL, contentDisposition: string | null): string {
  const fromHeader = parseContentDisposition(contentDisposition)
  if (fromHeader) return path.basename(fromHeader).slice(0, 512)

  const fromPath = path.basename(url.pathname)
  if (fromPath && fromPath !== "/") return fromPath.slice(0, 512)

  return "imported-file"
}

function normalizeContentType(
  raw: string | null,
  fileName: string
): string | null {
  if (raw) {
    const primary = raw.split(";")[0]?.trim()
    if (primary) return primary
  }

  const ext = path.extname(fileName).toLowerCase()
  return EXTENSION_MIME[ext] ?? null
}

async function readResponseWithLimit(
  response: Response,
  maxBytes: number
): Promise<Buffer> {
  if (!response.body) {
    throw new RemoteUrlError("Empty response body", "FETCH_FAILED")
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue

    total += value.byteLength
    if (total > maxBytes) {
      throw new RemoteUrlError("File too large", "FILE_TOO_LARGE")
    }
    chunks.push(value)
  }

  return Buffer.concat(chunks)
}

export async function fetchRemoteUpload(
  urlString: string,
  maxBytes = MAX_UPLOAD_FILE_SIZE_BYTES
): Promise<RemoteUploadPayload> {
  let currentUrl = await assertSafeRemoteUrl(urlString)

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    let response: Response
    try {
      response = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "Lume-Upload-Importer/1.0",
          Accept: "audio/*,video/*,application/pdf,*/*;q=0.1",
        },
      })
    } catch (err) {
      const message =
        err instanceof Error && err.name === "AbortError"
          ? "Timed out while fetching the remote file"
          : "Could not fetch the remote file"
      throw new RemoteUrlError(message, "FETCH_FAILED")
    } finally {
      clearTimeout(timer)
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location")
      if (!location) {
        throw new RemoteUrlError("Redirect without Location header", "FETCH_FAILED")
      }
      if (redirectCount === MAX_REDIRECTS) {
        throw new RemoteUrlError("Too many redirects", "REDIRECT_LOOP")
      }
      currentUrl = await assertSafeRemoteUrl(
        new URL(location, currentUrl).toString()
      )
      continue
    }

    if (!response.ok) {
      throw new RemoteUrlError(
        `Remote server returned ${response.status}`,
        "FETCH_FAILED"
      )
    }

    const contentLengthHeader = response.headers.get("content-length")
    if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader)
      if (Number.isFinite(contentLength) && contentLength > maxBytes) {
        throw new RemoteUrlError("File too large", "FILE_TOO_LARGE")
      }
    }

    const fileName = deriveFileName(
      currentUrl,
      response.headers.get("content-disposition")
    )
    const fileType = normalizeContentType(
      response.headers.get("content-type"),
      fileName
    )

    if (!fileType || !isAllowedUploadMime(fileType)) {
      throw new RemoteUrlError(
        "Unsupported file type. Allowed: audio/*, video/*, application/pdf.",
        "UNSUPPORTED_TYPE"
      )
    }

    const body = await readResponseWithLimit(response, maxBytes)

    if (body.byteLength === 0) {
      throw new RemoteUrlError("Remote file is empty", "FETCH_FAILED")
    }

    return {
      fileName,
      fileType,
      fileSize: body.byteLength,
      body,
    }
  }

  throw new RemoteUrlError("Too many redirects", "REDIRECT_LOOP")
}
