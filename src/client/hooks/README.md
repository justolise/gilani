# Client Hooks (`src/client/hooks/`)

This directory houses the foundational, cross-cutting React hooks used across the Gilani application.

---

## Global Hooks Directory

| Hook                         | File                                                                                            | Purpose                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `useAuth()`                  | [`use-auth.ts`](file:///home/elly/projects/gilani/src/client/hooks/use-auth.ts)                 | Current user session, user profile, role flags (`isTeacher`, `isAdmin`, `isStudent`), sign-in, and sign-out helpers.   |
| `useThreadsQuery()`          | [`useThreadsQuery.ts`](file:///home/elly/projects/gilani/src/client/hooks/useThreadsQuery.ts)   | Fetches the user's study session threads and sets up real-time Supabase subscriptions.                                 |
| `useMessagesQuery(threadId)` | [`useMessagesQuery.ts`](file:///home/elly/projects/gilani/src/client/hooks/useMessagesQuery.ts) | Fetches conversation messages for a specific thread with optimistic updates.                                           |
| `useIsMobile()`              | [`use-mobile.tsx`](file:///home/elly/projects/gilani/src/client/hooks/use-mobile.tsx)           | Detects whether the current viewport width is below the mobile breakpoint (< 768px).                                   |
| `useMediaQuery(query)`       | [`useMediaQuery.ts`](file:///home/elly/projects/gilani/src/client/hooks/useMediaQuery.ts)       | Generic CSS media query observer.                                                                                      |
| `useBackButton(handler)`     | [`useBackButton.ts`](file:///home/elly/projects/gilani/src/client/hooks/useBackButton.ts)       | Intercepts mobile browser / Android hardware back button events to close open modals or sheets before navigating away. |

---

## Feature-Specific Hooks

Domain-specific hooks are colocated with their feature components to keep the code modular and self-contained:

- **Tutor & Chat**: `src/client/components/tutor/hooks/`
  - `useTutorChat`: Orchestrates the AI chat stream, input state, tools, and message reactions.
  - `useComposer`: Manages the text input composer, attachments, and keyboard shortcuts.
  - `useEscalationChatState`: Handles teacher review escalation state within a chat.
  - `useRateLimitState`: Monitors message quota and rate limits.

- **Layout & Navigation**: `src/client/components/layout/hooks/`
  - `useAuthedShell`: Coordinates sidebar state, modals, and thread management in the authenticated shell.
  - `useEscalation`: Global escalation notifications and teacher review actions.
  - `useThreadActions`: Delete and rename handlers for study session threads.

- **Settings**: `src/client/components/settings/hooks/`
  - `useSettings`: Manages profile editing, notification preferences, and danger zone actions.

- **Teacher Portal**: `src/client/components/teacher/hooks/`
  - `useTeacherEscalations`: Manages teacher escalation queues, draft answers, and review resolutions.
