'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Info, RefreshCw, Search, Users, X } from 'lucide-react';
import { deleteMemory, useMemories } from '@/lib/client';
import MemoryCard from '@/components/memory/MemoryCard';
import EmptyState from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

export default function PeoplePage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: people, loading, error, reload } = useMemories({
    type: 'person',
    q: search.trim() ? search.trim() : undefined,
  });

  // `q` is applied server-side against the memory statement; debounce keystrokes.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const items = people ?? [];

  async function handleDelete(id: string) {
    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteMemory(id);
      reload();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete memory');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} className="text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">People</h1>
          {people && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-slate-400">
              {people.length}
            </span>
          )}
        </div>
        <p className="text-slate-400 text-sm">
          Everything you have saved about the people in your life.
        </p>
      </motion.div>

      {/* Honest note about how this page works */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-5 flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
      >
        <Info size={15} className="text-violet-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-400 leading-relaxed">
          There is no separate contact book behind this page. A <span className="text-slate-200 font-medium">person is simply a
          memory whose type is “person”</span> — one row in the same store as every other memory. What you see here is only
          what you have captured; names, roles, emails and conversation history do not exist until you save them.
        </p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search person memories..."
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
      </motion.div>

      {/* Errors */}
      {(error || deleteError) && (
        <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-300 mb-1">Could not load people</p>
              <p className="text-xs text-slate-400 break-words">{deleteError ?? error}</p>
            </div>
            <button
              onClick={() => {
                setDeleteError(null);
                reload();
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
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        error || deleteError ? null : search.trim() ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Search size={26} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-semibold text-white mb-1">No person memories match “{search.trim()}”</p>
            <p className="text-xs text-slate-500 mb-5">The search runs against the stored statements. Try a different name or clear it.</p>
            <button
              onClick={() => {
                setSearchInput('');
                setSearch('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors"
            >
              Clear search
            </button>
          </div>
        ) : (
          <EmptyState
            title="No people captured yet"
            hint="People are memories too. Capture one as type “person” and it will appear here — the AI cannot invent a contact list."
            actionHref="/dashboard/capture"
            actionLabel="Capture a person memory"
          />
        )
      ) : (
        <div className="space-y-3">
          {items.map((person) => (
            <div
              key={person.id}
              className={cn('transition-opacity', deletingId === person.id && 'opacity-40')}
            >
              <MemoryCard memory={person} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
