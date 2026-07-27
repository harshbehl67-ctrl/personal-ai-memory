'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Brain, Sparkles, Clock, CheckSquare, AlertTriangle,
  Calendar, Zap, TrendingUp, ArrowRight, MessageSquare,
  Users, FolderKanban, Inbox, Database, ChevronRight,
  MoreHorizontal, Star
} from 'lucide-react';
import { memories } from '@/lib/demo-data/memories';
import { commitments } from '@/lib/demo-data/commitments';
import { people } from '@/lib/demo-data/people';
import { timelineEvents } from '@/lib/demo-data/timeline';
import { formatRelativeTime, formatDate, memoryTypeConfig } from '@/lib/utils';
import MemoryCard from '@/components/memory/MemoryCard';

const stats = [
  { label: 'Memories Saved', value: '247', change: '+15 this week', icon: Brain, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { label: 'Open Commitments', value: '10', change: '3 overdue', icon: CheckSquare, color: 'text-amber-400', bg: 'bg-amber-500/10', urgent: true },
  { label: 'Sources Active', value: '5', change: 'All synced', icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Memory Health', value: '87%', change: '+3% this week', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

const upcomingMeetings = [
  { title: 'Engineering Standup', time: '10:00 AM', attendees: ['Jordan Lee', 'Mei Zhang'], project: 'Personal AI Memory' },
  { title: 'Product Sync — Aurora', time: '5:00 PM', attendees: ['Alex Chen', 'Sarah Kim'], project: 'Project Aurora', hasBrief: true },
  { title: 'Client Call — Apex Health', time: '11:00 AM', date: 'Tomorrow', attendees: ['Dr. Priya Chen'], project: 'Apex Health Portal', hasBrief: true, urgent: true },
];

export default function DashboardPage() {
  const [deletedMemories, setDeletedMemories] = useState<string[]>([]);
  const recentMemories = memories.filter(m => !deletedMemories.includes(m.id)).slice(0, 3);
  const overdueCommitments = commitments.filter(c => c.status === 'overdue');

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Good evening 👋</h1>
          <p className="text-slate-400 text-sm">Here's what your memory system has been tracking for you today.</p>
        </div>
        <Link
          href="/dashboard/ask"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-[1.02]"
        >
          <MessageSquare size={15} />
          Ask Memory
        </Link>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass glass-hover rounded-2xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon size={17} className={stat.color} />
                </div>
                {stat.urgent && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 font-medium">urgent</span>
                )}
              </div>
              <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className={`text-[11px] mt-1 font-medium ${stat.urgent ? 'text-amber-400' : 'text-emerald-400'}`}>{stat.change}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Daily Brief */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-2xl p-5 border border-violet-500/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.05] to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-violet-400" />
                <h2 className="text-sm font-semibold text-white">Daily Brief</h2>
              </div>
              <span className="text-[10px] text-slate-600 bg-white/[0.04] px-2 py-1 rounded-lg border border-white/[0.06]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="space-y-3">
              {/* Alert */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
                <AlertTriangle size={15} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-300">Overdue: Client portal proposal for Alex</p>
                  <p className="text-xs text-slate-500 mt-0.5">Was due Friday. Alex has sent a follow-up email. This is blocking Aurora planning.</p>
                </div>
              </div>

              {[
                { icon: '📅', text: 'Product Sync with Alex at 5pm — Aurora sprint review + commitment follow-up. Prepare metrics.', type: 'meeting' },
                { icon: '🧠', text: '6 new memories are waiting for your review in the Memory Inbox.', type: 'memory' },
                { icon: '📋', text: 'Epic EHR API access request for Apex Health is due July 31 — submit today to stay on track.', type: 'commitment' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-base shrink-0">{item.icon}</span>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Memory Health */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Memory Health</h2>
          </div>
          <div className="text-center mb-5">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="url(#healthGrad)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 * (1 - 0.87) }}
                  transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">87%</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">Excellent memory hygiene</p>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Coverage', value: 92, color: 'bg-emerald-500' },
              { label: 'Freshness', value: 85, color: 'bg-blue-500' },
              { label: 'Confidence', value: 88, color: 'bg-violet-500' },
              { label: 'Citation rate', value: 79, color: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-slate-400 font-medium">{item.value}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className={`h-full ${item.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Memories */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain size={15} className="text-violet-400" />
              <h2 className="text-sm font-semibold text-white">Recent Memories</h2>
            </div>
            <Link href="/dashboard/timeline" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentMemories.map((mem) => (
              <MemoryCard
                key={mem.id}
                memory={mem}
                compact
                onDelete={(id) => setDeletedMemories(prev => [...prev, id])}
              />
            ))}
          </div>
        </motion.div>

        {/* Upcoming + Commitments */}
        <div className="space-y-5">
          {/* Upcoming meetings */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Upcoming Meetings</h2>
              </div>
            </div>
            <div className="space-y-2.5">
              {upcomingMeetings.map((meeting, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  meeting.urgent ? 'bg-amber-500/[0.06] border-amber-500/20' : 'bg-white/[0.02] border-white/[0.06]'
                }`}>
                  <div className={`shrink-0 mt-0.5 w-2 h-2 rounded-full ${meeting.urgent ? 'bg-amber-400' : 'bg-blue-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-slate-200 truncate">{meeting.title}</p>
                      <span className="text-[10px] text-slate-500 shrink-0">{meeting.date || 'Today'} · {meeting.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{meeting.attendees.join(', ')}</p>
                    {meeting.hasBrief && (
                      <button className="text-[10px] text-violet-400 hover:text-violet-300 mt-1 flex items-center gap-1">
                        <Brain size={9} /> View AI brief
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Open commitments */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare size={15} className="text-amber-400" />
                <h2 className="text-sm font-semibold text-white">Open Commitments</h2>
                {overdueCommitments.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">
                    {overdueCommitments.length} overdue
                  </span>
                )}
              </div>
              <Link href="/dashboard/commitments" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                All <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {commitments.slice(0, 4).map((commit) => (
                <div key={commit.id} className={`flex items-start gap-3 p-3 rounded-xl border ${
                  commit.status === 'overdue' ? 'bg-red-500/[0.06] border-red-500/20' :
                  commit.status === 'in_progress' ? 'bg-blue-500/[0.04] border-blue-500/15' :
                  'bg-white/[0.02] border-white/[0.06]'
                }`}>
                  <div className={`shrink-0 mt-1 w-1.5 h-1.5 rounded-full ${
                    commit.status === 'overdue' ? 'bg-red-400' :
                    commit.status === 'in_progress' ? 'bg-blue-400' :
                    'bg-slate-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 leading-snug">{commit.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-600">{commit.owner}</span>
                      {commit.dueDate && (
                        <span className={`text-[10px] font-medium ${commit.status === 'overdue' ? 'text-red-400' : 'text-slate-500'}`}>
                          · {commit.status === 'overdue' ? '⚠️ ' : ''}{formatDate(commit.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
