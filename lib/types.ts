// ============================================================
// Personal AI Memory System — Core TypeScript Types
// ============================================================

export type MemoryType =
  | 'preference'
  | 'decision'
  | 'commitment'
  | 'person'
  | 'project'
  | 'meeting_summary'
  | 'research_insight'
  | 'temporary_context';

export type MemoryTier = 'working' | 'episodic' | 'long_term' | 'inbox' | 'ignored';

export type SensitivityLevel = 'public' | 'personal' | 'sensitive' | 'confidential';

export type SourceType = 'email' | 'calendar' | 'document' | 'conversation' | 'browser' | 'manual';

export type CommitmentStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export type ImportanceLevel = 1 | 2 | 3 | 4 | 5;

export interface SourceCitation {
  id: string;
  sourceType: SourceType;
  title: string;
  date: string; // ISO string
  url?: string;
  excerpt?: string;
  sourceId: string;
}

export interface Memory {
  id: string;
  statement: string;
  type: MemoryType;
  tier: MemoryTier;
  importanceScore: ImportanceLevel;
  confidenceScore: number; // 0–100
  sensitivityLevel: SensitivityLevel;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  sourceType: SourceType;
  connectedPeople: string[]; // person IDs
  connectedProjects: string[]; // project IDs
  citations: SourceCitation[];
  whySaved: string;
  isVerifiedFact: boolean; // false = AI inference
  tags: string[];
}

export interface Commitment {
  id: string;
  title: string;
  description?: string;
  owner: string;
  dueDate?: string;
  status: CommitmentStatus;
  relatedProject?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  // assistant only
  confidenceScore?: number;
  isFactBased?: boolean;
  relatedMemories?: Memory[];
  citations?: SourceCitation[];
  inferenceWarning?: string;
}
