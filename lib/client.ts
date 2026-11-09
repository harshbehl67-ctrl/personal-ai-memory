'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Commitment, Memory, MemoryTier, MemoryType, SensitivityLevel, SourceType } from './types';

export interface Stats {
  total: number;
  addedThisWeek: number;
  pendingInbox: number;
  verifiedShare: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
}

export interface SystemInfo {
  stats: Stats;
  databasePath: string;
  ai: { provider: string; model: string; baseUrl: string; hasApiKey: boolean };
}

export interface MemoryFilter {
  type?: MemoryType;
  tier?: MemoryTier;
  source?: SourceType;
  q?: string;
  limit?: number;
}

export interface NewMemory {
  statement: string;
  type: MemoryType;
  tier?: MemoryTier;
  importanceScore?: number;
  confidenceScore?: number;
  sensitivityLevel?: SensitivityLevel;
  sourceType?: SourceType;
  whySaved?: string;
  isVerifiedFact?: boolean;
  tags?: string[];
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  return body as T;
}

function useResource<T>(url: string) {
  const [state, setState] = useState<{ data: T | null; error: string | null }>({ data: null, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    request<T>(url)
      .then((value) => { if (active) setState({ data: value, error: null }); })
      .catch((err: Error) => { if (active) setState((prev) => ({ data: prev.data, error: err.message })); });
    return () => { active = false; };
  }, [url, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return {
    data: state.data,
    loading: state.data === null && state.error === null,
    error: state.error,
    reload,
  };
}

function toQuery(filter: MemoryFilter): string {
  const sp = new URLSearchParams();
  if (filter.type) sp.set('type', filter.type);
  if (filter.tier) sp.set('tier', filter.tier);
  if (filter.source) sp.set('source', filter.source);
  if (filter.q) sp.set('q', filter.q);
  if (filter.limit) sp.set('limit', String(filter.limit));
  return sp.toString();
}

export function useMemories(filter: MemoryFilter = {}) {
  const { data, loading, error, reload } = useResource<{ memories: Memory[] }>(`/api/memories?${toQuery(filter)}`);
  return { data: data?.memories ?? null, loading, error, reload };
}

export function useCommitments() {
  const { data, loading, error, reload } = useResource<{ commitments: Commitment[] }>('/api/commitments');
  return { data: data?.commitments ?? null, loading, error, reload };
}

export function useStats() {
  const { data, loading, error, reload } = useResource<SystemInfo>('/api/stats');
  return { data: data?.stats ?? null, loading, error, reload };
}

export function useSystemInfo() {
  return useResource<SystemInfo>('/api/stats');
}

export interface DataExport {
  exportedAt: string;
  memories: Memory[];
  commitments: Commitment[];
}

export async function exportData(): Promise<DataExport> {
  return request<DataExport>('/api/data');
}

export async function deleteAllData(): Promise<void> {
  await request('/api/data', { method: 'DELETE' });
}

export interface ImportResult {
  imported: Memory[];
  duplicates: number;
  rejected: number;
  partialError: string | null;
  source: string;
  sourceType: SourceType;
  pages: number | null;
  characters: number;
  processed: number;
}

/** Sends pasted text or a chosen file to the extractor. Exactly one of the two is needed. */
export async function importSource(input: {
  text?: string;
  file?: File | null;
  sourceType?: SourceType;
}): Promise<ImportResult> {
  const form = new FormData();
  if (input.file) form.append('file', input.file);
  if (input.text?.trim()) form.append('text', input.text);
  if (input.sourceType) form.append('sourceType', input.sourceType);
  // No Content-Type here: the browser has to set the multipart boundary itself.
  return request<ImportResult>('/api/import', { method: 'POST', body: form });
}

export async function createMemory(input: NewMemory): Promise<Memory> {
  const body = await request<{ memory: Memory }>('/api/memories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return body.memory;
}

export async function updateMemory(id: string, patch: Partial<NewMemory>): Promise<Memory> {
  const body = await request<{ memory: Memory }>(`/api/memories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return body.memory;
}

export async function deleteMemory(id: string): Promise<void> {
  await request(`/api/memories/${id}`, { method: 'DELETE' });
}

export async function createCommitment(input: {
  title: string; description?: string; owner?: string; dueDate?: string; relatedProject?: string;
  status?: Commitment['status'];
}): Promise<Commitment> {
  const body = await request<{ commitment: Commitment }>('/api/commitments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return body.commitment;
}

export async function updateCommitment(id: string, patch: {
  status?: Commitment['status']; title?: string; dueDate?: string | null;
}): Promise<Commitment> {
  const body = await request<{ commitment: Commitment }>(`/api/commitments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return body.commitment;
}
