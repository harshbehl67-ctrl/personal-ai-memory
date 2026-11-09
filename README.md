# Personal AI Memory System

A local memory store you fill yourself, plus an assistant that answers only from what is stored and shows which rows it used.

Everything lives in one SQLite file on your machine. There are no accounts, no cloud database, and no email/calendar/browser importers.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then put your Groq key in it
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to **Capture**, and save your first memory. The store starts empty — there is no sample data to browse.

`npm run build` and `npm run lint` both pass; `npx tsc --noEmit` is clean.

---

## How it works

```
you ──> /dashboard/capture ──> POST /api/memories ──> lib/repo.ts ──> data/memory.db
                                                                        │
/dashboard/sources ──> POST /api/import ──> Groq extraction ──> drafts at tier 'inbox'
                                                                        │
/dashboard/timeline · people · projects · inbox · commitments  <───────┤
                                                                        │
/dashboard/ask ──> POST /api/chat ──> searchMemoriesDetailed() ─────────┤
                            │                                           │
                            └──> Groq chat completion, prompted with the
                                 matching rows only  <──────────────────┘
```

- **Storage** — `lib/db.ts` opens `data/memory.db` with `node:sqlite` (`DatabaseSync`), sets WAL mode and creates the schema on first use. Override the directory with `MEMORY_DB_DIR`.
- **Data access** — `lib/repo.ts` is the only module that writes SQL. It validates enums (type, tier, sensitivity, source, status), clamps scores, and maps rows to the types in `lib/types.ts`.
- **Retrieval** — `searchMemoriesDetailed()` scores stored statements, tags and "why saved" text by keyword overlap, ignoring question words, and keeps only rows with at least one substantive match. Recency and importance nudge the ordering.
- **Answering** — `app/api/chat/route.ts` injects the matched rows into the prompt (`lib/ai.ts`) and returns the reply together with `relatedMemories`, `citations`, a confidence average, and an `inferenceWarning` when nothing matched. The system instruction tells the model to refuse instead of guessing.
- **Importing** — `app/api/import/route.ts` accepts pasted text or one file (PDF via `unpdf`, plus TXT/MD/JSON/CSV/LOG/VTT/SRT as UTF-8), sends at most three 9,000-character blocks to the model, then validates, dedupes and stores each candidate at `tier = 'inbox'` with `isVerifiedFact: false` and confidence capped at 70. Bytes are decoded in memory; no upload is written to disk.

One table for memories, one for commitments. `people` and `projects` are **filters over the memory type column**, not separate entity tables. The inbox is `tier = 'inbox'`: approving moves a row to `long_term`, ignoring sets `tier = 'ignored'`, which hides it from every list and from retrieval.

## Routes

| Route | Purpose |
| :--- | :--- |
| `GET/POST /api/memories` | list with `type`/`tier`/`source`/`q`/`limit` filters, create |
| `PATCH/DELETE /api/memories/[id]` | edit, promote, ignore, delete |
| `GET/POST /api/commitments` · `PATCH/DELETE /api/commitments/[id]` | commitments; overdue is computed from `dueDate` at read time |
| `GET /api/stats` | counts, verified share, per-type and per-source totals, database path, non-secret AI provider info |
| `GET/DELETE /api/data` | JSON export (500 memory cap, excludes ignored) and wipe both tables |
| `POST /api/chat` | grounded question answering |
| `POST /api/import` | multipart `text` and/or `file` (+ optional `sourceType`) → candidate memories at `tier = 'inbox'` |

Client pages stay `'use client'` and read through the hooks in `lib/client.ts` (`useMemories`, `useCommitments`, `useStats`, `useSystemInfo` plus the create/update/delete actions), so each page owns its loading and error state.

## Configuration

Only two variables matter:

```env
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=openai/gpt-oss-20b          # optional, this is the default
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

The key is read by server routes only and never reaches the browser. `.env*.local` is gitignored, and `data/` is gitignored so your memories are never committed.

## What this build does not do

- No account connections: nothing reads Gmail, Calendar, documents or browser history on a schedule, and no third-party credentials live on this machine.
- No silent writes. Anything the extractor produces lands in the Inbox as a draft with `isVerifiedFact: false`; you approve it before the answer engine can see it.
- No OCR. A scanned PDF without a text layer returns no candidates, and the import says so.
- No auto-generated meeting briefs or daily digests.
- No accounts, multi-user workspaces, or hosted deployment. The Groq call is the only request that leaves the machine, and it carries either the memory rows an answer needs or the source text you chose to import.
- Vector/embedding search is keyword scoring, not semantic search.

## Scripts

| Command | Does |
| :--- | :--- |
| `npm run dev` | start on http://localhost:3000 |
| `npm run build` | production build |
| `npm start` | serve the built app |
| `npm run lint` | ESLint (`eslint-config-next`) |
