import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MemoryType, SourceType, SensitivityLevel, ImportanceLevel } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeTime(iso: string): string {
  const now = new Date();
  const d = new Date(iso);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(iso);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export const memoryTypeConfig: Record<MemoryType, { label: string; color: string; bg: string }> = {
  preference: { label: 'Preference', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  decision: { label: 'Decision', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  commitment: { label: 'Commitment', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  person: { label: 'Person', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  project: { label: 'Project', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  meeting_summary: { label: 'Meeting', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  research_insight: { label: 'Research', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  temporary_context: { label: 'Temp Context', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
};

export const sourceTypeConfig: Record<SourceType, { label: string; icon: string; color: string }> = {
  email: { label: 'Email', icon: '✉️', color: 'text-blue-400' },
  calendar: { label: 'Calendar', icon: '📅', color: 'text-green-400' },
  document: { label: 'Document', icon: '📄', color: 'text-purple-400' },
  conversation: { label: 'Chat', icon: '💬', color: 'text-yellow-400' },
  browser: { label: 'Browser', icon: '🌐', color: 'text-red-400' },
  manual: { label: 'Manual', icon: '✏️', color: 'text-slate-400' },
};

export const sensitivityConfig: Record<SensitivityLevel, { label: string; color: string; icon: string }> = {
  public: { label: 'Public', color: 'text-slate-400', icon: '🌍' },
  personal: { label: 'Personal', color: 'text-blue-400', icon: '👤' },
  sensitive: { label: 'Sensitive', color: 'text-amber-400', icon: '⚠️' },
  confidential: { label: 'Confidential', color: 'text-red-400', icon: '🔒' },
};

export function getImportanceColor(score: ImportanceLevel): string {
  const colors = ['', 'text-slate-500', 'text-blue-400', 'text-violet-400', 'text-amber-400', 'text-red-400'];
  return colors[score];
}

export function getConfidenceColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 70) return 'text-blue-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

export function getConfidenceBg(score: number): string {
  if (score >= 90) return 'bg-emerald-500/10 border-emerald-500/30';
  if (score >= 70) return 'bg-blue-500/10 border-blue-500/30';
  if (score >= 50) return 'bg-amber-500/10 border-amber-500/30';
  return 'bg-red-500/10 border-red-500/30';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
