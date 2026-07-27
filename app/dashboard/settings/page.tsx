'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Trash2, Download, Bell, AlertTriangle, Key, History } from 'lucide-react';

export default function SettingsPage() {
  const [askSensitive, setAskSensitive] = useState(true);
  const [allowProactive, setAllowProactive] = useState(true);
  const [allowBrowser, setAllowBrowser] = useState(true);
  const [retentionDays, setRetentionDays] = useState('365');
  const [forgetQuery, setForgetQuery] = useState('');
  const [forgetSuccess, setForgetSuccess] = useState(false);

  const auditLogs = [
    { action: 'Memory deleted', details: 'User deleted memory ID mem-013 (active voice preference)', time: '10 mins ago' },
    { action: 'Data export', details: 'Exported complete memory graph (JSON format)', time: '2 hours ago' },
    { action: 'Source connected', details: 'Google Calendar sync completed (384 items imported)', time: '4 hours ago' },
    { action: 'Memory approved', details: 'Approved inbox suggestion: "Prefers concise emails"', time: '1 day ago' },
  ];

  const handleForget = () => {
    if (forgetQuery.trim()) {
      setForgetSuccess(true);
      setTimeout(() => {
        setForgetQuery('');
        setForgetSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Shield size={18} className="text-violet-400" />
          <h1 className="text-2xl font-bold text-white">Privacy & Settings</h1>
        </div>
        <p className="text-slate-400 text-sm">You have absolute ownership and governance over your AI memory vault.</p>
      </motion.div>

      {/* Main Privacy Controls */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <Lock size={16} className="text-violet-400" /> Core Privacy Rules
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-200">Ask before saving sensitive memories</p>
              <p className="text-xs text-slate-500">Require explicit user approval in Memory Inbox for sensitive/confidential context.</p>
            </div>
            <button
              onClick={() => setAskSensitive(!askSensitive)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${askSensitive ? 'bg-violet-600' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${askSensitive ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-200">Allow proactive reminders & daily briefs</p>
              <p className="text-xs text-slate-500">Let the AI surface helpful meeting briefs and deadline alerts based on remembered context.</p>
            </div>
            <button
              onClick={() => setAllowProactive(!allowProactive)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${allowProactive ? 'bg-violet-600' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${allowProactive ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-200">Allow browsing history memory extraction</p>
              <p className="text-xs text-slate-500">Automatically extract research topics and reading patterns from visited web pages.</p>
            </div>
            <button
              onClick={() => setAllowBrowser(!allowBrowser)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${allowBrowser ? 'bg-violet-600' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${allowBrowser ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Selective Forget Control */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <Trash2 size={16} className="text-red-400" /> Forget Specific Entity or Topic
        </h2>
        <p className="text-xs text-slate-400">Purge all stored memories, episodic records, and citations associated with a specific name, project, or keyword.</p>

        <div className="flex gap-3">
          <input
            type="text"
            value={forgetQuery}
            onChange={(e) => setForgetQuery(e.target.value)}
            placeholder="e.g. 'Project Aurora', 'Alex Chen', 'medical history'"
            className="flex-1 px-4 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 outline-none focus:border-violet-500/40"
          />
          <button
            onClick={handleForget}
            disabled={!forgetQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/25 transition-colors disabled:opacity-40"
          >
            Purge Memories
          </button>
        </div>

        {forgetSuccess && (
          <p className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
            ✓ Successfully purged all matching memories and context links.
          </p>
        )}
      </motion.div>

      {/* Data Retention & Export */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Download size={15} className="text-blue-400" /> Export & Backup
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">Download your entire personal memory database including vector embeddings and source citations in JSON format.</p>
          <button className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-slate-200 hover:bg-white/10 transition-colors font-medium">
            Export All Data (.json)
          </button>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4 border-red-500/20 bg-red-500/[0.02]">
          <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle size={15} /> Danger Zone
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">Irreversibly wipe your entire memory database. All working, episodic, and long-term memories will be purged.</p>
          <button className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300 hover:bg-red-500/30 transition-colors font-medium">
            Delete All Memories
          </button>
        </div>
      </motion.div>

      {/* Audit Log */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <History size={16} className="text-slate-400" /> Memory Activity & Audit Log
        </h2>

        <div className="space-y-3">
          {auditLogs.map((log, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <p className="text-xs font-semibold text-slate-300">{log.action}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
              </div>
              <span className="text-[10px] text-slate-600 shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
