'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Ban, Check, Inbox, Pencil, RefreshCw, Save, X } from 'lucide-react';
import type { Memory } from '@/lib/types';
import { deleteMemory, updateMemory, useMemories } from '@/lib/client';
import EmptyState from '@/components/ui/empty-state';
import { cn, formatRelativeTime, memoryTypeConfig, sensitivityConfig } from '@/lib/utils';

export default function InboxPage() {
  const { data, loading, error, reload } = useMemories({ tier: 'inbox' });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const pending = data ?? [];

  async function run(id: string, fn: () => Promise<unknown>) {
    setBusyId(id);
    setActionError(null);
    try {
      await fn();
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(memory: Memory) {
    setEditingId(memory.id);
    setDraft(memory.statement);
  }

  return (
    <div className="p-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Inbox size={18} className="text-violet-400" />
          <h1 className="text-2xl font-bold text-white">Memory Inbox</h1>
          {!loading && data && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-slate-400">
              {pending.length} pending
            </span>
          )}
        </div>
        <p className="text-slate-400 text-sm">
          Memories you captured with the <span className="text-slate-300">Inbox</span> tier and every candidate produced by an
          import land here. Approve one to promote it to long-term memory, or ignore it so the AI stops seeing it.
        </p>
      </motion.div>

      {(error || actionError) && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-300 mb-1">Something went wrong</p>
              <p className="text-xs text-slate-400 break-words">{actionError ?? error}</p>
            </div>
            <button
              onClick={() => { setActionError(null); reload(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors shrink-0"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        </div>
      )}

      {loading && pending.length === 0 ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="glass rounded-xl h-28 animate-pulse" />)}
        </div>
      ) : pending.length === 0 ? (
        error || actionError ? null : (
          <EmptyState
            title="Inbox is clear"
            hint="Nothing is waiting for review. Capture a memory with the Inbox tier, or import a chat log or file on the Sources page and its candidates appear here."
            actionHref="/dashboard/sources"
            actionLabel="Import a source"
          />
        )
      ) : (
        <div className="space-y-3">
          {pending.map((memory, i) => {
            const typeConfig = memoryTypeConfig[memory.type];
            const sensConfig = sensitivityConfig[memory.sensitivityLevel];
            const isEditing = editingId === memory.id;
            const isBusy = busyId === memory.id;

            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: Math.min(i, 8) * 0.04 }}
                className={cn(
                  'glass rounded-xl p-4 border border-white/[0.06] transition-opacity',
                  isBusy && 'opacity-50 pointer-events-none',
                )}
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', typeConfig.bg, typeConfig.color)}>
                    {typeConfig.label}
                  </span>
                  <span className={cn('text-[10px] font-medium', sensConfig.color)}>{sensConfig.icon} {sensConfig.label}</span>
                  <span className="text-[10px] text-slate-600 ml-auto">{formatRelativeTime(memory.createdAt)}</span>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={3}
                      className="w-full p-3 text-sm bg-white/[0.04] border border-violet-500/40 rounded-lg text-slate-200 outline-none resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => run(memory.id, async () => {
                          await updateMemory(memory.id, { statement: draft.trim() });
                          setEditingId(null);
                        })}
                        disabled={!draft.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/30 disabled:opacity-40 transition-colors"
                      >
                        <Save size={12} /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors"
                      >
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-slate-200 leading-relaxed mb-2">{memory.statement}</p>
                    {memory.whySaved && (
                      <p className="text-xs text-slate-500 leading-relaxed mb-3 pl-3 border-l-2 border-white/[0.08]">
                        {memory.whySaved}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => run(memory.id, () => updateMemory(memory.id, { tier: 'long_term' }))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={() => startEdit(memory)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => run(memory.id, () => updateMemory(memory.id, { tier: 'ignored' }))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:text-slate-200 hover:bg-white/[0.08] transition-colors"
                      >
                        <Ban size={12} /> Ignore
                      </button>
                      <button
                        onClick={() => run(memory.id, () => deleteMemory(memory.id))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors ml-auto"
                      >
                        <X size={12} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
