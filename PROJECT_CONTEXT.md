# Personal AI Memory — Full Project Context

> Copy this whole file into an AI chat as context. It describes every file, module, API and
> schema in this repository, plus the conventions and known gaps, so a model can reason about
> or modify the project without reading the source first.
>
> Path: `d:\personal-ai-memory` · Framework: Next.js 16 (App Router) · Language: TypeScript
> Last reviewed against the code on disk (all files read directly, nothing inferred).

---

## 0. TL;DR prompt block (paste this if you only want the short version)

```
Project: "Personal AI Memory" — a LOCAL, single-user memory store + a retrieval-grounded Q&A assistant.
Stack: Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui (base-ui), framer-motion.
Storage: node:sqlite (DatabaseSync) single file at data/memory.db (override: MEMORY_DB_DIR). Two tables: memories, commitments.
AI: Groq Chat Completions over plain fetch (lib/ai.ts). Default model openai/gpt-oss-20b. Env: GROQ_API_KEY, GROQ_MODEL, GROQ_BASE_URL.
Core loop: user captures a memory (statement + type/tier/scores/tags) -> stored in SQLite -> Ask Memory does KEYWORD scoring (searchMemoriesDetailed) -> matched rows are injected into the prompt -> the model must answer ONLY from those rows and say when it can't.
Rules: exactly one module (lib/repo.ts) writes SQL; server routes validate enums and clamp numbers; imports never write to long-term memory (they land in tier='inbox' with isVerifiedFact=false, confidence capped 70); 'ignored' tier rows are hidden from every list and from retrieval.
No accounts, no cloud DB, no Gmail/Calendar/browser connectors, no OCR, no embeddings (keyword scoring only), no multi-user.
```

---

## 1. What the product is (and explicitly is not)

A privacy-first personal memory system. The user writes the memories; the assistant only quotes
them back. Everything lives in one SQLite file on the local machine.

**Does**
- Capture memories manually (statement, type, tier, importance 1–5, confidence 0–100, sensitivity, source, tags, "why saved", verified-fact flag).
- Capture commitments (title, owner, due date, status, related project).
- Review an Inbox: approve (→ `long_term`), ignore (→ `ignored`), edit, or delete candidate memories.
- Browse memories by Timeline (grouped by day), People (`type='person'`), Projects (`type='project'`).
- Import pasted text or a file (PDF/TXT/MD/JSON/CSV/LOG/VTT/SRT): the model drafts candidate memories into the Inbox.
- Ask questions grounded in stored rows; the reply returns the memories it used, citations, an average confidence, and an inference warning when nothing matched.
- Export all data as JSON; forget individual memories by text match; delete both tables entirely (typed `DELETE` confirmation).
- Show system info: DB file path, counts, AI provider/model/key-present.

**Explicitly does NOT do** (stated in the UI and README, do not "fix" these as bugs)
- No Gmail/Calendar/browser/third-party account connections or scheduled ingestion.
- No OCR — a scanned PDF with no text layer yields nothing.
- No silent writes to long-term memory — imports always land in the Inbox as drafts.
- No embeddings / vector search — retrieval is keyword overlap scoring.
- No accounts, multi-user workspaces, hosted deployment, mobile apps, daemons, or sync.
- No auto-generated meeting briefs or daily digests.

---

## 2. Tech stack & dependencies

`package.json` (`name: personal-ai-memory`, `version: 0.1.0`, private):

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

Dependencies (as declared):
- `next` **16.2.12**, `react` **19.2.4**, `react-dom` **19.2.4**
- `@base-ui/react` ^1.6.0 — headless UI primitives used by the `components/ui/*` wrappers
- `@google/genai` ^2.13.0 — **declared but never imported anywhere in the repo**
- `@supabase/supabase-js` ^2.110.9 — **declared but never imported anywhere in the repo**
- `class-variance-authority`, `clsx`, `tailwind-merge` — class-name helpers
- `date-fns` ^4.4.0, `framer-motion` ^12.42.2, `lucide-react` ^1.27.0, `shadcn` ^4.15.0
- `tw-animate-css` ^1.4.0, `unpdf` ^1.9.1 (PDF text extraction)

devDependencies: `@tailwindcss/postcss` ^4, `@types/node` ^22.20.5, `@types/react` ^19,
`@types/react-dom` ^19, `eslint` ^9, `eslint-config-next` 16.2.12, `tailwindcss` ^4, `typescript` ^5.

**Important stack notes**
- SQLite comes from the **Node built-in `node:sqlite`** (`DatabaseSync`), not a npm driver. Requires Node 22+ (verified local: Node v22.16.0, npm 11.4.1).
- Tailwind is **v4** (CSS-first). No `tailwind.config.*` file exists; theme lives in `app/globals.css`.
- UI primitives wrap **`@base-ui/react`**, not Radix. The shadcn config uses style `base-nova`.
- `next.config.ts` only sets `turbopack.root = __dirname`.

---

## 3. Directory structure

