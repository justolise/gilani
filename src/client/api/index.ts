import { supabase } from "@/client/supabase";

/**
 * Gilani Client API Gateway
 *
 * Provides typed, clean client-side callers for all `/api/*` REST endpoints.
 * Handles bearer token injection, JSON serialization, and error wrapping.
 *
 * Communication Rule of Thumb:
 * - Application RPC (Auth, Tutor, Quizzes, Notes, Planner, Settings): Use Server Functions from `@/fns/*`
 * - REST & Background Webhooks (/api/mpesa, /api/notifications, /api/newsletter): Use this `api` module
 */

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Core fetch helper that attaches Supabase auth session bearer tokens
 * and parses JSON response bodies with consistent error handling.
 */
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  // Automatically attach auth header if session exists and not already provided
  if (!headers.has("Authorization")) {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch {
      // Non-fatal if session cannot be retrieved
    }
  }

  // Set default JSON Content-Type if sending a body
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => ({})) : await response.text();

  if (!response.ok) {
    const errorMessage =
      (typeof data === "object" && data !== null && (data.error || data.message)) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

/**
 * Clean, typed HTTP endpoints grouped by domain.
 */
export const api = {
  mpesa: {
    /**
     * Trigger an M-Pesa STK push for a plan subscription or token top-up.
     */
    initiate: (params: { phone: string; plan: string; amount?: number }) =>
      apiFetch<{ checkoutRequestId: string; customerMessage?: string }>("/api/mpesa/initiate", {
        method: "POST",
        body: JSON.stringify(params),
      }),
  },

  newsletter: {
    /**
     * Subscribe an email address to the newsletter.
     */
    subscribe: (email: string, source = "footer") =>
      apiFetch<{ success: boolean }>("/api/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email, source }),
      }),

    /**
     * Send newsletter campaign (Admin only).
     */
    sendAdmin: (params: { subject: string; html: string; text?: string }) =>
      apiFetch<{ sent: number; failed: number; total: number }>("/api/newsletter/send", {
        method: "POST",
        body: JSON.stringify(params),
      }),
  },

  notifications: {
    /**
     * Register a Web Push subscription.
     */
    subscribePush: (subscription: PushSubscriptionJSON) =>
      apiFetch<{ success: boolean }>("/api/notifications/push-subscribe", {
        method: "POST",
        body: JSON.stringify({
          subscription,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        }),
      }),

    /**
     * Unregister a Web Push subscription endpoint.
     */
    unsubscribePush: (endpoint: string) =>
      apiFetch<{ success: boolean }>("/api/notifications/push-subscribe", {
        method: "DELETE",
        body: JSON.stringify({ endpoint }),
      }),

    /**
     * Send a push notification to a specific user (Admin only).
     */
    sendAdminPush: (params: {
      targetUserId: string;
      title: string;
      message: string;
      url?: string;
    }) =>
      apiFetch<{ success: boolean }>("/api/notifications/push-send", {
        method: "POST",
        body: JSON.stringify(params),
      }),
  },

  settings: {
    /**
     * Dispatch an audit or telemetry event from settings.
     */
    logEvent: (event: string, metadata: Record<string, any> = {}) =>
      apiFetch<{ success: boolean }>("/api/settings/events", {
        method: "POST",
        body: JSON.stringify({ event, metadata }),
      }).catch((err) => {
        // Non-fatal telemetry error
        console.warn("[API Settings] Event logging failed:", err);
      }),
  },
};
