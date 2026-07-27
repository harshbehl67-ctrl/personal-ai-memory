'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Filter, Search, X } from 'lucide-react';
import { timelineEvents } from '@/lib/demo-data/timeline';
import { formatDate } from '@/lib/utils';
import TimelineEvent from '@/components/timeline/TimelineEvent';
import { SourceType } from '@/lib/types';

const sourceFilters: { label: string; value: SourceType | 'all'; icon: string }[] = [
  { label: 'All', value: 'all', icon: '🔍' },
  { label: 'Email', value: 'email', icon: '✉️' },
  { label: 'Calendar', value: 'calendar', icon: '📅' },
  { label: 'Documents', value: 'document', icon: '📄' },
  { label: 'Browser', value: 'browser', icon: '🌐' },
  { label: 'Chat', value: 'conversation', icon: '💬' },
];

export default function TimelinePage() {
  const [sourceFilter, setSourceFilter] = useState<SourceType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [memoryFilter, setMemoryFilter] = useState<'all' | 'with-memory' | 'without-memory'>('all');

  const filtered = timelineEvents.filter((event) => {
    if (sourceFilter !== 'all' && event.type !== sourceFilter) return false;
    if (memoryFilter === 'with-memory' && !event.memoryCreated) return false;
    if (memoryFilter === 'without-memory' && event.memoryCreated) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.summary.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group by date
  const grouped: Record<string, typeof timelineEvents> = {};
  filtered.forEach((event) => {
    const date = new Date(event.date).toDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(event);
  });

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Clock size={18} className="text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Timeline</h1>
        </div>
        <p className="text-slate-400 text-sm">Chronological history of everything your AI has seen and processed.</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 mb-6 space-y-3"
      >
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search timeline..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 placeholder-slate-600 outline-none focus:border-violet-500/40"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Source filters */}
        <div className="flex flex-wrap gap-2">
          {sourceFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setSourceFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sourceFilter === f.value
                  ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300'
                  : 'bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-slate-300 hover:border-white/10'
              }`}
            >
              <span>{f.icon}</span> {f.label}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            {(['all', 'with-memory', 'without-memory'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setMemoryFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  memoryFilter === v
                    ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300'
                    : 'bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-slate-300'
                }`}
              >
                {v === 'all' ? '🔍 All' : v === 'with-memory' ? '🧠 With memory' : '○ No memory'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(grouped).length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No events match your filters</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, events], gi) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.05 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-slate-400">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] text-slate-600">{events.length} event{events.length !== 1 ? 's' : ''}</span>
              </div>
              <div>
                {events.map((event, i) => (
                  <TimelineEvent key={event.id} event={event} isLast={i === events.length - 1} />
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