```
d:\personal-ai-memory
├─ app/
│  ├─ layout.tsx                 # root layout (html dark, Inter font, dark bg)
│  ├─ page.tsx                   # marketing landing page ('use client')
│  ├─ globals.css                # Tailwind v4 import + design tokens + utility classes
│  ├─ favicon.ico
│  ├─ api/
│  │  ├─ chat/route.ts           # POST — grounded Q&A
│  │  ├─ memories/route.ts       # GET list / POST create
│  │  ├─ memories/[id]/route.ts  # PATCH update / DELETE
│  │  ├─ commitments/route.ts    # GET list / POST create
│  │  ├─ commitments/[id]/route.ts # PATCH / DELETE
│  │  ├─ stats/route.ts          # GET counts + dbPath + AI provider info
│  │  ├─ data/route.ts           # GET export / DELETE wipe
│  │  └─ import/route.ts         # POST multipart extract → inbox drafts
│  └─ dashboard/
│     ├─ layout.tsx              # sidebar + topbar shell
│     ├─ page.tsx                # overview dashboard
│     ├─ ask/page.tsx            # chat UI
│     ├─ capture/page.tsx        # memory + commitment forms
│     ├─ commitments/page.tsx    # commitments manager
│     ├─ inbox/page.tsx          # review queue
│     ├─ people/page.tsx         # type='person' filter view
│     ├─ projects/page.tsx       # type='project' filter view + detail pane
│     ├─ settings/page.tsx       # storage / export / forget / wipe
│     ├─ sources/page.tsx        # system info + import UI
│     └─ timeline/page.tsx       # day-grouped list + filters + search
├─ components/
│  ├─ chat/ChatInput.tsx
│  ├─ chat/ChatMessage.tsx
│  ├─ layout/Sidebar.tsx
│  ├─ layout/TopBar.tsx
│  ├─ memory/ConfidenceBadge.tsx
│  ├─ memory/MemoryCard.tsx
│  └─ ui/                         # shadcn/base-ui primitives (see §8 — mostly unused)
├─ lib/
│  ├─ db.ts                      # SQLite connection + schema bootstrap
│  ├─ repo.ts                    # ONLY module that writes SQL
│  ├─ ai.ts                      # Groq client + prompts
│  ├─ client.ts                  # 'use client' fetch hooks + actions
│  ├─ types.ts                   # shared TypeScript types/enums
│  └─ utils.ts                   # cn(), formatters, display config maps
├─ public/                       # default Next SVGs (file/globe/next/vercel/window)
├─ dev.bat                       # Windows launcher (npm install if needed → npm run dev → open browser)
├─ supabase_schema.sql           # LEGACY, unused Postgres schema (see §5 note)
├─ .env.example
├─ .gitignore
├─ AGENTS.md / CLAUDE.md         # CLAUDE.md just `@AGENTS.md`; AGENTS.md = Next.js agent rules
├─ README.md
├─ components.json               # shadcn config
├─ eslint.config.mjs
├─ next.config.ts
├─ postcss.config.mjs
├─ tsconfig.json
└─ package.json / package-lock.json
```

---

## 4. Architecture & data flow

```
Capture form ──POST /api/memories──► lib/repo.createMemory ──► SQLite data/memory.db
                                                                    │
Sources import ──POST /api/import──► lib/ai.extractCandidateFacts ──► drafts (tier='inbox')
                                                                    │
Timeline / People / Projects / Inbox / Commitments / Settings  ◄─────┤ read via lib/client hooks
                                                                    │
Ask Memory ──POST /api/chat──► lib/repo.searchMemoriesDetailed ─────┤
                    │                                              │
                    └──► lib/ai.generateMemoryAnswer (Groq) ◄───────┘  matched rows only
```

Layer responsibilities:
1. **`lib/db.ts`** — owns the connection and schema. Single process-wide singleton.
2. **`lib/repo.ts`** — the only SQL writer. Validates enums, clamps scores, maps rows→typed objects.
3. **`app/api/*/route.ts`** — thin HTTP layer: parse input, call repo/ai, shape JSON, map errors to status codes.
4. **`lib/client.ts`** — browser-side data access: generic `useResource` hook + typed actions.
5. **`app/dashboard/*`** — `'use client'` pages; each owns its own loading/error state via the hooks.
6. **`lib/ai.ts`** — the only outbound network call (Groq). Server-only.

---

## 5. Data model & schema

### 5.1 SQLite schema (authoritative — `lib/db.ts`)

The DB file is `data/memory.db` (dir overridable via `MEMORY_DB_DIR`). Created on first use with
`PRAGMA journal_mode = WAL` and the following `CREATE TABLE IF NOT EXISTS` DDL:

```sql
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  statement TEXT NOT NULL,
  type TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'long_term',
  importance_score INTEGER NOT NULL DEFAULT 3,
  confidence_score INTEGER NOT NULL DEFAULT 90,
  sensitivity_level TEXT NOT NULL DEFAULT 'personal',
  source_type TEXT NOT NULL DEFAULT 'manual',
  why_saved TEXT,
  is_verified_fact INTEGER NOT NULL DEFAULT 1,   -- 0/1 boolean
  tags TEXT NOT NULL DEFAULT '[]',               -- JSON-encoded string array
  created_at TEXT NOT NULL,                      -- ISO string
  updated_at TEXT NOT NULL                       -- ISO string
);
CREATE INDEX IF NOT EXISTS memories_type_idx    ON memories(type);
CREATE INDEX IF NOT EXISTS memories_tier_idx    ON memories(tier);
CREATE INDEX IF NOT EXISTS memories_created_idx ON memories(created_at DESC);

CREATE TABLE IF NOT EXISTS commitments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  owner TEXT NOT NULL DEFAULT 'Me',
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  related_project TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS commitments_status_idx ON commitments(status);
```

