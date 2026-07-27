'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, ChevronRight, AlertTriangle, CheckCircle, Clock, Users, FileText, Target, AlertCircle } from 'lucide-react';
import { projects } from '@/lib/demo-data/projects';
import { people } from '@/lib/demo-data/people';
import { Project } from '@/lib/types';
import { formatDate, formatRelativeTime } from '@/lib/utils';

const statusConfig = {
  active: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' },
  paused: { label: 'Paused', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25' },
  completed: { label: 'Completed', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/25' },
  planning: { label: 'Planning', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/25' },
};

const updateTypeIcon = { decision: '⚡', update: '📋', milestone: '🎯', risk: '⚠️' };

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);

  const projectPeople = people.filter(p => selectedProject.stakeholders.includes(p.id));

  return (
    <div className="flex h-full">
      {/* Sidebar list */}
      <div className="w-64 shrink-0 border-r border-white/[0.06] p-4 space-y-2 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <FolderKanban size={15} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Projects</span>
          <span className="ml-auto text-[10px] text-slate-600">{projects.length}</span>
        </div>
        {projects.map((project) => {
          const sc = statusConfig[project.status];
          return (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                selectedProject.id === project.id
                  ? 'bg-violet-500/10 border-violet-500/30'
                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: project.color }} />
                <p className="text-xs font-medium text-slate-200 truncate">{project.name}</p>
              </div>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                {sc.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Project detail */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          key={selectedProject.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl space-y-5"
        >
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-4 rounded" style={{ background: selectedProject.color }} />
              <h1 className="text-2xl font-bold text-white">{selectedProject.name}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConfig[selectedProject.status].bg} ${statusConfig[selectedProject.status].color}`}>
                {statusConfig[selectedProject.status].label}
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{selectedProject.description}</p>
            {selectedProject.launchTarget && (
              <div className="flex items-center gap-2 mt-3">
                <Target size={14} className="text-amber-400" />
                <span className="text-xs text-slate-400">Launch target: </span>
                <span className="text-xs font-semibold text-amber-300">{formatDate(selectedProject.launchTarget)}</span>
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Goals */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} className="text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Goals</h2>
              </div>
              <ul className="space-y-2">
                {selectedProject.goals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle size={13} className="text-emerald-400/60 mt-0.5 shrink-0" />
                    <span className="text-xs text-slate-300 leading-relaxed">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stakeholders */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-violet-400" />
                <h2 className="text-sm font-semibold text-white">Stakeholders</h2>
              </div>
              <div className="space-y-2.5">
                {projectPeople.map((person) => (
                  <div key={person.id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: person.avatarColor }}>
                      {person.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200">{person.name}</p>
                      <p className="text-[10px] text-slate-500">{person.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Updates */}
            <div className="glass rounded-2xl p-5 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Recent Updates</h2>
              </div>
              <div className="space-y-2.5">
                {selectedProject.recentUpdates.map((update, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                    update.type === 'risk' ? 'bg-red-500/[0.05] border-red-500/15' :
                    update.type === 'decision' ? 'bg-violet-500/[0.05] border-violet-500/15' :
                    update.type === 'milestone' ? 'bg-emerald-500/[0.05] border-emerald-500/15' :
                    'bg-white/[0.02] border-white/[0.05]'
                  }`}>
                    <span className="text-base shrink-0">{updateTypeIcon[update.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 leading-relaxed">{update.summary}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{formatRelativeTime(update.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-amber-400" />
                <h2 className="text-sm font-semibold text-white">Risks</h2>
              </div>
              <ul className="space-y-2">
                {selectedProject.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-500/[0.06] border border-amber-500/15">
                    <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
                    <span className="text-xs text-slate-300 leading-relaxed">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Open Questions */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Open Questions</h2>
              </div>
              <ul className="space-y-2">
                {selectedProject.openQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-blue-500/[0.04] border border-blue-500/10">
                    <span className="text-blue-400 text-xs shrink-0 mt-0.5">?</span>
                    <span className="text-xs text-slate-300 leading-relaxed">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Linked Documents */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-purple-400" />
                <h2 className="text-sm font-semibold text-white">Linked Documents</h2>
              </div>
              <div className="space-y-2">
                {selectedProject.linkedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/30 cursor-pointer transition-colors group">
                    <span className="text-base shrink-0">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-300 group-hover:text-white truncate transition-colors">{doc.title}</p>
                      <p className="text-[10px] text-slate-600">{formatDate(doc.date)}</p>
                    </div>
                    <ChevronRight size={12} className="text-slate-700 group-hover:text-purple-400 shrink-0 transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* Next Actions */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={14} className="text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Next Actions</h2>
              </div>
              <div className="space-y-2">
                {selectedProject.nextActions.map((action) => (
                  <div key={action.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div className="w-3.5 h-3.5 rounded border border-white/20 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 leading-snug">{action.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {action.owner && <span className="text-[10px] text-slate-600">{action.owner}</span>}
                        {action.dueDate && <span className="text-[10px] text-amber-500">· {formatDate(action.dueDate)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
