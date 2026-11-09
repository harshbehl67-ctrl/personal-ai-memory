'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, HelpCircle, ExternalLink } from 'lucide-react';
import { Memory } from '@/lib/types';
import { memoryTypeConfig, sensitivityConfig, getConfidenceColor, getConfidenceBg, formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MemoryCardProps {
  memory: Memory;
  onEdit?: (memory: Memory) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export default function MemoryCard({ memory, onEdit, onDelete, compact = false }: MemoryCardProps) {
  const [showWhy, setShowWhy] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const typeConfig = memoryTypeConfig[memory.type];
  const sensConfig = sensitivityConfig[memory.sensitivityLevel];

  const importanceDots = Array.from({ length: 5 }, (_, i) => i < memory.importanceScore);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        'group relative rounded-xl border bg-white/[0.025] hover:bg-white/[0.04] transition-all duration-200',
        memory.sensitivityLevel === 'confidential'
          ? 'border-red-500/20 hover:border-red-500/30'
          : memory.sensitivityLevel === 'sensitive'
          ? 'border-amber-500/15 hover:border-amber-500/25'
          : 'border-white/[0.06] hover:border-white/[0.10]'
      )}
    >
      {/* Left accent line */}
      <div className={cn('absolute left-0 top-4 bottom-4 w-0.5 rounded-full', typeConfig.color.replace('text-', 'bg-'))} />

      <div className={cn('p-4', compact ? 'pl-5' : 'pl-5')}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type badge */}
            <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', typeConfig.bg, typeConfig.color)}>
              {typeConfig.label}
            </span>

            {/* Fact vs inference */}
            {!memory.isVerifiedFact && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                AI Inference
              </span>
            )}

            {/* Sensitivity */}
            {(memory.sensitivityLevel === 'sensitive' || memory.sensitivityLevel === 'confidential') && (
              <span className={cn('text-[10px] font-medium', sensConfig.color)}>
                {sensConfig.icon} {sensConfig.label}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => setShowWhy(!showWhy)}
              title="Why was this saved?"
              className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
            >
              <HelpCircle size={14} />
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(memory)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
              >
                <Edit2 size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDelete(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Statement */}
        <p className="text-sm text-slate-200 leading-relaxed mb-3">{memory.statement}</p>

        {/* Scores row */}
        <div className="flex items-center gap-4 mb-3">
          {/* Confidence */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-600 uppercase tracking-wide font-medium">Confidence</span>
            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border', getConfidenceBg(memory.confidenceScore), getConfidenceColor(memory.confidenceScore))}>
              {memory.confidenceScore}%
            </span>
          </div>

          {/* Importance */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-600 uppercase tracking-wide font-medium">Importance</span>
            <div className="flex gap-0.5">
              {importanceDots.map((filled, i) => (
                <div key={i} className={cn('w-1.5 h-1.5 rounded-full', filled ? 'bg-violet-400' : 'bg-white/10')} />
              ))}
            </div>
          </div>

          <span className="text-[10px] text-slate-600 ml-auto">{formatRelativeTime(memory.createdAt)}</span>
        </div>

        {/* Citations */}
        {memory.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {memory.citations.slice(0, compact ? 1 : 3).map((citation) => (
              <div
                key={citation.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:border-violet-500/30 cursor-pointer transition-colors group/cite"
              >
                <span className="text-[10px]">
                  {citation.sourceType === 'email' ? '✉️' :
                   citation.sourceType === 'calendar' ? '📅' :
                   citation.sourceType === 'document' ? '📄' :
                   citation.sourceType === 'browser' ? '🌐' : '💬'}
                </span>
                <span className="text-[10px] text-slate-400 group-hover/cite:text-slate-300 max-w-[140px] truncate">
                  {citation.title}
                </span>
                <ExternalLink size={9} className="text-slate-600 group-hover/cite:text-violet-400 shrink-0" />
              </div>
            ))}
            {memory.citations.length > (compact ? 1 : 3) && (
              <div className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-slate-500">
                +{memory.citations.length - (compact ? 1 : 3)} more
              </div>
            )}
          </div>
        )}

        {/* Why saved panel */}
        <AnimatePresence>
          {showWhy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-3 rounded-lg bg-violet-500/[0.06] border border-violet-500/15">
                <div className="flex items-center gap-2 mb-1.5">
                  <HelpCircle size={12} className="text-violet-400" />
                  <span className="text-[10px] font-semibold text-violet-300 uppercase tracking-wide">Why this was saved</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{memory.whySaved}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {showDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-xl bg-[#0A0E1A]/95 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <div className="text-center px-6">
              <Trash2 className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white mb-1">Forget this memory?</p>
              <p className="text-xs text-slate-400 mb-4">This cannot be undone. The AI will no longer have access to this context.</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowDelete(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-white/[0.06] text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onDelete?.(memory.id); setShowDelete(false); }}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                >
                  Forget Memory
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
