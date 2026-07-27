'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, RefreshCw, Power, Shield, CheckCircle, Clock, Lock, Key } from 'lucide-react';
import { dataSources } from '@/lib/demo-data/sources';
import { DataSource } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';

export default function SourcesPage() {
  const [sources, setSources] = useState<DataSource[]>(dataSources);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const toggleSource = (id: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleSyncNow = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSources(prev => prev.map(s => s.id === id ? { ...s, lastSync: new Date().toISOString() } : s));
      setSyncingId(null);
    }, 1500);
  };

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Database size={18} className="text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">Connected Sources</h1>
        </div>
        <p className="text-slate-400 text-sm">Manage integrations that feed into your AI memory layer. Your data is encrypted and local-first.</p>
      </motion.div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sources.map((source, i) => (
          <motion.div
            key={source.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass rounded-2xl p-5 border transition-all ${
              source.enabled ? 'border-white/[0.08] hover:border-white/15' : 'border-white/[0.03] opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xl shrink-0">
                  {source.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{source.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${source.enabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span className="text-[11px] text-slate-500">{source.enabled ? 'Connected' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              {/* Toggle button */}
              <button
                onClick={() => toggleSource(source.id)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  source.enabled ? 'bg-violet-600' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  source.enabled ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">{source.description}</p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Imported Items</p>
                <p className="text-sm font-semibold text-slate-200">{source.itemCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Last Sync</p>
                <p className="text-sm font-semibold text-slate-200">
                  {source.lastSync ? formatRelativeTime(source.lastSync) : 'Never'}
                </p>
              </div>
            </div>

            {/* Permissions summary */}
            <div className="space-y-1 mb-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mb-1">Permissions</p>
              {source.permissions.map((perm, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <CheckCircle size={11} className="text-emerald-400 shrink-0" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
              <button
                onClick={() => handleSyncNow(source.id)}
                disabled={!source.enabled || syncingId === source.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 hover:bg-white/[0.08] transition-colors disabled:opacity-40"
              >
                <RefreshCw size={12} className={syncingId === source.id ? 'animate-spin text-violet-400' : ''} />
                {syncingId === source.id ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={() => toggleSource(source.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors ml-auto"
              >
                <Power size={12} />
                {source.enabled ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
