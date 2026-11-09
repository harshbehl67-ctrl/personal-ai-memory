'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Plus, Save, TriangleAlert } from 'lucide-react';
import {
  createCommitment, createMemory, useMemories,
} from '@/lib/client';
import {
  CommitmentStatus, MemoryTier, MemoryType, SensitivityLevel, SourceType,
} from '@/lib/types';
import { memoryTypeConfig, sourceTypeConfig, sensitivityConfig } from '@/lib/utils';
import MemoryCard from '@/components/memory/MemoryCard';

const MEMORY_TYPES: MemoryType[] = [
  'preference', 'decision', 'commitment', 'person', 'project',
  'meeting_summary', 'research_insight', 'temporary_context',
];
const CAPTURABLE_TIERS: MemoryTier[] = ['long_term', 'inbox', 'working', 'episodic'];
const SENSITIVITIES: SensitivityLevel[] = ['public', 'personal', 'sensitive', 'confidential'];
const SOURCES: SourceType[] = ['manual', 'conversation', 'document', 'email', 'calendar', 'browser'];

const TIER_LABELS: Record<string, string> = {
  long_term: 'Long-term memory',
  inbox: 'Inbox (review later)',
  working: 'Working (short-lived)',
  episodic: 'Episodic',
};

const fieldClass =
  'w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-slate-200 ' +
  'placeholder:text-slate-600 outline-none focus:border-violet-500/40 focus:bg-white/[0.05] transition-colors';
const labelClass = 'block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5';

