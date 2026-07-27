'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { Brain, Clock, Lock, FileSearch, Sparkles, Calendar, ArrowRight, Shield, MessageSquare, Zap, ChevronRight } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Unified Timeline',
    description: "See everything you've said, read, written, and decided — all in one chronological view across every source.",
    color: 'from-blue-600 to-cyan-500',
    glow: 'shadow-blue-500/20',
  },
  {
    icon: Brain,
    title: 'Long-Term Memory',
    description: 'Your AI classifies each piece of information into working, episodic, or long-term memory — just like a human mind.',
    color: 'from-violet-600 to-purple-500',
    glow: 'shadow-violet-500/20',
  },
  {
    icon: Calendar,
    title: 'Meeting Briefs',
    description: 'Walk into every meeting prepared. Get auto-generated briefs with context, history, and open commitments.',
    color: 'from-emerald-600 to-teal-500',
    glow: 'shadow-emerald-500/20',
  },
  {
    icon: Shield,
    title: 'Privacy Controls',
    description: 'You decide what gets remembered. Edit, delete, or forget any memory instantly. Export everything anytime.',
    color: 'from-amber-600 to-orange-500',
    glow: 'shadow-amber-500/20',
  },
  {
    icon: FileSearch,
    title: 'Source Citations',
    description: 'Every AI answer shows exactly where the information came from — no hallucinations, no black boxes.',
    color: 'from-pink-600 to-rose-500',
    glow: 'shadow-pink-500/20',
  },
  {
    icon: Zap,
    title: 'Daily Intelligence',
    description: 'Start each day with an AI-crafted brief: your schedule, open commitments, and the context you need right now.',
    color: 'from-orange-600 to-red-500',
    glow: 'shadow-orange-500/20',
  },
];

const lifecycleSteps = [
  { icon: '📧', label: 'Sources', sub: 'Email, Calendar, Docs, Browser', color: 'border-blue-500/30 bg-blue-500/5 text-blue-300' },
  { icon: '🤖', label: 'AI Extraction', sub: 'NLP & pattern detection', color: 'border-violet-500/30 bg-violet-500/5 text-violet-300' },
  { icon: '🧠', label: 'Memory Engine', sub: 'Classify & prioritize', color: 'border-purple-500/30 bg-purple-500/5 text-purple-300' },
  { icon: '💾', label: 'Long-Term Store', sub: 'pgvector + hybrid search', color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' },
  { icon: '✨', label: 'AI Answers', sub: 'Cited, accurate, instant', color: 'border-amber-500/30 bg-amber-500/5 text-amber-300' },
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
            Privacy-First AI Memory System
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-300">Beta</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-white">Your AI that</span>
            <br />
            <span className="gradient-text">remembers what matters.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Turn conversations, emails, meetings, documents, and research into private, useful memory.
            <span className="text-slate-300"> Never lose context again.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
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

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center justify-center gap-8 text-xs text-slate-600"
          >
            {['🔒 End-to-end encrypted', '🗑️ Delete anytime', '🏠 On-device processing', '✏️ Edit any memory'].map((item) => (
              <span key={item} className="flex items-center gap-1">{item}</span>
            ))}
          </motion.div>
        </div>

        {/* Hero visual — memory preview cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-3xl mx-auto mt-20"
        >
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">
            {/* Mock browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4 py-1 px-3 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-slate-600 text-center">
                app.personal-ai-memory.io/dashboard/ask
              </div>
            </div>
            {/* Mock chat */}
            <div className="p-6 space-y-4">
              <div className="flex justify-end">
                <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-violet-600/20 border border-violet-500/25 text-sm text-slate-300 max-w-xs">
                  What did I promise Alex about the product launch?
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shrink-0">
                  <Brain size={14} className="text-white" />
                </div>
                <div className="flex-1 p-4 rounded-2xl rounded-tl-sm bg-white/[0.03] border border-white/[0.06] text-sm text-slate-300 leading-relaxed">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-violet-300">Memory AI</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">97% confidence</span>
                  </div>
                  You promised to send Alex a <strong className="text-white">client portal proposal by Friday, July 26</strong>. He's already sent a follow-up — this is overdue.
                  <div className="flex gap-2 mt-3">
                    <span className="text-[10px] px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">✉️ Re: Product Launch</span>
                    <span className="text-[10px] px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">✉️ Follow-up email</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Memory Lifecycle Diagram */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4 block">How It Works</span>
            <h2 className="text-4xl font-bold text-white mb-4">The Memory Lifecycle</h2>
            <p className="text-slate-400 max-w-xl mx-auto">From raw data to intelligent, citable memory — here's how your AI memory system works.</p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
              {lifecycleSteps.map((step, i) => (
                <div key={step.label} className="flex flex-col md:flex-row items-center flex-1 min-w-0">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    viewport={{ once: true }}
                    className={`flex flex-col items-center text-center p-5 rounded-2xl border flex-1 w-full max-w-[180px] ${step.color}`}
                  >
                    <span className="text-3xl mb-3">{step.icon}</span>
                    <p className={`text-sm font-semibold mb-1 ${step.color.includes('blue') ? 'text-blue-300' : step.color.includes('violet') ? 'text-violet-300' : step.color.includes('purple') ? 'text-purple-300' : step.color.includes('emerald') ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {step.label}
                    </p>
                    <p className="text-[11px] text-slate-500">{step.sub}</p>
                  </motion.div>
                  {i < lifecycleSteps.length - 1 && (
                    <div className="flex-none mx-2 md:mx-3 rotate-90 md:rotate-0 text-slate-700">
                      <ArrowRight size={20} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4 block">Features</span>
            <h2 className="text-4xl font-bold text-white mb-4">Everything your memory needs</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Built for knowledge workers who live in a sea of information and need it to actually work for them.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
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
                <h2 className="text-3xl font-bold text-white mb-4">Ready to remember everything?</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  Open the demo dashboard to explore all features with realistic sample data — no setup required.
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
          <p className="text-xs text-slate-700">Privacy-first. Your data stays yours. · Built with Next.js + pgvector</p>
        </div>
      </footer>
    </div>
  );
}
