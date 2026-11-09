'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Ban, CalendarDays, Check, CheckSquare, Folder, Loader2,
  Plus, RotateCcw, Search, User, X,
} from 'lucide-react';
import type { Commitment, CommitmentStatus } from '@/lib/types';
import { createCommitment, updateCommitment, useCommitments } from '@/lib/client';
import { cn, formatDate } from '@/lib/utils';
import EmptyState from '@/components/ui/empty-state';

const statusConfig: Record<CommitmentStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  overdue: { label: 'Overdue', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  cancelled: { label: 'Cancelled', color: 'text-slate-600', bg: 'bg-slate-800/50 border-slate-700/30' },
};

// `<input type="date">` produces `YYYY-MM-DD`, which JS parses as UTC midnight and would
// therefore display a day early in western timezones. Date-only values are read as local midnight.
function dueTime(iso: string): number {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (dateOnly) return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])).getTime();
  return new Date(iso).getTime();
}

const formatDueDate = (iso: string) => formatDate(new Date(dueTime(iso)).toISOString());

const isOpen = (c: Commitment) => c.status !== 'completed' && c.status !== 'cancelled';

// Overdue is derived here from dueDate vs today - the stored status is never trusted for it.
const isOverdue = (c: Commitment, today: number) =>
  isOpen(c) && c.dueDate != null && dueTime(c.dueDate) < today;

const EMPTY_FORM = { title: '', owner: 'Me', dueDate: '', relatedProject: '' };