### 5.2 Enums / domain values (`lib/types.ts` + exported const arrays in `lib/repo.ts`)

- `MemoryType` = `preference | decision | commitment | person | project | meeting_summary | research_insight | temporary_context`
- `MemoryTier` = `working | episodic | long_term | inbox | ignored`
- `SensitivityLevel` = `public | personal | sensitive | confidential`
- `SourceType` = `email | calendar | document | conversation | browser | manual`
- `CommitmentStatus` = `pending | in_progress | completed | overdue | cancelled`
- `ImportanceLevel` = `1 | 2 | 3 | 4 | 5` (numeric)
- Scores: `confidenceScore` 0–100 (numeric).

`lib/repo.ts` exports `MEMORY_TYPES`, `MEMORY_TIERS`, `SENSITIVITY_LEVELS`, `SOURCE_TYPES`,
`COMMITMENT_STATUSES` as the runtime source of truth used for validation.

### 5.3 TypeScript interfaces (`lib/types.ts`)

- `Memory` — includes computed-on-read fields that are **not columns**: `connectedPeople: string[]` and `connectedProjects: string[]` are always `[]`; `citations: SourceCitation[]` is synthesised from the row (one entry: id `cite-<rowId>`, title = first 80 chars of statement, date = createdAt, excerpt = whySaved, sourceId = sourceType); `expiresAt` is optional and never set.
- `Commitment` — maps 1:1 to its table.
- `ChatMessage` — UI-side message with optional `confidenceScore`, `isFactBased`, `relatedMemories`, `citations`, `inferenceWarning`.
- `SourceCitation` — `{ id, sourceType, title, date, url?, excerpt?, sourceId }`.

Enum vocabularies that the **UI labels but the DB never stores as a separate table**:
`people` and `projects` are **filters over `memory.type`**, not entity tables.

### 5.4 Legacy / dead schema note

`supabase_schema.sql` at the repo root defines Postgres tables (`memories`, `timeline_events`,
`commitments` with `uuid`/`timestamptz`/`text[]`). It is **leftover from an earlier Supabase design
and is not used**: the runtime uses `node:sqlite`, there's no `timeline_events` table anywhere in
code, and `@supabase/supabase-js` is never imported. Treat it as documentation of intent only.

---

## 6. `lib/` module reference

### 6.1 `lib/db.ts`
- Reads `process.env.MEMORY_DB_DIR` or defaults to `<cwd>/data`.
- `getDb(): DatabaseSync` — lazily creates dir, opens `memory.db`, sets WAL, applies schema; returns a cached singleton.
- `dbPath` — exported absolute path string (used by `/api/stats` and Settings/Sources pages).

### 6.2 `lib/repo.ts` (all SQL lives here)

Memory:
- `createMemory(input: MemoryInput): Memory` — requires non-empty `statement`, valid `type`. Defaults: tier `long_term` (only `SELECTABLE_TIERS` = all tiers except `ignored` are accepted), importance `3`, confidence `90`, sensitivity `personal`, source `manual`, `is_verified_fact` 1 unless explicitly `false`, tags stored as JSON. Uses `randomUUID()`.
- `getMemory(id)` / `listMemories(filters)` — filters: `type`, `tier`, `source`, `q` (LIKE `%q%` on statement), `limit` (clamped 1–500, default 200). **If no `tier` filter is given it excludes `tier = 'ignored'`**; ordering `created_at DESC`.
- `updateMemory(id, patch)` — partial update; re-validates enums, falls back to existing values, bumps `updated_at`.
- `deleteMemory(id): boolean` — true if a row was removed.
- `searchMemoriesDetailed(query, limit = 8): ScoredMemory[]` — keyword retrieval (see §6.2.1).
- `searchMemories(query, limit = 8): Memory[]` — thin wrapper returning just the memories.
- `getStats(): Stats` — `total` (excluding ignored), `addedThisWeek` (created_at ≥ 7 days ago), `pendingInbox` (`tier='inbox'`), `verifiedShare` (rounded % of non-ignored rows with `is_verified_fact=1`), `byType`, `bySource` (grouped counts, excluding ignored).

Commitments:
- `createCommitment(input)` — requires non-empty `title`; owner defaults `Me`; status validated else `pending`.
- `getCommitment(id)`, `listCommitments()` — **excludes `status='cancelled'`**, ordered by: not-completed first, then rows with a due date, then `due_date`.
- `updateCommitment(id, { status?, title?, dueDate? })` — `dueDate: null` explicitly clears it.
- `deleteCommitment(id)`.

Helper: `clampInt(value, min, max)` = `Math.max(min, Math.min(max, Math.round(value)))`.

