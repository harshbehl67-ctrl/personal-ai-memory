'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Brain, Clock, CheckSquare, Inbox, AlertTriangle, TrendingUp,
  ChevronRight, Plus, MessageSquare, ShieldCheck, Database, Sparkles,
} from 'lucide-react';
import type { Commitment } from '@/lib/types';
import { cn, formatDate, sourceTypeConfig } from '@/lib/utils';
import { useMemories, useCommitments, useStats, deleteMemory } from '@/lib/client';
import MemoryCard from '@/components/memory/MemoryCard';
import EmptyState from '@/components/ui/empty-state';

// ---- Small presentational helpers (module scope, no state) ----

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-white/[0.05]', className)} />;
}

function ErrorNote({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3">
      <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
      <p className="text-xs text-red-300 leading-relaxed">{message}</p>
    </div>
  );
}

function SectionError({ label, message }: { label: string; message: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-red-400/80 uppercase tracking-wide mb-1.5">{label}</p>
      <ErrorNote message={message} />
    </div>
  );
}

// Overdue is computed in the view from dueDate vs today (not trusted from stored status).
function makeIsOverdue() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return (c: Commitment): boolean => {
    if (c.status === 'completed' || c.status === 'cancelled') return false;
    if (!c.dueDate) return false;
    return new Date(c.dueDate).getTime() < startOfToday.getTime();
  };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default function DashboardPage() {
  const statsR = useStats();
  const recentR = useMemories({ limit: 3 });
  const commitR = useCommitments();

  const stats = statsR.data;
  const commitments = commitR.data ?? [];
  const isOverdue = makeIsOverdue();

  // Real, derived counts
  const overdueCount = commitments.filter(isOverdue).length;
  const openCommitments = commitments
    .filter((c) => c.status !== 'completed' && c.status !== 'cancelled')
    .sort((a, b) => {
      const at = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bt = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      return at - bt;
    })
    .slice(0, 4);

  const sources = stats ? Object.entries(stats.bySource) : [];

  const statCards = stats
    ? [
        { label: 'Memories Saved', value: String(stats.total), icon: Brain, color: 'text-violet-400', bg: 'bg-violet-500/10', sub: 'In your long-term memory' },
        { label: 'Added This Week', value: String(stats.addedThisWeek), icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', sub: 'New in the last 7 days' },
        { label: 'Pending In Inbox', value: String(stats.pendingInbox), icon: Inbox, color: 'text-amber-400', bg: 'bg-amber-500/10', sub: 'Awaiting your review', urgent: stats.pendingInbox > 0 },
        { label: 'Verified Share', value: `${stats.verifiedShare}%`, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', sub: 'Backed by source citations' },
      ]
    : [];

  async function handleDelete(id: string) {
    // Fire the real delete, then refresh the list either way so the view
    // always reflects the server (a failed delete simply leaves the row).
    try {
      await deleteMemory(id);
    } finally {
      recentR.reload();
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm">Here is what your memory system actually holds right now.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/capture"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-[1.02]"
          >
            <Plus size={15} />
            Capture
          </Link>
          <Link
            href="/dashboard/ask"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.10] bg-white/[0.03] text-slate-200 text-sm font-medium hover:bg-white/[0.06] transition-all"
          >
            <MessageSquare size={15} />
            Ask Memory
          </Link>
        </div>
      </motion.div>

      {/* Stats row */}
      {statsR.error ? (
        <ErrorNote message={`Could not load stats: ${statsR.error}`} />
      ) : statsR.loading || !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <Skeleton className="w-9 h-9 rounded-xl mb-3" />
              <Skeleton className="h-7 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass glass-hover rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', stat.bg)}>
                    <Icon size={17} className={stat.color} />
                  </div>
                  {stat.urgent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 font-medium">
                      review
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-[11px] mt-1 text-slate-600">{stat.sub}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Needs your attention */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-2xl p-5 border border-violet-500/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.05] to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-violet-400" />
              <h2 className="text-sm font-semibold text-white">Needs your attention</h2>
            </div>

            {statsR.error ? (
              <SectionError label="Stats unavailable" message={statsR.error} />
            ) : commitR.error ? (
              <SectionError label="Commitments unavailable" message={commitR.error} />
            ) : statsR.loading || commitR.loading || !stats ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : (() => {
              const items = [
                stats.pendingInbox > 0 && {
                  icon: Inbox, tone: 'amber', href: '/dashboard/inbox',
                  text: `${plural(stats.pendingInbox, 'memory is', 'memories are')} awaiting review in your inbox`,
                },
                overdueCount > 0 && {
                  icon: AlertTriangle, tone: 'red', href: '/dashboard/commitments',
                  text: `${plural(overdueCount, 'commitment is', 'commitments are')} past their due date`,
                },
                stats.addedThisWeek > 0 && {
                  icon: Brain, tone: 'violet', href: '/dashboard/timeline',
                  text: `${plural(stats.addedThisWeek, 'memory was', 'memories were')} added in the last 7 days`,
                },
              ].filter(Boolean) as { icon: typeof Inbox; tone: string; href: string; text: string }[];

              if (items.length === 0) {
                return (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
                    <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
                    <p className="text-sm text-slate-300">Nothing pending — your memory system has no inbox items or overdue commitments right now.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {items.map((item, i) => {
                    const Icon = item.icon;
                    const tone = item.tone;
                    return (
                      <Link
                        key={i}
                        href={item.href}
                        className={cn(
                          'group flex items-center gap-3 p-3 rounded-xl border transition-colors',
                          tone === 'red'
                            ? 'bg-red-500/[0.06] border-red-500/20 hover:border-red-500/35'
                            : tone === 'amber'
                            ? 'bg-amber-500/[0.07] border-amber-500/20 hover:border-amber-500/35'
                            : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]',
                        )}
                      >
                        <Icon
                          size={15}
                          className={cn(
                            'shrink-0',
                            tone === 'red' ? 'text-red-400' : tone === 'amber' ? 'text-amber-400' : 'text-violet-400',
                          )}
                        />
                        <p className="text-sm text-slate-300 leading-relaxed flex-1">{item.text}</p>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </motion.div>

        {/* Memory Health */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Memory Health</h2>
          </div>

          {statsR.error ? (
            <SectionError label="Stats unavailable" message={statsR.error} />
          ) : statsR.loading || !stats ? (
            <div className="flex flex-col items-center gap-4 py-2">
              <Skeleton className="w-24 h-24 rounded-full" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="url(#healthGrad)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 * (1 - stats.verifiedShare / 100) }}
                      transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                    />
                    <defs>
                      <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7C3AED" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{stats.verifiedShare}%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Verified share of your memories</p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.06]">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Brain size={13} className="text-violet-400" /> Total memories
                  </span>
                  <span className="text-slate-200 font-semibold">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.06]">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Database size={13} className="text-emerald-400" /> Distinct sources
                  </span>
                  <span className="text-slate-200 font-semibold">{sources.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1.5">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Inbox size={13} className="text-amber-400" /> Pending in inbox
                  </span>
                  <span className="text-slate-200 font-semibold">{stats.pendingInbox}</span>
                </div>
              </div>

              {sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-wide text-slate-600 mb-2">Sources present</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sources.map(([key, count]) => (
                      <span
                        key={key}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400"
                      >
                        {sourceTypeConfig[key as keyof typeof sourceTypeConfig]?.label ?? key} · {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Memories */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain size={15} className="text-violet-400" />
              <h2 className="text-sm font-semibold text-white">Recent Memories</h2>
            </div>
            <Link href="/dashboard/timeline" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ChevronRight size={12} />
            </Link>
          </div>

          {recentR.error ? (
            <ErrorNote message={recentR.error} />
          ) : recentR.loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (recentR.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="No memories yet"
              hint="Capture what you have learned and it will show up here."
              actionHref="/dashboard/capture"
              actionLabel="Capture a memory"
            />
          ) : (
            <div className="space-y-3">
              {recentR.data!.map((mem) => (
                <MemoryCard key={mem.id} memory={mem} compact onDelete={handleDelete} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Open Commitments */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare size={15} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Open Commitments</h2>
              {overdueCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">
                  {overdueCount} overdue
                </span>
              )}
            </div>
            <Link href="/dashboard/commitments" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              All <ChevronRight size={12} />
            </Link>
          </div>

          {commitR.error ? (
            <ErrorNote message={commitR.error} />
          ) : commitR.loading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : openCommitments.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No open commitments right now.</p>
          ) : (
            <div className="space-y-2">
              {openCommitments.map((commit) => {
                const overdue = isOverdue(commit);
                return (
                  <div
                    key={commit.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl border',
                      overdue ? 'bg-red-500/[0.06] border-red-500/20' : 'bg-white/[0.02] border-white/[0.06]',
                    )}
                  >
                    <div className={cn('shrink-0 mt-1 w-1.5 h-1.5 rounded-full', overdue ? 'bg-red-400' : 'bg-slate-600')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 leading-snug">{commit.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {commit.owner && <span className="text-[10px] text-slate-600">{commit.owner}</span>}
                        {commit.dueDate && (
                          <span className={cn('text-[10px] font-medium', overdue ? 'text-red-400' : 'text-slate-500')}>
                            {overdue ? 'Overdue · ' : 'Due '}
                            {formatDate(commit.dueDate)}
                          </span>
                        )}
                        {!commit.dueDate && (
                          <span className="text-[10px] text-slate-600">No due date</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
