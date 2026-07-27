'use client';

import { useState } from 'react';
import { Search, Bell, User, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopBar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: 1, text: '⚠️ Proposal for Alex is overdue', time: '2h ago', urgent: true },
    { id: 2, text: '🧠 6 new memories in your inbox', time: '4h ago', urgent: false },
    { id: 3, text: '📅 Client call with Dr. Chen tomorrow 11am', time: '5h ago', urgent: false },
  ];

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
            placeholder="Search memories, people, projects..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none flex-1 min-w-0"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="flex items-center gap-1 shrink-0">
            <kbd className="text-[10px] text-slate-600 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.06] font-mono">
              ⌘K
            </kbd>
          </div>
        </div>
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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full border border-[#0A0E1A]" />
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
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  <p className="text-xs text-slate-500 mt-0.5">3 unread</p>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors">
                      <p className={`text-xs ${n.urgent ? 'text-amber-300' : 'text-slate-300'}`}>{n.text}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{n.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3">
                  <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
            Y
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-medium text-slate-300">You</p>
            <p className="text-[10px] text-slate-600">Personal Workspace</p>
          </div>
        </button>
      </div>
    </header>
  );
}