#### 6.2.1 Retrieval algorithm (`searchMemoriesDetailed`)
1. Tokenise the query: lowercase, split on `/[^a-z0-9]+/`, keep tokens with `length > 2` that are not in the `STOPWORDS` set (question words + common English filler).
2. If no tokens remain → return `[]`.
3. Load up to 500 candidate memories (`listMemories({ limit: 500 })`, which excludes ignored).
4. For each candidate: haystack = `statement + tags + whySaved` (lowercased). `matchedTerms` = tokens found as substrings. `score = matchedTerms.length + importanceScore * 0.2 + recencyBoost`, where `recencyBoost = 0.5` if created within the last 7 days.
5. Keep only rows with ≥1 matched term, sort by score desc, take `limit` (default 8).

### 6.3 `lib/ai.ts` (Groq — server-only)
- Constants: `DEFAULT_BASE_URL = https://api.groq.com/openai/v1`, `DEFAULT_MODEL = openai/gpt-oss-20b`.
- `chatCompletion(messages, maxTokens)` — POSTs `{model, max_tokens, messages}` to `${GROQ_BASE_URL}/chat/completions` with `Authorization: Bearer ${GROQ_API_KEY}`. Throws if the key is missing, if `!res.ok` (message includes HTTP status + first 300 chars of body), or if the completion is empty. Returns `{ content, truncated }` where `truncated = finish_reason === 'length'`.
- `aiProviderInfo()` — `{ provider: 'Groq', model, baseUrl, hasApiKey }` (no secrets).
- `generateMemoryAnswer(prompt)` — system instruction + user prompt, `max_tokens: 800`. The system instruction: answer only from the provided stored memories; quote in plain prose (never JSON/arrays/brackets); if the memories don't answer, say so and name the missing detail; be concise.
- `extractCandidateFacts(text)` — extraction prompt demanding a single JSON object `{"memories":[{statement,type,importance,confidence,sensitivity,whySaved,tags}]}` (max 12 items), with rules: only what the text states, self-contained statements, skip greetings/noise, enums fixed. `max_tokens: 2400`. Post-processing is defensive: strips code fences, tries parsing the outermost `{...}` block, and if the array was cut off mid-object it salvages every complete `{...}` it can find. Throws with a "ran out of output space" message when truncated, else "no extractable memories".
- `sliceJson(raw)` — safe `JSON.parse` returning `null` on failure.

### 6.4 `lib/client.ts` (`'use client'`)
- `request<T>(url, init)` — fetch, parse JSON, throw `Error(body.error || \`Request failed (\${status})\`)`.
- `useResource<T>(url)` — generic GET hook with `{ data, loading, error, reload }`; `loading` is true only while there has been no data and no error; keeps previous data on refresh errors.
- Hooks: `useMemories(filter)`, `useCommitments()`, `useStats()` (returns `data.stats`), `useSystemInfo()` (full payload).
- Actions: `exportData()`, `deleteAllData()`, `importSource({text?, file?, sourceType?})`, `createMemory`, `updateMemory`, `deleteMemory`, `createCommitment`, `updateCommitment`.
- Re-exports its own interfaces `Stats`, `SystemInfo`, `MemoryFilter`, `NewMemory`, `DataExport`, `ImportResult`.
- `importSource` posts `FormData` and deliberately does **not** set `Content-Type` (browser sets the multipart boundary).

### 6.5 `lib/utils.ts`
- `cn(...)` — `twMerge(clsx(...))`.
- `formatDate(iso)` → "Mon D, YYYY"; `formatRelativeTime(iso)` → "just now / Xm / Xh / Xd ago / date"; `formatTime(iso)` → hh:mm.
- Display maps: `memoryTypeConfig` (label + text/bg color classes per `MemoryType`), `sourceTypeConfig` (label + emoji + color per `SourceType`), `sensitivityConfig` (label + color + emoji per `SensitivityLevel`).
- `getImportanceColor(score)`, `getConfidenceColor(score)` (≥90 emerald, ≥70 blue, ≥50 amber, else red), `getConfidenceBg(score)`.
- `sleep(ms)`.

---

## 7. API route reference

| Route | Method | Input | Output | Notes |
| :-- | :-- | :-- | :-- | :-- |
| `/api/memories` | GET | query `type`,`tier`,`source`,`q`,`limit` (all validated; invalid enums ignored; `limit` must be `> 0` finite) | `{ memories: Memory[] }` | |
| `/api/memories` | POST | JSON `MemoryInput` | `{ memory }` 201 | errors → 400 |
| `/api/memories/[id]` | PATCH | JSON partial | `{ memory }` | 404 if missing, 400 on bad payload |
| `/api/memories/[id]` | DELETE | — | `{ deleted: id }` | 404 if missing |
| `/api/commitments` | GET | — | `{ commitments }` | cancelled rows excluded |
| `/api/commitments` | POST | JSON | `{ commitment }` 201 | 400 on error |
| `/api/commitments/[id]` | PATCH | JSON partial | `{ commitment }` | 404 / 400 |
| `/api/commitments/[id]` | DELETE | — | `{ deleted: id }` | 404 if missing |
| `/api/stats` | GET | — | `{ stats, databasePath, ai }` | `ai` from `aiProviderInfo()` |
| `/api/data` | GET | — | `{ exportedAt, memories (cap 500, no ignored), commitments }` | |
| `/api/data` | DELETE | — | `{ cleared: true }` | truncates both tables |
| `/api/chat` | POST | JSON `{ prompt }` | `{ content, relatedMemories, citations, confidenceScore, isFactBased, inferenceWarning?, timestamp }` | 400 if prompt empty; 500 on error |
| `/api/import` | POST | multipart `text` and/or `file` (+ optional `sourceType`) | `ImportResult` | 201 when ≥1 imported else 200 |

