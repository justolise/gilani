# Shared Codebase (`src/shared/`)

This directory contains universal types, constants, and utilities that are safe to import in **both client-side and server-side code**.

> ⚠️ **Rule of Thumb**: Code in `src/shared/` must never import node-only or server-only packages (like `fs`, `node:crypto`, or `@/server`). It must remain portable and environment-agnostic.

---

## Directory Structure

```
src/shared/
├── plans.ts                   # Subscription plans (free, pro), limits, token pricing
│
├── constants/
│   └── curricula.ts           # Supported curriculum structures (CBC, 8-4-4, IGCSE, IB)
│
├── auth/
│   └── auth-attacher.ts       # Utility to attach authentication headers
│
├── types/
│   ├── supabase.ts            # Generated Supabase database schema types
│   └── smiles-drawer.d.ts     # Typings for chemical SMILES rendering library
│
└── utils/
    ├── utils.ts               # CSS class merger `cn(...)` (clsx + tailwind-merge)
    ├── async.ts               # Async helpers: `friendlyError()`, `delay()`, `safePromise()`
    ├── chunk-reload.ts        # Handles Vite dynamic import errors after deployments
    ├── document-parser.ts     # In-browser text extraction from PDF, DOCX, and TXT files
    ├── provider-backoff.ts    # Jittered exponential backoff for AI model retries
    ├── tutor-prompt.ts        # System prompts and CBC Kenyan curriculum guidelines
    ├── export-utils.ts        # Browser file download helpers (JSON, Markdown, CSV)
    ├── cookies.ts             # Safe cookie string parsing
    └── pending-message.ts     # Preserves guest draft messages across the login redirect
```

---

## Key Modules

### 1. Subscription Plans (`plans.ts`)

Defines the single source of truth for all plan limits, pricing, and token calculations:

- `PLANS`: Detailed metadata for `free` and `pro` tiers.
- `getPlanLimits(planId)`: Returns daily message caps, maximum upload sizes, and note quotas.
- `TOPUP_TOKENS_PER_KES`: Conversion rate for M-Pesa token top-ups.

### 2. Curricula (`constants/curricula.ts`)

Defines the educational levels, subjects, and topics for the Kenyan CBC curriculum (Junior School, Senior School), 8-4-4 system, and international curricula (Cambridge IGCSE).

### 3. Utility Helpers (`utils/`)

- **`cn(...)`** in `utils.ts`: The canonical utility for conditionally merging Tailwind CSS class names.
- **`friendlyError(err, fallback)`** in `async.ts`: Extracts user-friendly error messages from Error objects, Supabase responses, or API failures without exposing internal stack traces.
- **`documentParser`** in `document-parser.ts`: Client-side extractor capable of reading text directly from student-uploaded `.pdf`, `.docx`, or `.txt` notes before sending them to the server for chunking and summarization.
