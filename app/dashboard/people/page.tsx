'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, MessageSquare, Calendar, ExternalLink, ChevronRight } from 'lucide-react';
import { people } from '@/lib/demo-data/people';
import { Person } from '@/lib/types';
import { formatRelativeTime, sourceTypeConfig } from '@/lib/utils';

export default function PeoplePage() {
  const [selected, setSelected] = useState<Person>(people[0]);

  return (
    <div className="flex h-full">
      {/* People list sidebar */}
      <div className="w-64 shrink-0 border-r border-white/[0.06] p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Users size={15} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">People</span>
          <span className="ml-auto text-[10px] text-slate-600">{people.length}</span>
        </div>
        {people.map((person) => (
          <button
            key={person.id}
            onClick={() => setSelected(person)}
            className={`w-full text-left p-3 rounded-xl border mb-2 transition-all ${
              selected.id === person.id
                ? 'bg-violet-500/10 border-violet-500/30'
                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: person.avatarColor }}>
                {person.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{person.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{person.role}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Person detail */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-start gap-4 glass rounded-2xl p-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg" style={{ background: selected.avatarColor }}>
              {selected.avatarInitials}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white mb-0.5">{selected.name}</h1>
              <p className="text-sm text-slate-400">{selected.role} · {selected.organization}</p>
              {selected.email && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Mail size={12} className="text-slate-600" />
                  <span className="text-xs text-slate-500">{selected.email}</span>
                </div>
              )}
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selected.relationshipContext}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-slate-600 mb-1">Last contact</p>
              <p className="text-xs font-medium text-slate-300">{formatRelativeTime(selected.lastContacted)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Remembered Preferences */}
            <div className="glass rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span>🧠</span> Remembered Preferences
              </h2>
              <ul className="space-y-2">
                {selected.rememberedPreferences.map((pref, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                    <span className="text-violet-400 shrink-0 mt-0.5">·</span>
                    {pref}
                  </li>
                ))}
              </ul>
            </div>

            {/* Notes */}
            <div className="glass rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span>📝</span> Notes & Context
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">{selected.notes}</p>
            </div>

            {/* Recent Communication */}
            <div className="glass rounded-2xl p-5 md:col-span-2">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <MessageSquare size={14} className="text-blue-400" /> Recent Communication
              </h2>
              <div className="space-y-2.5">
                {selected.recentCommunication.map((comm, i) => {
                  const srcConfig = sourceTypeConfig[comm.type];
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors cursor-pointer">
                      <span className="text-base shrink-0">{srcConfig.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 leading-relaxed">{comm.summary}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{formatRelativeTime(comm.date)}</p>
                      </div>
                      <ExternalLink size={11} className="text-slate-700 shrink-0 mt-0.5" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shared Projects */}
            {selected.sharedProjects.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <span>📁</span> Shared Projects
                </h2>
                <div className="space-y-2">
                  {selected.sharedProjects.map((projId) => {
                    const projNames: Record<string, string> = {
                      'proj-001': 'Personal AI Memory System',
                      'proj-002': 'Project Aurora',
                      'proj-003': 'Apex Health Client Portal',
                    };
                    const projColors: Record<string, string> = {
                      'proj-001': '#7C3AED',
                      'proj-002': '#3B82F6',
                      'proj-003': '#10B981',
                    };
                    return (
                      <div key={projId} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: projColors[projId] || '#7C3AED' }} />
                        <span className="text-xs text-slate-300">{projNames[projId] || projId}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Citations */}
            {selected.citations.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <span>🔗</span> Source Citations
                </h2>
                <div className="space-y-2">
                  {selected.citations.map((cite) => (
                    <div key={cite.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/30 cursor-pointer transition-colors group">
                      <span className="text-sm shrink-0">
                        {cite.sourceType === 'email' ? '✉️' : cite.sourceType === 'calendar' ? '📅' : '📄'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-slate-300 truncate group-hover:text-white transition-colors">{cite.title}</p>
                        {cite.excerpt && <p className="text-[10px] text-slate-600 leading-snug mt-0.5 line-clamp-2">{cite.excerpt}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
