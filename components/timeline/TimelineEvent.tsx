'use client';

import { motion } from 'framer-motion';
import { TimelineEvent as TimelineEventType } from '@/lib/types';
import { formatDate, formatRelativeTime, sourceTypeConfig } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface TimelineEventProps {
  event: TimelineEventType;
  isLast?: boolean;
}

const sourceColors: Record<string, string> = {
  email: 'border-blue-500/30 bg-blue-500/5',
  calendar: 'border-green-500/30 bg-green-500/5',
  document: 'border-purple-500/30 bg-purple-500/5',
  conversation: 'border-yellow-500/30 bg-yellow-500/5',
  browser: 'border-red-500/30 bg-red-500/5',
  manual: 'border-slate-500/30 bg-slate-500/5',
};

const iconBg: Record<string, string> = {
  email: 'bg-blue-500/20',
  calendar: 'bg-green-500/20',
  document: 'bg-purple-500/20',
  conversation: 'bg-yellow-500/20',
  browser: 'bg-red-500/20',
  manual: 'bg-slate-500/20',
};

export default function TimelineEvent({ event, isLast = false }: TimelineEventProps) {
  const [expanded, setExpanded] = useState(false);
  const srcConfig = sourceTypeConfig[event.type];
  const importanceDots = Array.from({ length: 5 }, (_, i) => i < event.importance);

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
      )}

      {/* Icon */}
      <div className={cn(
        'relative shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-white/[0.08] z-10',
        iconBg[event.type]
      )}>
        {srcConfig.icon}
        {event.memoryCreated && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center border border-[#0A0E1A]">
            <Brain size={8} className="text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          'flex-1 mb-4 rounded-xl border p-3.5 cursor-pointer hover:border-white/10 transition-all duration-200',
          sourceColors[event.type]
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn('text-[10px] font-semibold uppercase tracking-wide', srcConfig.color)}>
                {srcConfig.label}
              </span>
              {event.memoryCreated && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300">
                  🧠 Memory saved
                </span>
              )}
              <div className="flex gap-0.5 ml-auto">
                {importanceDots.map((filled, i) => (
                  <div key={i} className={cn('w-1 h-1 rounded-full', filled ? 'bg-violet-400' : 'bg-white/10')} />
                ))}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-200 leading-snug">{event.title}</p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[10px] text-slate-600 whitespace-nowrap">{formatRelativeTime(event.date)}</span>
            {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          </div>
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs text-slate-400 leading-relaxed mt-2 pt-2 border-t border-white/[0.06]">
              {event.summary}
            </p>
            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {event.tags.map((tag) => (
                  <span key={tag} className="text-[10px] text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