### 7.1 `/api/chat` behaviour detail
- Requires a non-empty string `prompt`.
- `matches = searchMemoriesDetailed(prompt, 8)`.
- Prompt context lines: `[i] (type, confidence% confidence, matched: term, term) statement` or `None found.`
- Model is asked: `Stored memories:\n<context>\n\nQuestion: <prompt>`.
- `confidenceScore` = rounded average confidence of matched memories (0 when none).
- `isFactBased = memories.length > 0`.
- `inferenceWarning` set only when nothing matched: *"No stored memories matched this question, so the answer is not grounded in your data."*

### 7.2 `/api/import` behaviour detail
Constants: `MAX_FILE_BYTES = 6 MB`, `CHUNK_CHARS = 9000`, `MAX_CHUNKS = 3`,
`TEXT_EXTENSIONS = {txt, md, markdown, json, csv, log, vtt, srt}`.

Flow:
1. Parse `FormData` (400 if not multipart).
2. `readSource`: prefers the uploaded `file`; else uses `text`. No file + empty text → 400 "Nothing to read.".
   - File too large → 413 with MB figure.
   - Filename sanitised (illegal chars → space, capped 120 chars).
   - PDF detected by `.pdf` extension **or** the `%PDF-` magic bytes → extracted with `unpdf.extractText(bytes, { mergePages: true })`, capturing `totalPages`.
   - Text extensions (or no extension) → decoded as UTF-8.
   - Other extensions → 415 listing supported types.
   - Auto-detected source type: `document` for PDF/JSON/CSV else `conversation`; an explicit valid `sourceType` field wins.
3. `cleanText`: normalises newlines, strips control characters, collapses 3+ newlines, trims.
4. Text shorter than 40 chars → 422 (PDF-specific message when it had pages: "no text layer… OCR not supported").
5. Split into up to 3 chunks of 9,000 chars; each chunk → `extractCandidateFacts`.
   - On a chunk error: if nothing imported yet → 502 with the message; otherwise stop early and report `partialError`.
6. `toDraft` validates each model object: statement must be a string, whitespace-collapsed, ≤400 chars, **and ≥20 chars** (else rejected); `type` must be valid else `temporary_context`; `sensitivity` valid else `personal`; `importance` int 1–5 (default 3); **`confidenceScore = min(70, int 0–100 default 55)`**; `whySaved` prefixed `Read from "<label>" — <why>`; tags lowercased, max 6, with `"imported"` always prepended.
7. Dedupe: key = statement lowercased, non-alphanumerics → single spaces, trimmed. Existing memories (up to 500) seed the set; duplicates counted, not stored.
8. Stored rows force `tier: 'inbox'`, `sourceType` from the source, `isVerifiedFact: false`.
9. Response: `{ imported, duplicates, rejected, partialError, source, sourceType, pages, characters, processed }` where `processed = min(characters, chunks*9000)`.

---

## 8. UI reference

### 8.1 Shell
- `app/layout.tsx` — `<html lang="en" className="dark">`, body `antialiased min-h-screen bg-[#080B14] text-slate-100`; metadata/OG set; imports `globals.css`.
- `app/dashboard/layout.tsx` — flex shell: `Sidebar` + column of `TopBar` + scrollable `<main>`.
- `components/layout/Sidebar.tsx` (`'use client'`) — collapsible (72px ↔ 240px, framer-motion width animation). Nav items: Overview `/dashboard`, Capture `/dashboard/capture`, Ask Memory `/dashboard/ask` (badge "AI"), Timeline, Projects, People, Commitments (count = open commitments), Memory Inbox (count = `stats.pendingInbox`), Sources, Privacy & Settings. Also a "Memory Health" card driven by `stats.verifiedShare` and a collapse toggle. Uses `useStats()` + `useCommitments()`.
- `components/layout/TopBar.tsx` (`'use client'`) — global search box (`useMemories({q, limit:6})`, activates at ≥2 chars, dropdown results linking to `/dashboard/timeline`; Enter routes to `/dashboard/timeline?q=`), a notification bell listing overdue commitments + inbox count (computed client-side by comparing `dueDate` to now), and a "Local workspace · SQLite · this machine only" label.

### 8.2 Pages

**`app/page.tsx`** (landing, `'use client'`) — marketing page: hero, "how it works" loop diagram, feature cards mapping to real screens, a "what this build does not do" section, storage facts, CTA, footer. Descriptive only, no data access. Uses framer-motion `useInView` sections.

