'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle, Ban, Download, FileJson, HardDrive, RefreshCw, Search, Settings, Shield, Trash2,
} from 'lucide-react';
import { deleteAllData, deleteMemory, exportData, useSystemInfo, type DataExport } from '@/lib/client';
import EmptyState from '@/components/ui/empty-state';
import { cn, formatRelativeTime } from '@/lib/utils';

export default function SettingsPage() {
  const { data, loading, error, reload } = useSystemInfo();
  const [busy, setBusy] = useState<null | 'export' | 'wipe'>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [showWipe, setShowWipe] = useState(false);

  const [query, setQuery] = useState('');
  const [forgetList, setForgetList] = useState<DataExport['memories'] | null>(null);

  async function handleExport() {
    setBusy('export');
    setFailure(null);
    try {
      const payload = await exportData();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `memory-export-${payload.exportedAt.slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage(`Exported ${payload.memories.length} memories and ${payload.commitments.length} commitments.`);
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setBusy(null);
    }
  }

  async function handleWipe() {
    setBusy('wipe');
    setFailure(null);
    try {
      await deleteAllData();
      setShowWipe(false);
      setConfirmText('');
      setMessage('All memories and commitments were deleted from the local database.');
      reload();
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusy(null);
    }
  }

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setFailure(null);
    try {
      const payload = await exportData();
      const needle = trimmed.toLowerCase();
      setForgetList(payload.memories.filter((m) => m.statement.toLowerCase().includes(needle)));
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Search failed');
    }
  }

  async function forgetOne(id: string) {
    setFailure(null);
    try {
      await deleteMemory(id);
      setForgetList((prev) => prev?.filter((m) => m.id !== id) ?? prev);
      reload();
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Forget failed');
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings size={18} className="text-slate-400" />
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-slate-400 text-sm">
          Everything below acts on the SQLite file on this machine. There are no accounts and no cloud sync.
        </p>
      </motion.div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-300 mb-1">Could not load settings</p>
              <p className="text-xs text-slate-400 break-words">{error}</p>
            </div>
            <button onClick={reload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors shrink-0">
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        </div>
      )}

      {failure && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-400 break-words">{failure}</p>
        </div>
      )}

      {message && (
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 flex items-start gap-3">
          <Shield size={16} className="text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-300">{message}</p>
        </div>
      )}

      {loading && !data ? (
        <div className="space-y-4">
          <div className="glass rounded-2xl h-28 animate-pulse" />
          <div className="glass rounded-2xl h-40 animate-pulse" />
        </div>
      ) : data ? (
        <div className="space-y-5">
          {/* Storage */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive size={15} className="text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Storage</h2>
            </div>
            <div className="space-y-2 text-xs mb-4">
              <div className="flex gap-3">
                <span className="text-slate-600 w-28 shrink-0">Database</span>
                <code className="text-slate-300 break-all">{data.databasePath}</code>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-600 w-28 shrink-0">Contents</span>
                <span className="text-slate-300">
                  {data.stats.total} memories · {data.stats.pendingInbox} in inbox · {data.stats.addedThisWeek} added this week
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-slate-600 w-28 shrink-0">Answer engine</span>
                <span className="text-slate-300">
                  {data.ai.provider} · {data.ai.model} · {data.ai.hasApiKey ? 'key present' : 'key missing'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The API key lives in <code className="text-slate-400">.env.local</code> and is only read by server routes;
              it is never sent to the browser. Back this up by copying the database file, or use Export below.
            </p>
          </motion.div>

          {/* Export */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <FileJson size={15} className="text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Export</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Downloads every memory and commitment as JSON. Ignores memories marked ignored, and caps memories at 500 rows.
            </p>
            <button
              onClick={handleExport}
              disabled={busy === 'export' || data.stats.total === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/25 hover:bg-blue-500/25 disabled:opacity-40 transition-colors"
            >
              <Download size={13} /> {busy === 'export' ? 'Exporting...' : 'Download JSON'}
            </button>
          </motion.div>

          {/* Find and forget */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Search size={15} className="text-violet-400" />
              <h2 className="text-sm font-semibold text-white">Find and forget</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">Delete specific memories by matching text in their statement.</p>
            <div className="flex gap-2 mb-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. Alex, deadline, budget"
                className="flex-1 min-w-0 px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/40"
              />
              <button
                onClick={handleSearch}
                disabled={!query.trim()}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 disabled:opacity-40 transition-colors shrink-0"
              >
                Search
              </button>
            </div>
            {forgetList !== null && (
              forgetList.length === 0 ? (
                <p className="text-xs text-slate-500">No stored memory contains “{query.trim()}”.</p>
              ) : (
                <div className="space-y-2">
                  {forgetList.map((memory) => (
                    <div key={memory.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-200 leading-relaxed">{memory.statement}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{memory.type} · {formatRelativeTime(memory.createdAt)}</p>
                      </div>
                      <button
                        onClick={() => forgetOne(memory.id)}
                        className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Forget this memory"
                      >
                        <Ban size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </motion.div>

          {/* Danger zone */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 size={15} className="text-red-400" />
              <h2 className="text-sm font-semibold text-red-200">Delete everything</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Empties the memories and commitments tables in place. There is no undo and no cloud copy to restore from.
            </p>
            {!showWipe ? (
              <button
                onClick={() => setShowWipe(true)}
                disabled={data.stats.total === 0}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 disabled:opacity-40 transition-colors"
              >
                {data.stats.total === 0 ? 'Nothing to delete' : 'Delete all data'}
              </button>
            ) : (
              <div className="space-y-3 max-w-sm">
                <label className="block text-[11px] text-slate-400">
                  Type <span className="font-mono text-red-300">DELETE</span> to confirm.
                </label>
                <input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 text-sm bg-white/[0.04] border rounded-xl text-slate-200 outline-none font-mono',
                    confirmText === 'DELETE' ? 'border-red-500/50' : 'border-white/[0.08]',
                  )}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleWipe}
                    disabled={confirmText !== 'DELETE' || busy === 'wipe'}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-red-500/20 text-red-200 border border-red-500/40 hover:bg-red-500/30 disabled:opacity-40 transition-colors"
                  >
                    {busy === 'wipe' ? 'Deleting...' : 'Delete permanently'}
                  </button>
                  <button
                    onClick={() => { setShowWipe(false); setConfirmText(''); }}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {data.stats.total === 0 && (
            <EmptyState
              title="No memories yet"
              hint="Settings actions become useful once the store has data. Capture your first memory to get started."
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
