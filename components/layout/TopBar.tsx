'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommitments, useMemories, useStats } from '@/lib/client';
import { memoryTypeConfig, formatDate } from '@/lib/utils';

export default function TopBar() {
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const router = useRouter();

  const trimmed = query.trim();
  const showResults = searchFocused && trimmed.length >= 2;
  const { data: results, loading: searching } = useMemories({ q: trimmed, limit: 6 });
  const { data: stats } = useStats();
  const { data: commitments } = useCommitments();

  const today = new Date().toISOString();
  const overdue = (commitments ?? []).filter(
    (commitment) =>
      (commitment.status === 'pending' || commitment.status === 'in_progress') &&
      commitment.dueDate !== undefined && commitment.dueDate < today
  );

  const notifications = [
    ...overdue.map((commitment) => ({
      id: `overdue-${commitment.id}`,
      text: `Overdue: ${commitment.title}`,
      time: commitment.dueDate ? `due ${formatDate(commitment.dueDate)}` : '',
      href: '/dashboard/commitments',
      urgent: true,
    })),
    ...(stats && stats.pendingInbox > 0
      ? [{
          id: 'inbox',
          text: `${stats.pendingInbox} memor${stats.pendingInbox === 1 ? 'y' : 'ies'} awaiting review`,
          time: '',
          href: '/dashboard/inbox',
          urgent: false,
        }]
      : []),
  ];

  function submitSearch() {
    setSearchFocused(false);
    setQuery('');
    router.push(`/dashboard/timeline?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#0A0E1A]/80 backdrop-blur-xl sticky top-0 z-40">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <div className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
          searchFocused
            ? 'bg-white/[0.06] border-violet-500/40 shadow-lg shadow-violet-500/10'
            : 'bg-white/[0.03] border-white/[0.06] hover:border-white/10'
        }`}>
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            value={query}
            placeholder="Search your stored memories..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none flex-1 min-w-0"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter' && trimmed.length >= 2) submitSearch(); }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.13 }}
              className="absolute left-0 right-0 top-12 bg-[#0F1629] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
            >
              {searching && <p className="px-4 py-3 text-xs text-slate-500">Searching…</p>}
              {!searching && results?.length === 0 && (
                <p className="px-4 py-3 text-xs text-slate-500">
                  No stored memory matches “{trimmed}”.
                </p>
              )}
              {results?.map((memory) => (
                <Link
                  key={memory.id}
                  href="/dashboard/timeline"
                  className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${memoryTypeConfig[memory.type].bg} ${memoryTypeConfig[memory.type].color}`}>
                    {memoryTypeConfig[memory.type].label}
                  </span>
                  <span className="text-xs text-slate-300 leading-relaxed line-clamp-2">{memory.statement}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 ml-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white hover:border-violet-500/30 transition-all"
          >
            <Bell size={16} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full border border-[#0A0E1A]" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 bg-[#0F1629] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
              >
                <div className="px-4 pt-4 pb-2 border-b border-white/[0.06]">
                  <p className="text-sm font-semibold text-white">Needs attention</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {notifications.length === 0 ? 'Nothing outstanding' : `${notifications.length} open item${notifications.length === 1 ? '' : 's'}`}
                  </p>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-4 text-xs text-slate-500">
                      No overdue commitments and an empty inbox.
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.href}
                        onClick={() => setNotifOpen(false)}
                        className="block px-4 py-3 hover:bg-white/[0.03] transition-colors"
                      >
                        <p className={`text-xs ${notification.urgent ? 'text-amber-300' : 'text-slate-300'}`}>
                          {notification.text}
                        </p>
                        {notification.time && (
                          <p className="text-[10px] text-slate-600 mt-0.5">{notification.time}</p>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Workspace label */}
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
            L
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-medium text-slate-300">Local workspace</p>
            <p className="text-[10px] text-slate-600">SQLite · this machine only</p>
          </div>
        </div>
      </div>
    </header>
  );
}