**`app/dashboard/page.tsx`** (Overview) — uses `useStats`, `useMemories({limit:3})`, `useCommitments`. Renders 4 stat cards (Total, Added this week, Pending inbox, Verified share), a "Needs your attention" panel (inbox items / overdue commitments / added-this-week, each linking to the relevant page, or a green all-clear), a "Memory Health" donut (SVG circle animated to `verifiedShare`), recent memories (via `MemoryCard` with delete) and open commitments. **Overdue is computed in the view from `dueDate` vs start-of-today, never trusted from stored status.**

**`app/dashboard/capture/page.tsx`** — two tabs: `MemoryForm` and `CommitmentForm`.
- Memory form fields: statement (required textarea), type, tier (`long_term | inbox | working | episodic`), sensitivity, source, importance (1–5 buttons), confidence (range 0–100 step 5), tags (comma separated), whySaved, "verified fact" checkbox. On success clears statement/tags/whySaved and shows a confirmation; calls `recent.reload()`.
- Commitment form: title (required), owner (default `Me`), due date (`<input type=date>` → `new Date(...).toISOString()`), related project, status.
- Below: "Most recent captures" (3 items, `MemoryCard compact`).

**`app/dashboard/inbox/page.tsx`** — `useMemories({ tier: 'inbox' })`. Per row: type badge, sensitivity, relative time, statement, "why saved" quote; actions **Approve** (`updateMemory(id,{tier:'long_term'})`), **Edit** (inline textarea → `{statement}`), **Ignore** (`{tier:'ignored'}`), **Delete**. Busy rows dim and disable pointer events; errors show a retry banner.

**`app/dashboard/timeline/page.tsx`** — wrapped in `<Suspense>`; reads `?q=` via `useSearchParams`. Search input is debounced 250 ms; the query is applied **server-side** through `useMemories({type, q})`. Type filter chips are derived from `stats.byType` so only populated types appear; `TYPE_DOT` maps each type to a literal Tailwind bg class (so Tailwind can statically see it). Memories are grouped into day buckets by local start-of-day; headers read Today / Yesterday / weekday+date. Each row shows a colored dot, a vertical connector line (except the last in a day), and a `MemoryCard compact` with delete.

**`app/dashboard/commitments/page.tsx`** — `useCommitments()`. Inline create form; 4 count tiles (Open, Past due, In progress, Completed); client-side text search over title/owner/project/description. Two sections: **Open** (sorted by due date, `∞` for none) and **Completed** (sorted by `updatedAt` desc). Rows use `statusConfig` and action buttons: Start (pending→in_progress), Mark completed, Cancel (→cancelled, which then disappears because the API excludes cancelled), Reopen (completed/cancelled→pending). **Date-only strings are parsed as local midnight** via `dueTime()` to avoid the UTC off-by-one. Overdue is derived from `dueDate` vs start-of-today.

**`app/dashboard/people/page.tsx`** — `useMemories({ type: 'person', q })`, debounced search, delete, an info banner stating a person is just a memory with `type='person'` (no contact book behind it).

**`app/dashboard/projects/page.tsx`** — `useMemories({ type: 'project', q })`. Two-column layout: list (clickable `MemoryCard`s) + a sticky `DetailPane` for the selected row showing type/tier badges, "AI Inference" flag when unverified, statement, importance dots, confidence, sensitivity, source, why-saved, tags, dates, and a two-step "Forget this memory" confirm. Selection is derived from the live list so a deleted row can't linger.

**`app/dashboard/settings/page.tsx`** — `useSystemInfo()`. Sections: **Storage** (db path, contents summary, answer engine + key-present), **Export** (`exportData()` → Blob download `memory-export-<date>.json`), **Find and forget** (fetches the export, filters client-side by statement substring, per-row `deleteMemory`), **Delete everything** (requires typing `DELETE`; `deleteAllData()`).

**`app/dashboard/sources/page.tsx`** — `useSystemInfo()`. Sections: **Local database** (4 stat tiles, file path + copy-to-clipboard), **Memories by source** (bars from `stats.bySource`), **Answer engine** (provider/model/endpoint + key badge), **Import** (textarea + file picker `accept=".pdf,.txt,.md,.markdown,.json,.csv,.log,.vtt,.srt"` + Chat log/Document toggle → `importSource`, then a result card showing counts with a link to the Inbox), and **Still not connected** (honest-gaps note).

**`app/dashboard/ask/page.tsx`** — chat UI. Local `messages` state seeded with one assistant welcome message. `handleSend` POSTs `/api/chat` and builds an assistant message from the payload (or an error message). Shows a "Searching your memories..." typing indicator, `relatedMemories` citations, and — when the store has data — up to 4 suggested questions generated from the most frequent tags plus commitment/inbox hints; otherwise an `EmptyState`. Auto-scrolls to the latest message.

### 8.3 Components

