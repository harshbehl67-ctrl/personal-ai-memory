'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertCircle, ArrowRight, Database, FileUp, HardDrive, Link2Off, Paperclip, RefreshCw, Sparkles, Unlink,
} from 'lucide-react';
import type { SourceType } from '@/lib/types';
import { importSource, type ImportResult, useSystemInfo } from '@/lib/client';
import { cn, sourceTypeConfig } from '@/lib/utils';

const ORDER: SourceType[] = ['manual', 'conversation', 'email', 'calendar', 'document', 'browser'];

// Kept in one place so the file picker, its accept filter and the copy cannot drift apart.
const ACCEPTED = '.pdf,.txt,.md,.markdown,.json,.csv,.log,.vtt,.srt';
const IMPORT_KINDS: { value: SourceType; label: string }[] = [
  { value: 'conversation', label: 'Chat log' },
  { value: 'document', label: 'Document' },
];

export default function SourcesPage() {
  const { data, loading, error, reload } = useSystemInfo();
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<SourceType>('conversation');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const bySource = data?.stats.bySource ?? {};
  const populated = ORDER.filter((source) => (bySource[source] ?? 0) > 0);

  async function runImport() {
    setBusy(true);
    setResult(null);
    setImportError(null);
    try {
      const outcome = await importSource({ text, file, sourceType: kind });
      setResult(outcome);
      setText('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      reload();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  }

  async function copyPath() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.databasePath);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Database size={18} className="text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">Sources</h1>
        </div>
        <p className="text-slate-400 text-sm">
          What feeds this memory store right now, and what does not.
        </p>
      </motion.div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-300 mb-1">Could not read system info</p>
              <p className="text-xs text-slate-400 break-words">{error}</p>
            </div>
            <button
              onClick={reload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors shrink-0"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        </div>
      )}

      {loading && !data ? (
        <div className="space-y-4">
          <div className="glass rounded-2xl h-32 animate-pulse" />
          <div className="glass rounded-2xl h-40 animate-pulse" />
        </div>
      ) : data ? (
        <div className="space-y-5">
          {/* Local database */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive size={15} className="text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Local database</h2>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                active
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Memories', value: data.stats.total },
                { label: 'Added this week', value: data.stats.addedThisWeek },
                { label: 'In inbox', value: data.stats.pendingInbox },
                { label: 'Verified facts', value: `${data.stats.verifiedShare}%` },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <p className="text-lg font-bold text-white">{item.value}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 uppercase tracking-wide font-medium mb-1.5">File location</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 min-w-0 text-[11px] text-slate-300 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 truncate">
                {data.databasePath}
              </code>
              <button
                onClick={copyPath}
                className="shrink-0 px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </motion.div>

          {/* Sources with rows */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-1">Memories by source</h2>
            <p className="text-xs text-slate-500 mb-4">Counted straight from the database.</p>
            {populated.length === 0 ? (
              <p className="text-xs text-slate-500 rounded-xl border border-dashed border-white/[0.10] p-5 text-center">
                No memories stored yet. Capture one and it appears here.
              </p>
            ) : (
              <div className="space-y-2">
                {populated.map((source) => {
                  const config = sourceTypeConfig[source];
                  const count = bySource[source];
                  return (
                    <div key={source} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-base shrink-0">{config.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-200">{config.label}</p>
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round((count / Math.max(data.stats.total, 1)) * 100)}%` }}
                            transition={{ duration: 0.6 }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-300 shrink-0">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* AI provider */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={15} className="text-violet-400" />
              <h2 className="text-sm font-semibold text-white">Answer engine</h2>
              <span className={cn(
                'ml-auto text-[10px] px-2 py-0.5 rounded-full border',
                data.ai.hasApiKey
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/25 text-red-300',
              )}>
                {data.ai.hasApiKey ? 'key configured' : 'no API key'}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Provider', value: data.ai.provider },
                { label: 'Model', value: data.ai.model },
                { label: 'Endpoint', value: data.ai.baseUrl },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="text-slate-600 w-20 shrink-0">{row.label}</span>
                  <span className="text-slate-300 break-all">{row.value}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
              Ask Memory only answers from memories stored in this database. Set <code className="text-slate-400">GROQ_MODEL</code>
              {' '}in <code className="text-slate-400">.env.local</code> to change the model without code edits.
            </p>
          </motion.div>

          {/* Import */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <FileUp size={15} className="text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Import text or a file</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Paste a chat log, or pick a PDF, TXT, MD, JSON, CSV or subtitle file. The model reads it and writes
              candidate memories into the Inbox. Nothing reaches long-term memory until you approve it there.
            </p>

            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={5}
              placeholder="Paste a conversation, meeting notes or an email body…"
              className="w-full p-3 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-200 outline-none resize-y focus:border-emerald-500/40"
            />

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors cursor-pointer max-w-[240px]">
                <Paperclip size={12} className="shrink-0" />
                <span className="truncate">{file ? `${file.name} (${Math.round(file.size / 1024)} KB)` : 'Choose a file'}</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPTED}
                  className="sr-only"
                  onChange={(event) => {
                    setFile(event.target.files?.[0] ?? null);
                    setResult(null);
                    setImportError(null);
                  }}
                />
              </label>

              <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
                {IMPORT_KINDS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setKind(option.value)}
                    className={cn(
                      'px-3 py-2 text-xs font-medium transition-colors',
                      kind === option.value
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'text-slate-400 hover:bg-white/[0.06]',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <button
                onClick={runImport}
                disabled={busy || (text.trim() === '' && !file)}
                className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" /> Reading…
                  </>
                ) : (
                  <>
                    <Sparkles size={12} /> Extract memories
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-600 mt-2">
              {busy
                ? 'Working through the source with one model call per block of text.'
                : 'A chosen file is read instead of the pasted text. Files are parsed in memory, never written to disk.'}
            </p>

            {importError && (
              <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/[0.06] p-3">
                <p className="text-xs font-semibold text-red-300 mb-1">Import failed</p>
                <p className="text-xs text-slate-400 break-words">{importError}</p>
              </div>
            )}

            {result && (
              <div className={cn(
                'mt-4 rounded-xl border p-3 text-xs',
                result.imported.length > 0
                  ? 'border-emerald-500/25 bg-emerald-500/[0.06]'
                  : 'border-white/[0.08] bg-white/[0.03]',
              )}>
                <p className="font-semibold text-slate-100">
                  {result.imported.length > 0
                    ? `${result.imported.length} candidate${result.imported.length === 1 ? '' : 's'} waiting in your Inbox`
                    : 'Nothing in that source was worth keeping'}
                </p>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  Read {result.processed.toLocaleString()} of {result.characters.toLocaleString()} characters from
                  {' '}{result.source}
                  {result.pages !== null ? ` (${result.pages} pages)` : ''}.
                  {result.duplicates > 0 ? ` ${result.duplicates} already stored.` : ''}
                  {result.rejected > 0 ? ` ${result.rejected} fragments too thin to keep.` : ''}
                  {result.partialError ? ` Stopped early: ${result.partialError}` : ''}
                </p>
                <ul className="mt-2 space-y-1">
                  {result.imported.slice(0, 4).map((memory) => (
                    <li key={memory.id} className="text-slate-300 flex gap-2">
                      <span className="text-emerald-400 shrink-0">•</span>
                      <span className="leading-relaxed">{memory.statement}</span>
                    </li>
                  ))}
                </ul>
                {result.imported.length > 0 && (
                  <Link
                    href="/dashboard/inbox"
                    className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-emerald-300 hover:text-emerald-200"
                  >
                    Review in Inbox <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            )}
          </motion.div>

          {/* Honest gaps */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Unlink size={15} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-amber-200">Still not connected</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Nothing pulls from an account on a schedule. Email, Calendar and Browser exist as labels so a captured
              row can say where it came from, but no inbox, calendar or browsing history feeds itself in — every
              memory reached this database because you typed it, pasted it or chose a file.
            </p>
            <div className="flex items-start gap-2 text-[11px] text-slate-500">
              <Link2Off size={12} className="mt-0.5 shrink-0" />
              <span>No account credentials live on this machine, so there is nothing to revoke and nothing reading your data while you sleep.</span>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
