import { supabase } from "@/integrations/supabase/client";

/**
 * Base URL for the Express API (server/). Empty string means same-origin,
 * relying on the Vite dev proxy (see vite.config.ts) to reach it locally.
 * In production this must point at the deployed backend (e.g. Render).
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

const REQUEST_TIMEOUT_MS = 30_000;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch wrapper for the Express API. Automatically attaches the Supabase
 * access token, applies a request timeout, retries once on transient
 * network/server failures (never on auth errors), and normalizes errors
 * into user-facing messages.
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  _isRetry = false
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        ...(options?.headers || {}),
      },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 0, err);
    }
    if (!_isRetry) {
      return apiFetch<T>(path, options, true);
    }
    throw new ApiError(
      "Unable to connect to AI service. Check your connection and try again.",
      0,
      err
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new ApiError("Authentication expired. Please sign in again.", res.status);
    }

    if (res.status >= 500 && !_isRetry) {
      return apiFetch<T>(path, options, true);
    }

    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => undefined);
    }
    const message =
      typeof body === "object" && body !== null && "error" in body
        ? String((body as { error: unknown }).error)
        : res.status >= 500
          ? "Backend unavailable. Please try again shortly."
          : `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, body);
  }

  return res.json() as Promise<T>;
}