- `components/memory/MemoryCard.tsx` (`'use client'`, props `{ memory, onEdit?, onDelete?, compact? }`) — colored left accent by type, type badge, "AI Inference" badge when `!isVerifiedFact`, sensitivity badge for sensitive/confidential, statement, confidence pill, 5 importance dots, relative time, up to 3 citations (1 when compact) with source emoji + "+N more", a collapsible "why saved" panel, and a full-card delete confirmation overlay.
- `components/memory/ConfidenceBadge.tsx` — pill with dot; label High/Good/Medium/Low by threshold.
- `components/chat/ChatInput.tsx` — auto-growing textarea (max 160px), Enter to send / Shift+Enter newline, spinner while loading.
- `components/chat/ChatMessage.tsx` — user bubbles vs assistant block (avatar, confidence badge, Source Verified / AI Inference chip, inference-warning box, a lightweight inline formatter for `**bold**`, `- ` / emoji-prefixed lines and `> quotes`), citations row, and an expandable related-memories list with optional edit/forget actions.
- `components/ui/empty-state.tsx` — dashed panel with title, hint and a CTA link (defaults to `/dashboard/capture`). **The only `components/ui/*` file actually imported by app code.**

### 8.4 `components/ui/*` — scaffolding status (important)

`avatar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `progress.tsx`,
`scroll-area.tsx`, `select.tsx`, `separator.tsx`, `switch.tsx`, `tabs.tsx`, `textarea.tsx`,
`tooltip.tsx` are shadcn-generated wrappers over `@base-ui/react` (buttons use `cva`). Cross-file
usage is limited to `dialog.tsx` importing `button.tsx`. **Nothing else imports them** — the
dashboard pages build their own markup with Tailwind utility classes instead. They are dormant
scaffolding; do not assume a page uses `Button` just because the component exists.

---

## 9. Styling system

- Tailwind **v4**, configured purely in CSS. `app/globals.css` starts with an Inter Google-Fonts import, then `@import "tailwindcss";`, then:
  - `@layer base` — HSL design tokens under `:root` (dark palette: background `222 47% 5%`, primary violet `262 83% 58%`, `--radius: 0.75rem`), global border-color/box-sizing, body font + `#080B14` background, thin custom scrollbar, violet selection.
  - `@layer utilities` — `.glass` / `.glass-hover` (translucent + blur), `.gradient-text` / `.gradient-text-violet`, `.glow-violet` / `.glow-blue`, `.animated-gradient` (+ `gradientShift`), `.shimmer` (+ keyframes), `.pulse-dot`, `.float`, `.no-scrollbar`.