export default function CapturePage() {
  const [tab, setTab] = useState<'memory' | 'commitment'>('memory');
  const recent = useMemories({ limit: 3 });

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Capture</h1>
        <p className="text-sm text-slate-400">
          Everything the assistant knows about you comes from what you save here.
        </p>
      </div>

      <div className="flex gap-2">
        {(['memory', 'commitment'] as const).map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
              tab === value
                ? 'bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-lg shadow-violet-500/20'
                : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
            }`}
          >
            {value === 'memory' ? 'New memory' : 'New commitment'}
          </button>
        ))}
      </div>

      {tab === 'memory' ? <MemoryForm onSaved={recent.reload} /> : <CommitmentForm />}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Most recent captures</h2>
          <Link href="/dashboard/timeline" className="text-xs text-violet-400 hover:text-violet-300">
            View all
          </Link>
        </div>
        {recent.loading && <p className="text-xs text-slate-500">Loading…</p>}
        {recent.error && <p className="text-xs text-red-400">{recent.error}</p>}
        {recent.data?.length === 0 && (
          <p className="text-xs text-slate-500">Nothing stored yet — the database is empty.</p>
        )}
        {recent.data?.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} compact />
        ))}
      </section>
    </div>
  );
}

function MemoryForm({ onSaved }: { onSaved: () => void }) {
  const [statement, setStatement] = useState('');
  const [type, setType] = useState<MemoryType>('preference');
  const [tier, setTier] = useState<MemoryTier>('long_term');
  const [importance, setImportance] = useState(3);
  const [confidence, setConfidence] = useState(90);
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('personal');
  const [source, setSource] = useState<SourceType>('manual');
  const [tags, setTags] = useState('');
  const [whySaved, setWhySaved] = useState('');
  const [verified, setVerified] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(null);
    try {
      const memory = await createMemory({
        statement,
        type,
        tier,
        importanceScore: importance,
        confidenceScore: confidence,
        sensitivityLevel: sensitivity,
        sourceType: source,
        whySaved,
        isVerifiedFact: verified,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      });
      setStatement('');
      setTags('');
      setWhySaved('');
      setSaved(memory.statement);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that memory');
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-5 space-y-4"
    >
      <div>
        <label className={labelClass} htmlFor="statement">What should be remembered</label>
        <textarea
          id="statement"
          value={statement}
          onChange={(event) => setStatement(event.target.value)}
          rows={3}
          required
          placeholder="e.g. Priya is the QA lead on the Northwind migration and reviews every release."
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="type">Type</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value as MemoryType)} className={fieldClass}>
            {MEMORY_TYPES.map((value) => (
              <option key={value} value={value}>{memoryTypeConfig[value].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="tier">Store as</label>
          <select id="tier" value={tier} onChange={(e) => setTier(e.target.value as MemoryTier)} className={fieldClass}>
            {CAPTURABLE_TIERS.map((value) => (
              <option key={value} value={value}>{TIER_LABELS[value]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="sensitivity">Sensitivity</label>
          <select
            id="sensitivity"
            value={sensitivity}
            onChange={(e) => setSensitivity(e.target.value as SensitivityLevel)}
            className={fieldClass}
          >
            {SENSITIVITIES.map((value) => (
              <option key={value} value={value}>{sensitivityConfig[value].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="source">Source</label>
          <select id="source" value={source} onChange={(e) => setSource(e.target.value as SourceType)} className={fieldClass}>
            {SOURCES.map((value) => (
              <option key={value} value={value}>{sourceTypeConfig[value].label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Importance — {importance}</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setImportance(value)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  value <= importance
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'bg-white/[0.03] text-slate-600 border border-white/[0.06]'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="confidence">Confidence — {confidence}%</label>
          <input
            id="confidence"
            type="range"
            min={0}
            max={100}
            step={5}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="tags">Tags (comma separated)</label>
        <input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="northwind, qa, release"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="why">Why is this worth remembering</label>
        <textarea
          id="why"
          value={whySaved}
          onChange={(e) => setWhySaved(e.target.value)}
          rows={2}
          placeholder="Optional context that stops future-you from wondering why this was saved."
          className={fieldClass}
        />
      </div>

      <label className="flex items-center gap-2.5 text-xs text-slate-400 cursor-pointer">
        <input
          type="checkbox"
          checked={verified}
          onChange={(e) => setVerified(e.target.checked)}
          className="w-4 h-4 accent-violet-500"
        />
        This is a verified fact, not an inference
      </label>

      {error && (
        <p className="flex items-center gap-2 text-xs text-red-400">
          <TriangleAlert size={13} /> {error}
        </p>
      )}
      {saved && (
        <p className="flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 size={13} /> Saved: {saved.slice(0, 90)}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !statement.trim()}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium disabled:opacity-40 hover:shadow-lg hover:shadow-violet-500/25 transition-all"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        Save to memory
      </button>
    </motion.form>
  );
}

const COMMITMENT_STATUSES: CommitmentStatus[] = ['pending', 'in_progress', 'completed', 'overdue', 'cancelled'];

function CommitmentForm() {
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('Me');
  const [dueDate, setDueDate] = useState('');
  const [relatedProject, setRelatedProject] = useState('');
  const [status, setStatus] = useState<CommitmentStatus>('pending');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(null);
    try {
      const commitment = await createCommitment({
        title,
        owner,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        relatedProject,
        status,
      });
      setTitle('');
      setDueDate('');
      setRelatedProject('');
      setSaved(commitment.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that commitment');
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-5 space-y-4"
    >
      <div>
        <label className={labelClass} htmlFor="commitment-title">What did you promise</label>
        <input
          id="commitment-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Send Nadia the revised migration checklist"
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="owner">Owner</label>
          <input id="owner" value={owner} onChange={(e) => setOwner(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="due">Due date</label>
          <input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="related">Related project</label>
          <input
            id="related"
            value={relatedProject}
            onChange={(e) => setRelatedProject(e.target.value)}
            placeholder="Northwind migration"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as CommitmentStatus)}
            className={fieldClass}
          >
            {COMMITMENT_STATUSES.map((value) => (
              <option key={value} value={value}>{value.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-2 text-xs text-red-400">
          <TriangleAlert size={13} /> {error}
        </p>
      )}
      {saved && (
        <p className="flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 size={13} /> Added: {saved}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !title.trim()}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-medium disabled:opacity-40 hover:shadow-lg hover:shadow-violet-500/25 transition-all"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
        Add commitment
      </button>
    </motion.form>
  );
}
