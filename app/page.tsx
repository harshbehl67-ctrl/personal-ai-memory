'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Brain, CheckSquare, ChevronRight, Clock, Database, Download,
  HardDrive, Inbox, MessageSquare, Plus, Search, Sparkles, Unlink, Users, X,
} from 'lucide-react';

type Feature = {
  icon: typeof Brain;
  title: string;
  description: string;
  color: string;
  glow: string;
};

// Each card describes a screen that exists in this build, using the wording of that screen.
const features: Feature[] = [
  {
    icon: Plus,
    title: 'Capture, not import',
    description:
      'Every memory is a statement you wrote: type, store tier, importance 1 to 5, confidence 0 to 100, sensitivity, tags, why it was saved and whether it is a verified fact. Commitments are captured here too.',
    color: 'from-violet-600 to-purple-500',
    glow: 'shadow-violet-500/20',
  },
  {
    icon: Inbox,
    title: 'Memory Inbox',
    description:
      'Rows saved with the inbox tier wait here. Approve promotes one to long-term memory. Ignore sets the ignored tier, which hides the row from every list and from the assistant.',
    color: 'from-amber-600 to-orange-500',
    glow: 'shadow-amber-500/20',
  },
  {
    icon: Clock,
    title: 'Timeline',
    description:
      'Stored memories grouped by the day they were captured, newest first. Keyword search runs on the server after a short debounce, and type filter chips only appear for types that have rows.',
    color: 'from-blue-600 to-cyan-500',
    glow: 'shadow-blue-500/20',
  },
  {
    icon: CheckSquare,
    title: 'Commitments',
    description:
      'Real rows with owner, due date and related project. Past-due is derived by comparing each due date against today, and start, complete, cancel and reopen each write the row back.',
    color: 'from-emerald-600 to-teal-500',
    glow: 'shadow-emerald-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Ask Memory',
    description:
      'The answer is grounded in the memories a keyword search just matched. When nothing in the store answers your question, the assistant is instructed to say so and name the missing detail.',
    color: 'from-pink-600 to-rose-500',
    glow: 'shadow-pink-500/20',
  },
  {
    icon: Users,
    title: 'People and Projects views',
    description:
      'Both pages are the same store filtered to memories typed person or project. There is no contact graph, no synced org data and no milestone table behind them.',
    color: 'from-cyan-600 to-sky-500',
    glow: 'shadow-cyan-500/20',
  },
  {
    icon: Database,
    title: 'Sources page',
    description:
      'Reports what feeds the store right now, counted straight from the database, and lets you import a chat log or a '
      + 'PDF, TXT, MD, JSON or CSV file. The model drafts candidate memories from it, which wait in the Inbox for you to approve.',
    color: 'from-teal-600 to-emerald-500',
    glow: 'shadow-teal-500/20',
  },
  {
    icon: HardDrive,
    title: 'One local file',
    description:
      'Memories and commitments are stored by node:sqlite in data/memory.db on your own machine, overridable with MEMORY_DB_DIR. No accounts, no cloud database, no telemetry.',
    color: 'from-slate-600 to-slate-500',
    glow: 'shadow-slate-500/20',
  },
  {
    icon: Download,
    title: 'Export and forget',
    description:
      'Settings shows the database path, downloads your memories and commitments as JSON, forgets individual memories matched by text, or empties both tables after a typed confirmation.',
    color: 'from-orange-600 to-red-500',
    glow: 'shadow-orange-500/20',
  },
];

const loopSteps = [
  { icon: '✍️', label: 'You capture', sub: 'Type a statement, or paste a chat log or file for the model to draft', color: 'border-violet-500/30 bg-violet-500/5', accent: 'text-violet-300' },
  { icon: '💾', label: 'Local store', sub: 'SQLite rows in data/memory.db', color: 'border-emerald-500/30 bg-emerald-500/5', accent: 'text-emerald-300' },
  { icon: '🔎', label: 'Keyword match', sub: 'Stored statements, tags and reasons scored', color: 'border-blue-500/30 bg-blue-500/5', accent: 'text-blue-300' },
  { icon: '🧠', label: 'Grounded prompt', sub: 'Matches injected into the model', color: 'border-purple-500/30 bg-purple-500/5', accent: 'text-purple-300' },
  { icon: '🔗', label: 'Cited answer', sub: 'Reply lists the memories it used', color: 'border-amber-500/30 bg-amber-500/5', accent: 'text-amber-300' },
];

// Stated plainly, because the product does not do these things.
const notConnected = [
  'Gmail, Calendar or any third-party account connection',
  'Browser history ingestion, extensions or watchers',
  'OCR, so a scanned PDF with no text layer returns nothing',
  'Anything written straight into long-term memory: imports land in the Inbox as drafts',
  'Auto-generated meeting briefs or daily digests',
  'Account credentials of any kind stored on this machine',
  'Team, shared or multi-user workspaces',
  'Mobile apps, background daemons or sync jobs',
];

