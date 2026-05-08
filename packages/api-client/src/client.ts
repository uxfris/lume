// packages/api-client/src/client.ts

import { z } from "zod"

export const ApiErrorSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number(),
  detail: z.string(),
  traceId: z.string(),
})
export type ApiError = z.infer<typeof ApiErrorSchema>

/** Same value for localStorage, document.cookie name, and Next.js `cookies().get(...)`. */
export const ACTIVE_WORKSPACE_ID_KEY = "active_workspace_id"

const ACTIVE_WORKSPACE_STORAGE_KEY = ACTIVE_WORKSPACE_ID_KEY
const WORKSPACE_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365

let inMemoryActiveWorkspaceId: string | null = null

function setWorkspaceCookie(workspaceId: string | null) {
  if (!workspaceId) {
    document.cookie = `${ACTIVE_WORKSPACE_ID_KEY}=; Path=/; Max-Age=0; SameSite=Lax`
    return
  }
  document.cookie = `${ACTIVE_WORKSPACE_ID_KEY}=${encodeURIComponent(workspaceId)}; Path=/; Max-Age=${WORKSPACE_COOKIE_MAX_AGE_SEC}; SameSite=Lax`
}

export function setActiveWorkspaceId(workspaceId: string | null) {
  inMemoryActiveWorkspaceId = workspaceId
  if (typeof window !== "undefined") {
    if (workspaceId) {
      window.localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspaceId)
    } else {
      window.localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY)
    }
    setWorkspaceCookie(workspaceId)
  }
}

export function getActiveWorkspaceId(): string | null {
  if (inMemoryActiveWorkspaceId) return inMemoryActiveWorkspaceId
  if (typeof window === "undefined") return null

  const persisted = window.localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)
  inMemoryActiveWorkspaceId = persisted
  if (persisted) {
    setWorkspaceCookie(persisted)
  }
  return persisted
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  headers?: HeadersInit
  params?: Record<string, string | number | boolean | undefined>
  cache?: RequestCache
  /**
   * Raw `Cookie` header for server-side `fetch` (e.g. Next.js Server Components).
   * Browser requests should omit this; `credentials: "include"` sends cookies automatically.
   */
  cookie?: string
  /**
   * Overrides `x-workspace-id` (and in-memory / localStorage resolution).
   * Pass from `cookies().get(ACTIVE_WORKSPACE_ID_KEY)` when calling from the server.
   */
  workspaceId?: string | null
}

function buildUrl(url: string, params?: RequestOptions["params"]) {
  if (!params) return url

  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.append(key, String(value))
    }
  }

  return `${url}?${search.toString()}`
}

async function request<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    headers,
    params,
    cache = "no-store",
    cookie,
    workspaceId: workspaceIdOption,
  } = options

  const serverBase =
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")) ||
    "http://localhost:3001"

  const baseUrl =
    typeof window === "undefined" ? serverBase : "/api"

  const fullUrl = buildUrl(`${baseUrl}${url}`, params)
  const activeWorkspaceId =
    workspaceIdOption !== undefined
      ? workspaceIdOption
      : getActiveWorkspaceId()

  const res = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(activeWorkspaceId ? { "x-workspace-id": activeWorkspaceId } : {}),
      ...headers,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    credentials: typeof window === "undefined" ? "omit" : "include",
    body: body ? JSON.stringify(body) : undefined,
    cache,
  })

  if (!res.ok) {
    let errorBody: any = null
    try {
      errorBody = await res.json()
    } catch {}

    const error: ApiError = ApiErrorSchema.parse({
      type: errorBody?.["type"] || "about:blank",
      title:
        errorBody?.["title"] ||
        errorBody?.["message"] ||
        res.statusText ||
        "API Error",
      status: res.status,
      detail:
        errorBody?.["detail"] ||
        errorBody?.["message"] ||
        (typeof errorBody?.["error"] === "string"
          ? errorBody.error
          : "") ||
        "",
      traceId: errorBody?.["trace_id"] || "",
    })

    throw error
  }

  // Handle empty response
  if (res.status === 204) {
    return {} as T
  }

  return res.json()
}

export const client = {
  get: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "POST", body }),

  put: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "PUT", body }),

  patch: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "PATCH", body }),

  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "DELETE" }),
}
