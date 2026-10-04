# Client-to-Server Communication Architecture

This directory defines the client-side API layer for GilaniAI.

## Architecture Overview

GilaniAI uses a clean **two-tier** connection model between client and server:

```
┌────────────────────────────────────────────────────────┐
│                     Client (UI)                        │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
   RPC Calls   │                          │ REST / Streaming
  (TanStack)   │                          │ (HTTP Fetch)
               ▼                          ▼
┌──────────────────────────────┐ ┌───────────────────────┐
│ Server Functions (`@/fns/*`) │ │ API Routes (`/api/*`) │
│                              │ │ via `@/client/api`    │
│ - Study sessions & chat      │ │ - Streaming chat SSE  │
│ - Notes & document summaries │ │ - M-Pesa STK push     │
│ - Quizzes & study plans      │ │ - Web Push & events   │
│ - User auth & role changes   │ │ - Newsletter campaign │
│ - Settings & data export     │ │                       │
└──────────────┬───────────────┘ └───────────┬───────────┘
               │                             │
               └──────────────┬──────────────┘
                              ▼
               ┌─────────────────────────────┐
               │    Server Core (`@/server`) │
               │  Database, Auth, Email, etc │
               └─────────────────────────────┘
```

---

## 1. When to Use Which Pattern

| Need                                                            | Recommended Pattern                        | Example                                 |
| --------------------------------------------------------------- | ------------------------------------------ | --------------------------------------- |
| **Feature logic** (CRUD, notes, quizzes, teacher escalations)   | **Server Function** (`@/fns/*.server-fns`) | `await createNote({ data: { ... } })`   |
| **Streaming responses** (real-time AI response tokens)          | **API Route** (`/api/chat`)                | Handled via AI SDK `useChat`            |
| **External integrations & Webhooks** (Safaricom M-Pesa, Zapier) | **API Route** (`/api/mpesa/*`)             | Client calls via `api.mpesa.initiate()` |
| **Background / Service Worker** (Web push subscriptions)        | **API Route** (`/api/notifications/*`)     | Client calls via `api.notifications.*`  |

---

## 2. Pattern 1: Server Functions (`@/fns/*`)

Server functions run securely on the server but are imported directly into React components like typed asynchronous functions.

### How to call:

```typescript
import { renameThreadFn } from "@/fns/tutor.server-fns";

// Inside a React component or hook:
try {
  const result = await renameThreadFn({
    data: {
      threadId: "123e4567-e89b-12d3-a456-426614174000",
      title: "Biology: Photosynthesis",
    },
  });
  console.log(result.success);
} catch (err: any) {
  toast.error(err.message);
}
```

### Characteristics:

- **Zero boilerplate**: No need to configure HTTP method, headers, or JSON parsing.
- **End-to-End Type Safety**: Input validated with Zod on the server; TypeScript types flow directly to the client.
- **Automatic Auth Context**: Server functions automatically access the user session via `await requireAuth()`.

---

## 3. Pattern 2: HTTP API Gateway (`@/client/api`)

For HTTP `/api/*` endpoints (M-Pesa, Push, Newsletter), import the unified `api` client from `@/client/api`.

### How to call:

```typescript
import { api } from "@/client/api";

// 1. M-Pesa STK Push
const { checkoutRequestId } = await api.mpesa.initiate({
  phone: "0712345678",
  plan: "pro",
});

// 2. Newsletter Subscription
await api.newsletter.subscribe("student@example.com");

// 3. Web Push Registration
await api.notifications.subscribePush(subscription);
```

### Characteristics:

- **Automatic Bearer Token**: Attaches the Supabase auth token automatically if the user is signed in.
- **Clean Error Handling**: Non-2xx responses throw an `ApiError` with clear error messages from the server.

---

## 4. API & Server Function Directory

### Server Functions (`src/fns/`)

- **`auth-actions.server-fns.ts`**: Sign-in checks, email verification token consumption, role assignment.
- **`tutor.server-fns.ts`**: Study session management (rename, delete, AI title generation) and teacher escalation review.
- **`notes.server-fns.ts`**: Note upload, chunking, AI embedding, summarization pipeline.
- **`quiz.server-fns.ts`**: AI quiz generation, attempt submission, scoring.
- **`planner.server-fns.ts`**: Study plan item creation, status toggles, deletion.
- **`settings.server-fns.ts`**: Account deletion with OTP verification, user data export.
- **`teacher.server-fns.ts`**: Teacher portal escalation listing, draft saving, response resolution.
- **`admin.server-fns.ts`**: Admin user management, role adjustments, user search.
- **`contact.server-fns.ts`**: Contact form submission with rate limiting and automated responses.
- **`rate-limit.server-fns.ts`**: Rate limit and plan usage inspection.

### REST API Endpoints (`src/routes/api/`)

- **`/api/chat`**: Real-time SSE streaming tutor chat.
- **`/api/mpesa/initiate`**: Safaricom STK push initiation.
- **`/api/mpesa/callback`**: Safaricom M-Pesa payment confirmation webhook.
- **`/api/mpesa/status`**: Polling query for STK push status.
- **`/api/notifications/push-subscribe`**: Web push subscription registration/removal.
- **`/api/notifications/push-send`**: Admin push notification delivery.
- **`/api/newsletter/subscribe`**: Public newsletter subscription.
- **`/api/newsletter/send`**: Admin newsletter blast dispatch.
- **`/api/settings/events`**: Telemetry and audit logging.
