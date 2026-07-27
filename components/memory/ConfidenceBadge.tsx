'use client';

import { motion } from 'framer-motion';
import { cn, getConfidenceColor, getConfidenceBg } from '@/lib/utils';

interface ConfidenceBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function ConfidenceBadge({ score, showLabel = true, size = 'sm' }: ConfidenceBadgeProps) {
  const label = score >= 90 ? 'High' : score >= 70 ? 'Good' : score >= 50 ? 'Medium' : 'Low';

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-semibold rounded-full border',
      size === 'sm' ? 'text-[11px] px-2.5 py-1' : 'text-xs px-3 py-1.5',
      getConfidenceBg(score),
      getConfidenceColor(score)
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', 
        score >= 90 ? 'bg-emerald-400' : score >= 70 ? 'bg-blue-400' : score >= 50 ? 'bg-amber-400' : 'bg-red-400'
      )} />
      {score}% {showLabel && label}
    </span>
  );
}