const storageFacts = [
  { label: 'Database', value: 'data/memory.db · override with MEMORY_DB_DIR' },
  { label: 'Tables', value: 'memories and commitments, created on first run' },
  { label: 'Writes', value: 'Only from actions you take: capture, edit, approve, ignore, status changes and deletes' },
  { label: 'Imports', value: 'Pasted text and PDF / TXT / MD / JSON / CSV parsed in memory, never saved to disk' },
  { label: 'Answer engine', value: 'Groq chat completions · default model openai/gpt-oss-20b, set via GROQ_MODEL' },
  { label: 'API key', value: 'GROQ_API_KEY in .env.local, read by server routes only' },
  { label: 'Over the network', value: 'Your question plus the memory text that matched it, sent to that endpoint' },
];

const mockFields = [
  { k: 'Type', v: 'Preference' },
  { k: 'Store as', v: 'Long-term memory' },
  { k: 'Sensitivity', v: 'Personal' },
  { k: 'Source', v: 'Manual' },
];

const mockFlow = [
  { icon: Inbox, label: 'Review', text: 'Anything you saved with the inbox tier waits here until you approve or ignore it.' },
  { icon: Search, label: 'Retrieve', text: 'Your question is scored against stored statements, tags and reasons to pick the top matches.' },
  { icon: MessageSquare, label: 'Answer', text: 'The reply is written from those matches and lists the memories it used.' },
];

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080B14] overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 h-16 flex items-center justify-between border-b border-white/[0.06] bg-[#080B14]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Personal AI Memory</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[10px] font-medium text-slate-400">
            <HardDrive size={11} className="text-emerald-400" />
            Local SQLite build
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-blue-500 rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-200 hover:scale-[1.02]"
          >
            Open Dashboard
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-violet-600/20 via-blue-600/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-violet-700/10 rounded-full blur-3xl" />
          <div className="absolute top-60 right-1/4 w-[300px] h-[300px] bg-blue-700/10 rounded-full blur-3xl" />

          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '64px 64px'
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-dot" />
            Retrieval-grounded memory · stored on your machine
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-white">You write the memory.</span>
            <br />
            <span className="gradient-text">The AI only quotes it back.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A local database of everything you deliberately capture, plus an assistant that answers
            <span className="text-slate-300"> only from those stored rows</span> and shows which ones it used.
            No sync, no importers, no invented context.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link
              href="/dashboard"
              className="group flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-500 rounded-2xl hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02]"
            >
              <Brain size={18} />
              Open Memory Dashboard
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-300 bg-white/[0.04] border border-white/[0.08] rounded-2xl hover:bg-white/[0.07] hover:text-white hover:border-white/[0.14] transition-all duration-200"
            >
              See How It Works
              <ChevronRight size={16} />
            </button>
          </motion.div>

          {/* Trust signals — each one is a fact about this build */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-600"
          >
            {[
              '🗄️ One SQLite file you own',
              '✍️ You capture every memory',
              '🔗 Replies cite stored rows',
              '🗑️ Export or delete anytime',
            ].map((item) => (
              <span key={item} className="flex items-center gap-1">{item}</span>
            ))}
          </motion.div>
        </div>

        {/* Hero visual — an illustrative sketch of the real capture and grounded-answer loop */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-4xl mx-auto mt-20"
        >
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">
            {/* Window bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4 py-1 px-3 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-slate-600 text-center">
                localhost:3000/dashboard/capture
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Capture form sketch, with the real field defaults */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Plus size={14} className="text-violet-400" />
                  <p className="text-xs font-semibold text-white">Capture · new memory</p>
                </div>
                <p className="text-[10px] uppercase tracking-wide text-slate-600 font-medium mb-1">Statement</p>
                <div className="rounded-lg border border-dashed border-white/[0.12] px-3 py-3 text-xs text-slate-500 mb-3">
                  Text you write yourself — the store starts empty
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {mockFields.map((field) => (
                    <div key={field.k} className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-2.5 py-2">
                      <p className="text-[9px] uppercase tracking-wide text-slate-600">{field.k}</p>
                      <p className="text-[11px] text-slate-300">{field.v}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 mb-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-slate-600 mb-1">Importance · 1 to 5</p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <div
                          key={value}
                          className={`flex-1 py-1.5 rounded text-center text-[10px] font-bold ${
                            value <= 3 ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/[0.03] text-slate-600 border border-white/[0.06]'
                          }`}
                        >
                          {value}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-slate-600 mb-1">Confidence · 0 to 100</p>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-violet-500 to-blue-500" />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tags, a note on why it was saved, and a verified-fact toggle are stored with it.
                </p>
              </div>

              {/* The ask loop, described rather than simulated */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={14} className="text-violet-400" />
                  <p className="text-xs font-semibold text-white">Ask Memory · the loop</p>
                </div>
                <div className="flex justify-end mb-3">
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-tr-sm bg-violet-600/20 border border-violet-500/25 text-xs text-slate-300 max-w-[85%]">
                    A question about something you already captured
                  </div>
                </div>
                <div className="space-y-2.5 flex-1">
                  {mockFlow.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.label} className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={12} className="text-violet-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-slate-200">{step.label}</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{step.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] uppercase tracking-wide text-slate-600 font-medium mt-4 mb-1.5">
                  Each citation carries
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['the stored statement', 'why you saved it', 'the capture date'].map((chip) => (
                    <span key={chip} className="text-[10px] px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
                      {chip}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 mt-3 leading-relaxed">
                  If no stored memory answers the question, the assistant says so and names what is missing
                  instead of guessing.
                </p>
              </div>
            </div>

            <p className="px-6 pb-5 text-[11px] text-slate-600 text-center leading-relaxed">
              Illustrative sketch of the capture and answer loop in this build. Field values shown are form
              defaults, not sample records, and every row you see in the app is one you captured.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Memory Lifecycle Diagram */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4 block">How It Works</span>
            <h2 className="text-4xl font-bold text-white mb-4">The real loop</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Capture, keyword retrieval and a single model call. That is the whole pipeline.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
              {loopSteps.map((step, i) => (
                <div key={step.label} className="flex flex-col md:flex-row items-center flex-1 min-w-0">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    viewport={{ once: true }}
                    className={`flex flex-col items-center text-center p-5 rounded-2xl border flex-1 w-full max-w-[190px] ${step.color}`}
                  >
                    <span className="text-3xl mb-3">{step.icon}</span>
                    <p className={`text-sm font-semibold mb-1 ${step.accent}`}>{step.label}</p>
                    <p className="text-[11px] text-slate-500">{step.sub}</p>
                  </motion.div>
                  {i < loopSteps.length - 1 && (
                    <div className="flex-none mx-2 md:mx-3 rotate-90 md:rotate-0 text-slate-700">
                      <ArrowRight size={20} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection className="mt-10">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <HardDrive size={15} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Where the data lives</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {storageFacts.map((fact) => (
                  <div key={fact.label} className="flex items-start gap-3">
                    <span className="text-[10px] uppercase tracking-wide text-slate-600 font-medium w-28 shrink-0 pt-0.5">
                      {fact.label}
                    </span>
                    <span className="text-xs text-slate-400 leading-relaxed">{fact.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4 block">Screens</span>
            <h2 className="text-4xl font-bold text-white mb-4">What is actually in the app</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every card below maps to a screen in the sidebar that reads or writes rows in your local
              database. Nothing here is simulated, and no screen talks to a third-party account.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  className="group relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.025] hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 cursor-default overflow-hidden"
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.color} opacity-[0.03]`} />
                  <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} items-center justify-center mb-4 shadow-lg ${feature.glow}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Honest gaps */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-6 md:p-8">
              <div className="flex items-center gap-2 mb-2">
                <Unlink size={16} className="text-amber-400" />
                <h2 className="text-xl font-bold text-amber-100">What this build does not do</h2>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                These are advertised by memory tools that pull from your accounts. Nothing here connects to
                anything, so a memory exists only after you capture it.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {notConnected.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                    <X size={13} className="text-amber-400/80 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-start gap-2 mt-6 pt-5 border-t border-amber-500/15 text-[11px] text-slate-500 leading-relaxed">
                <Sparkles size={12} className="text-violet-400 mt-0.5 shrink-0" />
                <span>
                  The single outbound request is the Groq call that turns your matched memories into an answer
                  text. Storage, search, review, export and deletion never leave the machine.
                </span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <AnimatedSection>
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative p-12 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-blue-500/[0.05] overflow-hidden">
              <div className="absolute inset-0 animated-gradient opacity-50" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/30 float">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Start with an empty store</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  There is no sample data to browse. Open the dashboard, capture the first memory you want to
                  keep, then ask the assistant about it and read which row it answered from.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-500 rounded-2xl hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02]"
                >
                  <Sparkles size={18} />
                  Open Memory Dashboard
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
              <Brain size={12} className="text-white" />
            </div>
            <span className="text-sm text-slate-500">Personal AI Memory System</span>
          </div>
          <p className="text-xs text-slate-700">Local SQLite store · keyword retrieval with grounded answers · Built with Next.js</p>
        </div>
      </footer>
    </div>
  );
}
