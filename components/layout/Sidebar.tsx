'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, Clock, FolderKanban,
  Users, CheckSquare, Inbox, Database, Shield,
  ChevronLeft, ChevronRight, Brain, Sparkles, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCommitments, useStats } from '@/lib/client';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/capture', label: 'Capture', icon: Plus },
  { href: '/dashboard/ask', label: 'Ask Memory', icon: MessageSquare, badge: 'AI' },
  { href: '/dashboard/timeline', label: 'Timeline', icon: Clock },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { href: '/dashboard/people', label: 'People', icon: Users },
  { href: '/dashboard/commitments', label: 'Commitments', icon: CheckSquare, countKey: 'commitments' as const },
  { href: '/dashboard/inbox', label: 'Memory Inbox', icon: Inbox, countKey: 'inbox' as const },
  { href: '/dashboard/sources', label: 'Sources', icon: Database },
  { href: '/dashboard/settings', label: 'Privacy & Settings', icon: Shield },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: stats } = useStats();
  const { data: commitments } = useCommitments();

  const openCommitments = (commitments ?? []).filter(
    (commitment) => commitment.status !== 'completed' && commitment.status !== 'cancelled'
  ).length;

  const counts: Record<'commitments' | 'inbox', number> = {
    commitments: openCommitments,
    inbox: stats?.pendingInbox ?? 0,
  };
  const health = stats?.verifiedShare ?? 0;

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-[#0A0E1A] border-r border-white/[0.06] overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0A0E1A]" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <p className="text-sm font-semibold text-white truncate">Personal AI</p>
                <p className="text-[11px] text-violet-400 font-medium truncate">Memory System</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150',
                  isActive
                    ? 'bg-violet-500/10 text-violet-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-400 rounded-full"
                  />
                )}
                <Icon className={cn('w-4.5 h-4.5 shrink-0', isActive ? 'text-violet-400' : '')} size={18} />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="text-sm font-medium flex-1 truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && (() => {
                  const count = item.countKey ? counts[item.countKey] : 0;
                  if (!item.badge && count === 0) return null;
                  return (
                    <span className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                      item.badge === 'AI'
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'bg-amber-500/20 text-amber-300'
                    )}>
                      {item.badge ?? count}
                    </span>
                  );
                })()}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Memory Health */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-semibold text-violet-300">Memory Health</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">{health}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${health}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              {stats ? `${stats.total} memories stored · ${stats.addedThisWeek} added this week` : 'Loading memory stats…'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-[#0F1629] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-violet-500/50 transition-all z-10 shadow-lg"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