- Recurring visual language across pages: dark `#080B14` canvas, `glass` cards, `rounded-xl/2xl`, `border-white/[0.06]`, violet→blue gradients for primary actions, colored type/status badges, `lucide-react` icons, framer-motion entrance/exit animations, and skeleton `animate-pulse` placeholders.
- `components.json`: style `base-nova`, `rsc: true`, `tsx: true`, css `app/globals.css`, baseColor `neutral`, cssVariables on, iconLibrary `lucide`, aliases `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, `@/hooks`.

---

## 10. Configuration & environment

`.env.example` (only these matter):

```env
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=openai/gpt-oss-20b
# MEMORY_DB_DIR=D:\personal-ai-memory\data   # optional
```

- `GROQ_API_KEY` is read only by server routes (`lib/ai.ts`); it is never sent to the browser.
- `.gitignore` excludes `/data/` (personal memories), `.env`, `.env*.local`, `/.next/`, `/out/`, `*.tsbuildinfo`, `next-env.d.ts`, and re-includes `!.env.example`.
- `tsconfig.json`: target ES2017, `strict: true`, `noEmit`, `moduleResolution: bundler`, `jsx: react-jsx`, Next plugin, path alias `@/* → ./*`, includes `next-env.d.ts`, `**/*.ts(x)`, `.next/**/types`.
- `eslint.config.mjs`: flat config = `eslint-config-next/core-web-vitals` + `/typescript`, with ignores for `.next/**`, `out/**`, `build/**`, `next-env.d.ts`.
- `next.config.ts`: only `turbopack: { root: __dirname }`.

### Running it
- `npm run dev` → http://localhost:3000 · `npm run build` → prod build · `npm start` → serve build · `npm run lint` → ESLint.
- `dev.bat` (Windows helper, at repo root): checks `npm` exists, runs `npm install` when `node_modules` is missing, prints the URL, opens the default browser, then runs `npm run dev`.
- Entry points: `/` is the marketing landing page; `/dashboard` is the app.

---

## 11. Conventions & invariants (follow these when editing)

1. **One SQL writer.** Any new query goes in `lib/repo.ts`. Routes and pages never touch `getDb()` except `/api/data` (which uses `getDb().exec` for the truncate).
2. **Validate at the boundary.** Enum-typed values are checked against the exported arrays; numeric scores go through `clampInt`. Unknown enum values silently fall back to defaults rather than erroring — except `type`/`statement` on create, which throw.
3. **`ignored` is invisible.** Every list and the retrieval path exclude `tier='ignored'` unless a `tier` filter asks for it explicitly.
4. **Nothing is auto-verified.** Imported candidates are `tier='inbox'`, `isVerifiedFact=false`, confidence capped at 70.
5. **Server does the searching.** Client pages send `q` to the API; the 250 ms debounce only reduces request volume. Don't move filtering into the browser except where it already is (commitments text search, Settings "find and forget", type-filter chips from stats).
6. **Overdue is derived, never stored.** Compare `dueDate` against start-of-today in the view. Treat `YYYY-MM-DD` strings as local midnight (`dueTime` in commitments page).
7. **Every interactive page owns its own loading + error state** through the hooks in `lib/client.ts`; the hooks keep prior data on a failed reload.
8. **Outbound network = Groq only.** Don't add callers that phone home; the app's privacy claims in the UI depend on this.
9. **Copy is deliberately honest.** The landing page, People, Projects, Commitments and Sources pages state what the build does *not* do. Keep that tone; don't add features that would contradict it without updating the copy.
10. **Next.js 16 caveat.** `AGENTS.md`/the workspace rule warns this Next version differs from training data — consult `node_modules/next/dist/docs/` before relying on remembered APIs. Dynamic route `params` are already typed as `Promise<{ id: string }>` and awaited.

---

## 12. Known gaps, dead code and rough edges

- `@google/genai` and `@supabase/supabase-js` are unused dependencies; `supabase_schema.sql` describes a Postgres design that the runtime does not use (no `timeline_events` table exists in SQLite).
- 14 of the 15 `components/ui/*` primitives are unused scaffolding.
- `Memory.connectedPeople`, `connectedProjects`, `expiresAt`, and `SourceCitation.url` are typed but never populated by the repo.
- `SourceCitation` is synthetic: one citation per memory, built from the row itself (there is no citations table).
- Retrieval is substring keyword matching — no stemming, no synonyms, no embeddings; scoring is naive and case-insensitive.
- Import is capped at 3 × 9,000 characters (≈27k chars) per request; larger sources are silently truncated to the first three chunks.
- `listMemories` caps at 500 and `/api/data` export caps at 500 memories; retrieval scans at most 500 rows.
- No authentication or authorization anywhere — it is a local, single-user app; do not expose it publicly.
- No pagination beyond the limits above; no soft-delete (delete is permanent); no undo for the wipe action.
- README says `cp .env.example .env.local` (Unix) — on Windows use `copy .env.example .env.local`.
- `deleteMemory` on the Overview page reloads the list in a `finally`, so a failed delete just leaves the row.

---

## 13. File-by-file quick index

| File | Role |
| :-- | :-- |
| `app/layout.tsx` | Root HTML/body, fonts, metadata |
| `app/page.tsx` | Marketing landing page (client) |
| `app/globals.css` | Tailwind v4 import, tokens, utility classes |
| `app/api/chat/route.ts` | POST grounded Q&A (retrieval + Groq) |
| `app/api/memories/route.ts` | GET list (filters) / POST create |
| `app/api/memories/[id]/route.ts` | PATCH / DELETE one memory |
| `app/api/commitments/route.ts` | GET / POST commitments |
| `app/api/commitments/[id]/route.ts` | PATCH / DELETE one commitment |
| `app/api/stats/route.ts` | Counts + dbPath + AI info |
| `app/api/data/route.ts` | Export JSON / wipe tables |
| `app/api/import/route.ts` | File/text → model → inbox drafts |
| `app/dashboard/layout.tsx` | Sidebar + TopBar shell |
| `app/dashboard/page.tsx` | Overview dashboard |
| `app/dashboard/ask/page.tsx` | Chat interface |
| `app/dashboard/capture/page.tsx` | Memory + commitment forms |
| `app/dashboard/commitments/page.tsx` | Commitment manager |
| `app/dashboard/inbox/page.tsx` | Review queue (approve/ignore/edit/delete) |
| `app/dashboard/people/page.tsx` | `type='person'` view |
| `app/dashboard/projects/page.tsx` | `type='project'` view + detail pane |
| `app/dashboard/settings/page.tsx` | Storage / export / forget / wipe |
| `app/dashboard/sources/page.tsx` | System info + import UI |
| `app/dashboard/timeline/page.tsx` | Day-grouped list, filters, search |
| `components/layout/Sidebar.tsx` | Collapsible nav + counts + health |
| `components/layout/TopBar.tsx` | Global search + notifications |
| `components/memory/MemoryCard.tsx` | Memory row/card renderer |
| `components/memory/ConfidenceBadge.tsx` | Confidence pill |
| `components/chat/ChatInput.tsx` | Auto-growing composer |
| `components/chat/ChatMessage.tsx` | Chat bubble + citations + related memories |
| `components/ui/empty-state.tsx` | Shared empty-state CTA (only used ui file) |
| `components/ui/*` (other 14) | Unused base-ui/shadcn primitives |
| `lib/db.ts` | SQLite singleton + schema |
| `lib/repo.ts` | All SQL, validation, retrieval, stats |
| `lib/ai.ts` | Groq chat + extraction prompts |
| `lib/client.ts` | Client hooks + typed actions |
| `lib/types.ts` | Shared types/enums |
| `lib/utils.ts` | `cn`, formatters, display maps |
| `dev.bat` | Windows dev launcher |
| `supabase_schema.sql` | Legacy unused Postgres schema |
| `.env.example` | Env template (Groq, MEMORY_DB_DIR) |
