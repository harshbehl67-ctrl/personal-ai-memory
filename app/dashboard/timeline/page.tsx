'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, RefreshCw, Search, X } from 'lucide-react';
import type { Memory, MemoryType } from '@/lib/types';
import { deleteMemory, useMemories, useStats } from '@/lib/client';
import MemoryCard from '@/components/memory/MemoryCard';
import EmptyState from '@/components/ui/empty-state';
import { cn, memoryTypeConfig } from '@/lib/utils';

const TYPE_ORDER: MemoryType[] = [
  'preference',
  'decision',
  'commitment',
  'person',
  'project',
  'meeting_summary',
  'research_insight',
  'temporary_context',
];

// Literal class names so Tailwind can see them at build time.
const TYPE_DOT: Record<MemoryType, string> = {
  preference: 'bg-violet-400',
  decision: 'bg-blue-400',
  commitment: 'bg-amber-400',
  person: 'bg-emerald-400',
  project: 'bg-cyan-400',
  meeting_summary: 'bg-pink-400',
  research_insight: 'bg-orange-400',
  temporary_context: 'bg-slate-400',
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayHeading(iso: string): string {
  const day = startOfDay(new Date(iso));
  const diffDays = Math.round((startOfDay(new Date()).getTime() - day.getTime()) / 86_400_000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  return day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

interface DayGroup {
  key: string;
  label: string;
  items: Memory[];
}

export default function TimelinePage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500">Loading timeline…</div>}>
      <TimelineView />
    </Suspense>
  );
}

function TimelineView() {
  const searchParams = useSearchParams();
  const { data: stats, loading: statsLoading, error: statsError, reload: reloadStats } = useStats();
  const [typeFilter, setTypeFilter] = useState<MemoryType | 'all'>('all');
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const [search, setSearch] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: memories, loading, error, reload } = useMemories({
    type: typeFilter === 'all' ? undefined : typeFilter,
    q: search.trim() ? search.trim() : undefined,
  });

  // The API applies `q` server-side; debounce so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Only offer the types that actually have rows, straight from stats.byType.
  const availableTypes = useMemo<MemoryType[]>(() => {
    if (!stats) return [];
    return TYPE_ORDER.filter((type) => (stats.byType[type] ?? 0) > 0);
  }, [stats]);

  const items = useMemo(() => memories ?? [], [memories]);

  const groups = useMemo<DayGroup[]>(() => {
    const out: DayGroup[] = [];
    const index = new Map<string, number>();
    // memories arrive ordered by createdAt DESC, so day buckets are newest-first.
    for (const memory of items) {
      const key = startOfDay(new Date(memory.createdAt)).toISOString();
      let position = index.get(key);
      if (position === undefined) {
        position = out.length;
        index.set(key, position);
        out.push({ key, label: dayHeading(memory.createdAt), items: [] });
      }
      out[position].items.push(memory);
    }
    return out;
  }, [items]);

  const asyncError = error ?? statsError;
  const isFiltering = typeFilter !== 'all' || search.trim().length > 0;

  async function handleDelete(id: string) {
    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteMemory(id);
      reload();
      reloadStats();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete memory');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Clock size={18} className="text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Timeline</h1>
          {stats && !statsLoading && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-slate-400">
              {stats.total} memor{stats.total === 1 ? 'y' : 'ies'}
            </span>
          )}
        </div>
        <p className="text-slate-400 text-sm">
          Every memory you have captured, newest first, grouped by the day it was created.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 mb-6 space-y-3"
      >
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search memory statements..."
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 placeholder-slate-600 outline-none focus:border-violet-500/40"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
              typeFilter === 'all'
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                : 'bg-white/[0.04] border-white/[0.06] text-slate-400 hover:text-slate-300 hover:border-white/10',
            )}
          >
            All{stats ? ` (${stats.total})` : ''}
          </button>

          {statsLoading && !stats && (
            <>
              <div className="h-7 w-20 rounded-lg bg-white/[0.05] animate-pulse" />
              <div className="h-7 w-24 rounded-lg bg-white/[0.05] animate-pulse" />
              <div className="h-7 w-16 rounded-lg bg-white/[0.05] animate-pulse" />
            </>
          )}

          {availableTypes.map((type) => {
            const config = memoryTypeConfig[type];
            const active = typeFilter === type;
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(active ? 'all' : type)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  active
                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    : 'bg-white/[0.04] border-white/[0.06] text-slate-400 hover:text-slate-300 hover:border-white/10',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', TYPE_DOT[type])} />
                {config.label}
                <span className="text-[10px] opacity-70">{stats?.byType[type]}</span>
              </button>
            );
          })}

          {!statsLoading && stats && availableTypes.length === 0 && (
            <span className="text-xs text-slate-600">No memories captured yet, so there are no types to filter by.</span>
          )}
        </div>
      </motion.div>

      {/* Errors */}
      {(asyncError || deleteError) && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-300 mb-1">Something went wrong</p>
              <p className="text-xs text-slate-400 break-words">{deleteError ?? asyncError}</p>
            </div>
            <button
              onClick={() => {
                setDeleteError(null);
                reload();
                reloadStats();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors shrink-0"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      {loading && items.length === 0 ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        asyncError || deleteError ? null : isFiltering ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Search size={26} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-semibold text-white mb-1">No memories match these filters</p>
            <p className="text-xs text-slate-500 mb-5">
              Nothing in the store fits the current type filter and search text.
            </p>
            <button
              onClick={() => {
                setTypeFilter('all');
                setSearchInput('');
                setSearch('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <EmptyState
            title="Your timeline is empty"
            hint="Nothing has been captured yet. Once you save your first memory, it appears here grouped by day."
          />
        )
      ) : (
        <div className="space-y-8">
          {groups.map((group, gi) => (
            <motion.div
              key={group.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(gi, 6) * 0.04 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-slate-300">{group.label}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] text-slate-600">
                  {group.items.length} memor{group.items.length === 1 ? 'y' : 'ies'}
                </span>
              </div>

              <div className="space-y-3">
                {group.items.map((memory, i) => (
                  <div key={memory.id} className="relative flex gap-4">
                    {i !== group.items.length - 1 && (
                      <div className="absolute left-[7px] top-7 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
                    )}
                    <div
                      className={cn(
                        'relative z-10 mt-5 shrink-0 w-[13px] h-[13px] rounded-full ring-2 ring-[#080B14]',
                        TYPE_DOT[memory.type],
                      )}
                    />
                    <div
                      className={cn(
                        'flex-1 min-w-0 transition-opacity',
                        deletingId === memory.id && 'opacity-40',
                      )}
                    >
                      <MemoryCard memory={memory} compact onDelete={handleDelete} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
