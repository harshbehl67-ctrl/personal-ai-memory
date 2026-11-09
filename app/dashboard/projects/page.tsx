'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle, CalendarClock, FolderKanban, HelpCircle, Info,
  RefreshCw, Search, Tag, X,
} from 'lucide-react';
import type { Memory, MemoryTier } from '@/lib/types';
import { deleteMemory, useMemories } from '@/lib/client';
import MemoryCard from '@/components/memory/MemoryCard';
import EmptyState from '@/components/ui/empty-state';
import {
  cn, formatDate, formatRelativeTime, getConfidenceColor,
  memoryTypeConfig, sensitivityConfig, sourceTypeConfig,
} from '@/lib/utils';

const TIER_LABEL: Record<MemoryTier, string> = {
  working: 'Working',
  episodic: 'Episodic',
  long_term: 'Long-term',
  inbox: 'Inbox',
  ignored: 'Ignored',
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-slate-600 font-medium mb-1">{label}</p>
      {children}
    </div>
  );
}

function DetailPane({ memory, onDelete }: { memory: Memory; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false);
  const typeConfig = memoryTypeConfig[memory.type];
  const sensConfig = sensitivityConfig[memory.sensitivityLevel];
  const srcConfig = sourceTypeConfig[memory.sourceType];

  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 lg:sticky lg:top-6"
    >
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', typeConfig.bg, typeConfig.color)}>
          {typeConfig.label}
        </span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-400">
          {TIER_LABEL[memory.tier]}
        </span>
        {!memory.isVerifiedFact && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
            AI Inference
          </span>
        )}
      </div>

      <p className="text-sm text-slate-200 leading-relaxed mb-4">{memory.statement}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Importance">
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={cn('w-2 h-2 rounded-full', i < memory.importanceScore ? 'bg-violet-400' : 'bg-white/10')} />
            ))}
          </div>
        </Field>
        <Field label="Confidence">
          <span className={cn('text-xs font-bold', getConfidenceColor(memory.confidenceScore))}>{memory.confidenceScore}%</span>
        </Field>
        <Field label="Sensitivity">
          <span className={cn('text-xs font-medium', sensConfig.color)}>{sensConfig.icon} {sensConfig.label}</span>
        </Field>
        <Field label="Source">
          <span className={cn('text-xs font-medium', srcConfig.color)}>{srcConfig.icon} {srcConfig.label}</span>
        </Field>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-violet-500/[0.06] border border-violet-500/15">
        <div className="flex items-center gap-2 mb-1.5">
          <HelpCircle size={12} className="text-violet-400" />
          <span className="text-[10px] font-semibold text-violet-300 uppercase tracking-wide">Why this was saved</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {memory.whySaved || 'No reason was recorded for this memory.'}
        </p>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Tag size={12} className="text-slate-500" />
          <span className="text-[10px] uppercase tracking-wide text-slate-600 font-medium">Tags</span>
        </div>
        {memory.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {memory.tags.map((tag) => (
              <span key={tag} className="text-[10px] text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                #{tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-600">No tags stored.</p>
        )}
      </div>

      <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <CalendarClock size={12} className="text-slate-600 shrink-0" />
          <span>Captured {formatDate(memory.createdAt)}</span>
          <span className="text-slate-700">·</span>
          <span>{formatRelativeTime(memory.createdAt)}</span>
        </div>
        <p className="text-[11px] text-slate-600">Updated {formatDate(memory.updatedAt)}</p>
      </div>

      {confirming ? (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors"
          >
            Keep it
          </button>
          <button
            onClick={() => {
              setConfirming(false);
              onDelete(memory.id);
            }}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors"
          >
            Forget memory
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="mt-4 w-full px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-colors"
        >
          Forget this memory
        </button>
      )}
    </motion.aside>
  );
}

export default function ProjectsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: projects, loading, error, reload } = useMemories({
    type: 'project',
    q: search.trim() ? search.trim() : undefined,
  });

  // `q` is applied server-side against the stored statement; debounce keystrokes.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteMemory(id);
      if (selectedId === id) setSelectedId(null);
      reload();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete memory');
    } finally {
      setDeletingId(null);
    }
  }

  // Derived from the live list, so a deleted or filtered-out row can never linger in the pane.
  const selected = projects?.find((project) => project.id === selectedId) ?? null;
  const items = projects ?? [];

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <FolderKanban size={18} className="text-cyan-400" />
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          {projects && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-slate-400">
              {projects.length}
            </span>
          )}
        </div>
        <p className="text-slate-400 text-sm">Everything you have captured about your projects.</p>
      </motion.div>

      {/* Honest note */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-5 flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
      >
        <Info size={15} className="text-violet-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-400 leading-relaxed">
          A <span className="text-slate-200 font-medium">project is a memory whose type is “project”</span> — the same single
          store as every other memory. There are no goal, risk, milestone or document tables behind this page, so nothing is
          listed here that you have not captured yourself.
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
            placeholder="Search project memories..."
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
              <p className="text-xs font-semibold text-red-300 mb-1">Could not load projects</p>
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
            <p className="text-sm font-semibold text-white mb-1">No project memories match “{search.trim()}”</p>
            <p className="text-xs text-slate-500 mb-5">Search runs against stored statements. Try another word or clear it.</p>
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
            title="No projects captured yet"
            hint="Projects are memories too. Capture one as type “project” and it will show up here with its stored fields."
            actionHref="/dashboard/capture"
            actionLabel="Capture a project memory"
          />
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
          <div className="space-y-3 min-w-0">
            {items.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedId(project.id)}
                className={cn(
                  'cursor-pointer rounded-xl transition-opacity',
                  selectedId === project.id && 'ring-1 ring-violet-500/40',
                  deletingId === project.id && 'opacity-40',
                )}
              >
                <MemoryCard memory={project} onDelete={handleDelete} />
              </div>
            ))}
            <p className="text-[11px] text-slate-600 pt-1">
              Select a memory to see the rest of its stored fields.
            </p>
          </div>

          {selected ? (
            <DetailPane key={selected.id} memory={selected} onDelete={handleDelete} />
          ) : (
            <div className="glass rounded-2xl p-5 lg:sticky lg:top-6 text-center">
              <FolderKanban size={22} className="mx-auto mb-2 text-slate-600" />
              <p className="text-xs font-semibold text-slate-300 mb-1">Nothing selected</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Pick a project memory on the left to inspect its statement, tags, scores, source and dates.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