export default function CommitmentsPage() {
  const { data, loading, error, reload } = useCommitments();
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Start of today, computed once per mount - enough granularity for date comparisons.
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const commitments = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return commitments;
    return commitments.filter((c) =>
      [c.title, c.owner, c.relatedProject ?? '', c.description ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [commitments, search]);

  const openRows = useMemo(
    () =>
      filtered
        .filter(isOpen)
        .slice()
        .sort((a, b) => {
          const at = a.dueDate ? dueTime(a.dueDate) : Number.POSITIVE_INFINITY;
          const bt = b.dueDate ? dueTime(b.dueDate) : Number.POSITIVE_INFINITY;
          return at - bt;
        }),
    [filtered]
  );

  const doneRows = useMemo(
    () =>
      filtered
        .filter((c) => !isOpen(c))
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [filtered]
  );

  const counts = useMemo(
    () => ({
      open: commitments.filter(isOpen).length,
      overdue: commitments.filter((c) => isOverdue(c, today)).length,
      completed: commitments.filter((c) => c.status === 'completed').length,
      total: commitments.length,
    }),
    [commitments, today]
  );

  const openOverdue = openRows.filter((c) => isOverdue(c, today)).length;

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setCreateError('A title is required.');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      await createCommitment({
        title: form.title.trim(),
        owner: form.owner.trim() || 'Me',
        dueDate: form.dueDate || undefined,
        relatedProject: form.relatedProject.trim() || undefined,
      });
      setForm(EMPTY_FORM);
      reload();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Could not save the commitment.');
    } finally {
      setCreating(false);
    }
  }

  async function setStatus(id: string, status: CommitmentStatus) {
    setBusyId(id);
    setActionError(null);
    try {
      await updateCommitment(id, { status });
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update the commitment.');
    } finally {
      setBusyId(null);
    }
  }

  const tiles = [
    { label: 'Open', value: counts.open, color: 'text-violet-400' },
    { label: 'Past due', value: counts.overdue, color: 'text-red-400' },
    { label: 'In progress', value: commitments.filter((c) => c.status === 'in_progress').length, color: 'text-blue-400' },
    { label: 'Completed', value: counts.completed, color: 'text-emerald-400' },
  ];

  function renderRow(commitment: Commitment) {
    const overdue = isOverdue(commitment, today);
    const open = isOpen(commitment);
    const sc = overdue ? statusConfig.overdue : statusConfig[commitment.status];
    const busy = busyId === commitment.id;

    return (
      <motion.div
        key={commitment.id}
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -16 }}
        className={cn(
          'glass rounded-2xl p-4 border transition-all',
          overdue ? 'border-red-500/20 bg-red-500/[0.03]' : open ? 'border-white/[0.06]' : 'border-white/[0.04] opacity-70'
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn('mt-1.5 w-2 h-2 rounded-full shrink-0', overdue ? 'bg-red-400' : open ? 'bg-violet-400' : 'bg-emerald-400')} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className={cn('text-sm font-medium leading-snug', open ? 'text-slate-200' : 'text-slate-500 line-through')}>
                {commitment.title}
              </p>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0', sc.bg, sc.color)}>
                {sc.label}
              </span>
            </div>

            {commitment.description && (
              <p className="text-xs text-slate-500 leading-relaxed mb-2">{commitment.description}</p>
            )}

            <div className="flex items-center gap-3 flex-wrap text-[11px]">
              <span className="flex items-center gap-1 text-slate-500">
                <User size={11} className="text-slate-600" />
                {commitment.owner}
              </span>
              {commitment.dueDate ? (
                <span className={cn('flex items-center gap-1', overdue ? 'text-red-400 font-medium' : 'text-slate-500')}>
                  <CalendarDays size={11} className={overdue ? 'text-red-400' : 'text-slate-600'} />
                  {overdue ? 'Was due' : 'Due'} {formatDueDate(commitment.dueDate)}
                </span>
              ) : (
                <span className="text-slate-600">No due date</span>
              )}
              {commitment.relatedProject && (
                <span className="flex items-center gap-1 text-slate-500">
                  <Folder size={11} className="text-slate-600" />
                  {commitment.relatedProject}
                </span>
              )}
              <span className="text-slate-700 ml-auto">Updated {formatDate(commitment.updatedAt)}</span>
            </div>

            {/* Real actions - each one PATCHes the row, then reloads from the API. */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {busy ? (
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Loader2 size={12} className="animate-spin" /> Saving...
                </span>
              ) : open ? (
                <>
                  {commitment.status === 'pending' && (
                    <button
                      onClick={() => setStatus(commitment.id, 'in_progress')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                    >
                      <RotateCcw size={11} /> Start
                    </button>
                  )}
                  <button
                    onClick={() => setStatus(commitment.id, 'completed')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors"
                  >
                    <Check size={11} /> Mark completed
                  </button>
                  <button
                    onClick={() => setStatus(commitment.id, 'cancelled')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/25 transition-colors"
                  >
                    <Ban size={11} /> Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setStatus(commitment.id, 'pending')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.05] text-slate-300 border border-white/[0.08] hover:bg-white/10 transition-colors"
                >
                  <RotateCcw size={11} /> Reopen
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <CheckSquare size={18} className="text-amber-400" />
          <h1 className="text-2xl font-bold text-white">Commitments</h1>
          {!loading && !error && commitments.length > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-slate-400">
              {counts.total} stored
            </span>
          )}
        </div>
        <p className="text-slate-400 text-sm">
          Promises and deadlines you have recorded. Nothing is extracted automatically - no email or
          calendar source is connected to this deployment.
        </p>
      </motion.div>

      {/* Real counts, derived from the loaded rows */}
      {!loading && !error && commitments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-3 mb-5">
          {tiles.map((tile) => (
            <div key={tile.label} className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.03] text-center">
              <p className={cn('text-xl font-bold', tile.value > 0 ? tile.color : 'text-slate-600')}>{tile.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{tile.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Create form */}
      <motion.form
        id="new-commitment"
        onSubmit={handleCreate}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5 mb-5 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Plus size={14} className="text-violet-400" />
          <h2 className="text-sm font-semibold text-white">Add a commitment</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="What did you promise to do?"
            className="md:col-span-2 px-3 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/40"
          />
          <label className="space-y-1">
            <span className="text-[10px] uppercase tracking-wide text-slate-600 font-medium">Owner</span>
            <input
              type="text"
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
              placeholder="Me"
              className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/40"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[10px] uppercase tracking-wide text-slate-600 font-medium">Due date</span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 outline-none focus:border-violet-500/40 [color-scheme:dark]"
            />
          </label>
          <input
            type="text"
            value={form.relatedProject}
            onChange={(e) => setForm({ ...form, relatedProject: e.target.value })}
            placeholder="Related project (optional)"
            className="md:col-span-2 px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/40"
          />
        </div>

        {createError && (
          <p className="flex items-center gap-1.5 text-xs text-red-400">
            <AlertTriangle size={12} /> {createError}
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={creating || !form.title.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-40 disabled:hover:shadow-none"
          >
            {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            {creating ? 'Saving...' : 'Save commitment'}
          </button>
          {form.title || form.dueDate || form.relatedProject || form.owner !== 'Me' ? (
            <button
              type="button"
              onClick={() => { setForm(EMPTY_FORM); setCreateError(null); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={12} /> Clear
            </button>
          ) : null}
        </div>
      </motion.form>

      {/* Search */}
      {!loading && !error && commitments.length > 0 && (
        <div className="relative mb-5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stored commitments..."
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 placeholder-slate-600 outline-none focus:border-violet-500/40"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {actionError && (
        <div className="mb-5 flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-3">
          <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-300 leading-relaxed">{actionError}</p>
        </div>
      )}

      {/* Body */}
      {error ? (
        <div className="glass rounded-2xl p-6 flex items-start gap-3 border-red-500/20">
          <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white mb-1">Commitments could not be loaded</p>
            <p className="text-xs text-slate-400 mb-3 break-words">{error}</p>
            <button
              onClick={reload}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : commitments.length === 0 ? (
        <EmptyState
          title="No commitments yet"
          hint="Nothing is stored in the commitments table. Add the first one with the form above - titles, owners and due dates are saved to your local SQLite database."
          actionHref="#new-commitment"
          actionLabel="Add a commitment"
        />
      ) : openRows.length === 0 && doneRows.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <Search size={26} className="mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-semibold text-white mb-1">No commitments match your search</p>
          <p className="text-xs text-slate-500 mb-5">
            {commitments.length} stored commitment{commitments.length === 1 ? '' : 's'}, none containing that text.
          </p>
          <button
            onClick={() => setSearch('')}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Open</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25 font-medium">
                {openRows.length}
              </span>
              {openOverdue > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-red-400">
                  <AlertTriangle size={10} /> {openOverdue} past due
                </span>
              )}
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            {openRows.length === 0 ? (
              <p className="text-xs text-slate-600 py-4 text-center glass rounded-2xl">Nothing open right now.</p>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">{openRows.map(renderRow)}</AnimatePresence>
              </div>
            )}
          </section>

          {doneRows.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Completed</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-medium">
                  {doneRows.length}
                </span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">{doneRows.map(renderRow)}</AnimatePresence>
              </div>
              <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
                Cancelling a commitment writes status <span className="text-slate-400">cancelled</span> to its row. The
                commitments API does not return cancelled rows, so a cancelled commitment leaves this list.
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
