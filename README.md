# Personal AI Memory System

> A privacy-first AI assistant that remembers meaningful user context across conversations, email, calendar, documents, and browsing history.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)

---

## 🌟 GitHub Repository Setup for @harshbehl67-ctrl

To upload and connect this repository directly to your GitHub profile ([@harshbehl67-ctrl](https://github.com/harshbehl67-ctrl)):

### 1. Create a New Repository on GitHub
1. Go to [https://github.com/new](https://github.com/new).
2. Set **Repository name**: `personal-ai-memory`.
3. Set **Visibility**: Public or Private.
4. Leave "Add a README file", ".gitignore", and "License" unchecked (we already have them generated).
5. Click **Create repository**.

### 2. Push Local Code to GitHub
Run the following commands in your terminal inside the `personal-ai-memory` folder:

```bash
cd c:\Users\Lenovo\Downloads\personal-ai-memory

# Set main branch
git branch -M main

# Add remote origin
git remote add origin https://github.com/harshbehl67-ctrl/personal-ai-memory.git

# Push all files to GitHub
git push -u origin main
```

---

## 🛠️ Production Requirements & Roadmap

To transition this application from a local demo into a live production backend SaaS with real-time integrations, you will need the following infrastructure and API credentials:

### 1. Environment Variables Configuration (`.env.local`)

Create a `.env.local` file in your root folder:

```env
# AI Model Provider API Key (OpenAI / Anthropic / Google Gemini)
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
# OR
GEMINI_API_KEY=your-gemini-api-key-here

# Vector Database (Supabase PostgreSQL + pgvector OR Pinecone)
POSTGRES_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
# OR
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_ENVIRONMENT=us-east-1

# OAuth Integrations (Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret-key-32-chars
NEXTAUTH_URL=http://localhost:3000

# NextAuth / Auth.js Provider
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
```

---

### 2. Required External Services & API Keys

| Service | Purpose | Recommended Free Tier Provider |
| :--- | :--- | :--- |
| **LLM & Embeddings** | Extract memories, classify tiers, answer queries with citations | [OpenAI API](https://platform.openai.com) (`text-embedding-3-small` + `gpt-4o-mini`) or [Google AI Studio](https://aistudio.google.com) |
| **Vector Storage** | Vector search + Hybrid BM25 retrieval for long-term memory | [Supabase pgvector](https://supabase.com) (Free tier) or [Pinecone Serverless](https://pinecone.io) |
| **Authentication & OAuth** | Secure user login + Google/Microsoft login for email & calendar sync | [Auth.js / NextAuth](https://next-auth.js.org) + [Google Cloud Console Credentials](https://console.cloud.google.com) |
| **Email & Calendar Sync** | Read user emails, sync calendar events, extract action items | Google Workspace APIs (Gmail API & Google Calendar API) |
| **Hosting & Deployment** | Global CDN serverless hosting for Next.js 15 | [Vercel](https://vercel.com) (One-click deployment from GitHub) |

---

## 🚀 One-Click Production Deployment to Vercel

1. Push your repository to your GitHub account (`https://github.com/harshbehl67-ctrl/personal-ai-memory`).
2. Log into [Vercel](https://vercel.com) with GitHub.
3. Click **Add New** → **Project**.
4. Select `personal-ai-memory` from your GitHub repositories.
5. Add your environment variables (from `.env.local`).
6. Click **Deploy**. Vercel will build and assign a free `.vercel.app` HTTPS domain automatically!

---

## 💻 Local Development Setup

```bash
# Clone repository
git clone https://github.com/harshbehl67-ctrl/personal-ai-memory.git

# Navigate into directory
cd personal-ai-memory

# Install dependencies
npm install

# Start local server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 🛡️ License

MIT License. Created for [@harshbehl67-ctrl](https://github.com/harshbehl67-ctrl).
