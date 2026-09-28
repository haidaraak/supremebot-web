/**
 * Thin API client.
 *
 * Calls the backend directly — the frontend is served under the backend's own
 * domain, so every request is same-origin and no proxy route is involved.
 * Override the origin at build time with NEXT_PUBLIC_API_BASE_URL.
 */

import { logAdminRequest } from "./discordLog";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://supremex.zip/api").replace(/\/+$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const startedAt = Date.now();
  const method = init?.method ?? "GET";

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (path.startsWith("/admin")) {
    logAdminRequest(path, method, res.status, Date.now() - startedAt);
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "error" in data
        ? String((data as Record<string, unknown>).error)
        : res.statusText || "Request failed";
    throw new ApiError(msg, res.status);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),
};
