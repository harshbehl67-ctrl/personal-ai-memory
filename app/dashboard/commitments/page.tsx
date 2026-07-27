'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, AlertTriangle, Clock, Filter, Search, Bell, BellOff, X } from 'lucide-react';
import { commitments } from '@/lib/demo-data/commitments';
import { Commitment, CommitmentStatus } from '@/lib/types';
import { formatDate, formatRelativeTime } from '@/lib/utils';

const statusConfig: Record<CommitmentStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: 'Pending', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', dot: 'bg-slate-500' },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400' },
  completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  overdue: { label: 'Overdue', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
  cancelled: { label: 'Cancelled', color: 'text-slate-600', bg: 'bg-slate-800/50 border-slate-700/30', dot: 'bg-slate-700' },
};

export default function CommitmentsPage() {
  const [commitmentList, setCommitmentList] = useState(commitments);
  const [statusFilter, setStatusFilter] = useState<CommitmentStatus | 'all'>('all');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'me' | 'others'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = commitmentList.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (ownerFilter === 'me' && c.owner !== 'Me') return false;
    if (ownerFilter === 'others' && c.owner === 'Me') return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const markComplete = (id: string) => {
    setCommitmentList(prev => prev.map(c => c.id === id ? { ...c, status: 'completed' } : c));
  };

  const toggleReminder = (id: string) => {
    setCommitmentList(prev => prev.map(c => c.id === id ? { ...c, reminderEnabled: !c.reminderEnabled } : c));
  };

  const counts = {
    overdue: commitmentList.filter(c => c.status === 'overdue').length,
    pending: commitmentList.filter(c => c.status === 'pending').length,
    in_progress: commitmentList.filter(c => c.status === 'in_progress').length,
    completed: commitmentList.filter(c => c.status === 'completed').length,
  };

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <CheckSquare size={18} className="text-amber-400" />
          <h1 className="text-2xl font-bold text-white">Commitments</h1>
        </div>
        <p className="text-slate-400 text-sm">Promises, deadlines, and action items extracted from your messages and meetings.</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-3 mb-5"
      >
        {[
          { label: 'Overdue', count: counts.overdue, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Pending', count: counts.pending, color: 'text-slate-400', bg: 'bg-white/[0.04] border-white/[0.08]' },
          { label: 'In Progress', count: counts.in_progress, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Completed', count: counts.completed, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map((stat) => (
          <div key={stat.label} className={`p-3.5 rounded-xl border ${stat.bg} text-center`}>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-4 mb-5 space-y-3"
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search commitments..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-300 placeholder-slate-600 outline-none focus:border-violet-500/40"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'overdue', 'in_progress', 'pending', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300'
                    : 'bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-slate-300'
                }`}
              >
                {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Owner filter */}
          <div className="flex gap-1.5">
            {(['all', 'me', 'others'] as const).map((o) => (
              <button
                key={o}
                onClick={() => setOwnerFilter(o)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  ownerFilter === o
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                    : 'bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-slate-300'
                }`}
              >
                {o === 'all' ? 'Everyone' : o === 'me' ? 'Mine' : 'Others'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((commitment, i) => {
            const sc = statusConfig[commitment.status];
            return (
              <motion.div
                key={commitment.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ delay: i * 0.04 }}
                className={`glass rounded-2xl p-4 border transition-all ${
                  commitment.status === 'overdue' ? 'border-red-500/20 bg-red-500/[0.03]' :
                  commitment.status === 'completed' ? 'opacity-60 border-white/[0.04]' :
                  'border-white/[0.06]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => markComplete(commitment.id)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      commitment.status === 'completed'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-white/20 hover:border-violet-400'
                    }`}
                  >
                    {commitment.status === 'completed' && <span className="text-[10px]">✓</span>}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className={`text-sm font-medium leading-snug ${commitment.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {commitment.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleReminder(commitment.id)}
                          className={`p-1.5 rounded-lg transition-colors ${commitment.reminderEnabled ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
                        >
                          {commitment.reminderEnabled ? <Bell size={13} /> : <BellOff size={13} />}
                        </button>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </div>
                    </div>

                    {commitment.description && (
                      <p className="text-xs text-slate-500 leading-relaxed mb-2">{commitment.description}</p>
                    )}

                    <div className="flex items-center gap-3 flex-wrap text-[11px]">
                      <span className="text-slate-500">👤 {commitment.owner}</span>
                      {commitment.dueDate && (
                        <span className={commitment.status === 'overdue' ? 'text-red-400 font-medium' : 'text-slate-500'}>
                          {commitment.status === 'overdue' ? '⚠️ ' : '📅 '}Due {formatDate(commitment.dueDate)}
                        </span>
                      )}
                      {commitment.relatedProjectName && (
                        <span className="text-slate-500">📁 {commitment.relatedProjectName}</span>
                      )}
                    </div>

                    {/* Evidence */}
                    {commitment.evidence.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {commitment.evidence.map((cite) => (
                          <div
                            key={cite.id}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] cursor-pointer hover:border-violet-500/30 transition-colors"
                          >
                            <span className="text-[10px]">
                              {cite.sourceType === 'email' ? '✉️' : '📅'}
                            </span>
                            <span className="text-[10px] text-slate-500 max-w-[140px] truncate">{cite.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <CheckSquare size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No commitments match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
