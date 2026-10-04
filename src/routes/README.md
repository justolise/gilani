# GilaniAI Application Routes (`src/routes/`)

TanStack Start uses **file-based routing**. Every route file in this directory represents either a page, a layout, or a server endpoint.

---

## Route Organization

```
src/routes/
├── __root.tsx                 # Global App Shell (HTML document, metadata, toaster, providers)
├── index.tsx                  # Public Landing Page (/)
│
├── Public & Marketing
│   ├── about.tsx              # About GilaniAI (/about)
│   ├── contact.tsx            # Contact Form & Office Info (/contact)
│   ├── faq.tsx                # Frequently Asked Questions (/faq)
│   ├── privacy.tsx            # Privacy Policy (/privacy)
│   ├── terms.tsx              # Terms of Service (/terms)
│   └── cookies.tsx            # Cookie Policy (/cookies)
│
├── Authentication
│   ├── login.tsx              # Passwordless Email & Google OAuth Login (/login)
│   ├── callback.tsx           # Supabase OAuth redirect handler (/callback)
│   └── verify-email.tsx       # Email verification link confirmation (/verify-email)
│
├── _authenticated.tsx         # Authenticated Layout Shell (Sidebar, MobileNav, LayoutContext)
├── _authenticated/            # Protected Routes (Require active user session)
│   ├── tutor.tsx              # Main Tutor Workspace (/tutor)
│   ├── tutor.$threadId.tsx    # Active Study Session by Thread ID (/tutor/:threadId)
│   ├── tutor.chats.tsx        # Conversation History & Search (/tutor/chats)
│   ├── tutor.documents.tsx    # Notes & Document Summaries (/tutor/documents)
│   ├── tutor.quizzes.tsx      # Quizzes Dashboard (/tutor/quizzes)
│   ├── tutor.quizzes_.$quizId.tsx # Quiz Assessment View (/tutor/quizzes/:quizId)
│   ├── tutor.planner.tsx      # Revision Planner & Schedule (/tutor/planner)
│   ├── tutor.saved.tsx        # Saved Insights & Notes (/tutor/saved)
│   ├── settings.tsx           # User Profile, Plan, Usage & Danger Zone (/settings)
│   ├── teacher/
│   │   └── escalations.tsx    # Teacher Review Portal (/teacher/escalations)
│   └── admin/
│       └── users.tsx          # Admin User Management (/admin/users)
│
└── api/                       # REST & Streaming Endpoints
    ├── chat.ts                # Real-time AI SSE stream (/api/chat)
    ├── mpesa/                 # Safaricom M-Pesa STK push & callbacks (/api/mpesa/*)
    ├── notifications/         # Web Push subscriptions & alerts (/api/notifications/*)
    ├── newsletter/            # Subscriber intake & campaigns (/api/newsletter/*)
    └── settings/events.ts     # Telemetry & event logging (/api/settings/events)
```

---

## Key Conventions

1. **Path Nesting via Dot Notation**:
   - `tutor.documents.tsx` maps to `/tutor/documents`.
   - `tutor.$threadId.tsx` maps to `/tutor/:threadId`.
   - `tutor.quizzes_.$quizId.tsx` uses the underscore (`_`) to break layout nesting while keeping the URL `/tutor/quizzes/:quizId`.

2. **Route Layouts**:
   - `__root.tsx`: The root HTML template that renders for every page.
   - `_authenticated.tsx`: Wraps all protected routes in `_authenticated/` with authentication checks, the side navigation menu, and layout state.

3. **Route Loaders & Data Fetching**:
   - Loaders run before the route renders:
     ```typescript
     export const Route = createFileRoute("/verify-email")({
       loader: async ({ location }) => {
         const token = location.search.token;
         return consumeVerifyToken({ data: { token } });
       },
     });
     ```

4. **Auto-Generated Route Tree**:
   - `routeTree.gen.ts` is automatically managed by the TanStack Router Vite plugin. Never edit it manually.
