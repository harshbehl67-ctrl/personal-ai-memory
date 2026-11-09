'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  hint: string;
  actionHref?: string;
  actionLabel?: string;
}

export default function EmptyState({
  title,
  hint,
  actionHref = '/dashboard/capture',
  actionLabel = 'Capture a memory',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-dashed border-white/[0.10] bg-white/[0.02] p-10 text-center"
    >
      <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
        <Inbox size={18} className="text-violet-400" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mb-5">{hint}</p>
      <Link
        href={actionHref}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all"
      >
        {actionLabel}
      </Link>
    </motion.div>
  );
}
