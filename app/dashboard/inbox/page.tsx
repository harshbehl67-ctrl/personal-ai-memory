'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, CheckCircle, XCircle, Edit2, Ban, Brain, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import { inboxSuggestions } from '@/lib/demo-data/inbox';
import { InboxSuggestion } from '@/lib/types';
import { memoryTypeConfig } from '@/lib/utils';
import ConfidenceBadge from '@/components/memory/ConfidenceBadge';

export default function MemoryInboxPage() {
  const [suggestions, setSuggestions] = useState(inboxSuggestions);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const pending = suggestions.filter(s => s.status === 'pending');
  const handled = suggestions.filter(s => s.status !== 'pending');

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: action } : s));
  };

  const handleEdit = (suggestion: InboxSuggestion) => {
    setEditing(suggestion.id);
    setEditText(suggestion.suggestedStatement);
  };

  const handleSaveEdit = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, suggestedStatement: editText, status: 'approved' } : s));
    setEditing(null);
  };

  const importanceDots = (score: number) => Array.from({ length: 5 }, (_, i) => i < score);

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Inbox size={18} className="text-violet-400" />
          <h1 className="text-2xl font-bold text-white">Memory Inbox</h1>
          {pending.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 ml-1">
              {pending.length} pending
            </span>
          )}
        </div>
        <p className="text-slate-400 text-sm">Review AI-suggested memories before they're saved. You're always in control.</p>
      </motion.div>

      {/* Explainer */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-start gap-3 p-4 rounded-2xl bg-violet-500/[0.06] border border-violet-500/15 mb-6"
      >
        <Brain size={16} className="text-violet-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-violet-300 mb-1">How the Memory Inbox works</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            When the AI detects something worth remembering but isn't sure you'd want it saved, it puts it here for your review.
            You can <strong className="text-slate-300">approve</strong> to save it, <strong className="text-slate-300">edit</strong> to refine it, or <strong className="text-slate-300">reject</strong> it forever.
          </p>
        </div>
      </motion.div>

      {/* Pending suggestions */}
      {pending.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle size={40} className="mx-auto mb-4 text-emerald-400 opacity-50" />
          <p className="text-slate-400 font-medium">Inbox cleared</p>
          <p className="text-slate-600 text-sm mt-1">You've reviewed all pending memory suggestions.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {pending.map((suggestion, i) => {
            const typeConfig = memoryTypeConfig[suggestion.type];
            const dots = importanceDots(suggestion.importanceScore);

            return (
              <motion.div
                key={suggestion.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24, scale: 0.97 }}
                transition={{ delay: i * 0.07 }}
                className="glass rounded-2xl p-5 border border-white/[0.06] hover:border-white/10 transition-colors"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${typeConfig.bg} ${typeConfig.color}`}>
                      {typeConfig.label}
                    </span>
                    <ConfidenceBadge score={suggestion.confidenceScore} />
                    {(suggestion.sensitivityLevel === 'sensitive' || suggestion.sensitivityLevel === 'confidential') && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <AlertTriangle size={9} />
                        {suggestion.sensitivityLevel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-slate-600 mr-2">Importance:</span>
                    {dots.map((filled, idx) => (
                      <div key={idx} className={`w-1.5 h-1.5 rounded-full ${filled ? 'bg-violet-400' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>

                {/* Statement */}
                {editing === suggestion.id ? (
                  <div className="mb-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2.5 text-sm bg-white/[0.05] border border-violet-500/40 rounded-xl text-slate-200 outline-none resize-none leading-relaxed"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSaveEdit(suggestion.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                      >
                        Save & Approve
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.06] text-slate-400 hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-200 leading-relaxed mb-3 font-medium">"{suggestion.suggestedStatement}"</p>
                )}

                {/* Why the AI wants to save it */}
                <div className="mb-3 p-3 rounded-xl bg-violet-500/[0.05] border border-violet-500/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles size={11} className="text-violet-400" />
                    <span className="text-[10px] font-semibold text-violet-300 uppercase tracking-wide">Why the AI wants to save this</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{suggestion.whyAiWantsToSave}</p>
                </div>

                {/* Sources */}
                {suggestion.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {suggestion.citations.map((cite) => (
                      <div
                        key={cite.id}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] cursor-pointer hover:border-violet-500/30 transition-colors"
                      >
                        <span className="text-[10px]">
                          {cite.sourceType === 'email' ? '✉️' : cite.sourceType === 'calendar' ? '📅' : cite.sourceType === 'browser' ? '🌐' : '💬'}
                        </span>
                        <span className="text-[10px] text-slate-400 max-w-[180px] truncate">{cite.title}</span>
                        <ExternalLink size={9} className="text-slate-600" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAction(suggestion.id, 'approved')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors"
                  >
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button
                    onClick={() => handleEdit(suggestion)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                  >
                    <Edit2 size={13} /> Edit & Approve
                  </button>
                  <button
                    onClick={() => handleAction(suggestion.id, 'rejected')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                  <button
                    onClick={() => handleAction(suggestion.id, 'rejected')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:bg-white/[0.07] transition-colors"
                  >
                    <Ban size={13} /> Never remember similar things
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Handled memories */}
      {handled.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Recently Handled</p>
          <div className="space-y-2">
            {handled.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                {s.status === 'approved' ? (
                  <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                ) : (
                  <XCircle size={14} className="text-slate-600 shrink-0" />
                )}
                <p className="text-xs text-slate-500 flex-1 min-w-0 truncate">"{s.suggestedStatement}"</p>
                <span className={`text-[10px] font-medium shrink-0 ${s.status === 'approved' ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
