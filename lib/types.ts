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
  connectedPeople: string[]; // person IDs
  connectedProjects: string[]; // project IDs
  citations: SourceCitation[];
  whySaved: string;
  isVerifiedFact: boolean; // false = AI inference
  tags: string[];
}

export interface InboxSuggestion {
  id: string;
  suggestedStatement: string;
  type: MemoryType;
  importanceScore: ImportanceLevel;
  confidenceScore: number;
  sensitivityLevel: SensitivityLevel;
  whyAiWantsToSave: string;
  citations: SourceCitation[];
  connectedPeople: string[];
  connectedProjects: string[];
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
}

export interface Person {
  id: string;
  name: string;
  role: string;
  organization: string;
  email?: string;
  avatarInitials: string;
  avatarColor: string;
  relationshipContext: string;
  lastContacted: string;
  sharedProjects: string[];
  commitments: string[]; // commitment IDs
  notes: string;
  rememberedPreferences: string[];
  recentCommunication: {
    type: SourceType;
    summary: string;
    date: string;
  }[];
  citations: SourceCitation[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'planning';
  stakeholders: string[]; // person IDs
  goals: string[];
  recentUpdates: {
    date: string;
    summary: string;
    type: 'decision' | 'update' | 'milestone' | 'risk';
  }[];
  importantDecisions: string[]; // memory IDs
  linkedDocuments: {
    id: string;
    title: string;
    url?: string;
    date: string;
  }[];
  risks: string[];
  openQuestions: string[];
  nextActions: {
    id: string;
    title: string;
    owner?: string;
    dueDate?: string;
  }[];
  launchTarget?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  color: string;
}

export interface Commitment {
  id: string;
  title: string;
  description?: string;
  owner: string; // person name or "Me"
  ownerPersonId?: string;
  dueDate?: string;
  status: CommitmentStatus;
  relatedProject?: string; // project ID
  relatedProjectName?: string;
  evidence: SourceCitation[];
  reminderEnabled: boolean;
  reminderDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  type: SourceType;
  title: string;
  summary: string;
  date: string;
  connectedPeople: string[];
  connectedProjects: string[];
  memoryCreated: boolean;
  memoryId?: string;
  tags: string[];
  importance: ImportanceLevel;
  isExpanded?: boolean;
}

export interface DataSource {
  id: string;
  type: SourceType;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync?: string;
  itemCount: number;
  privacyLevel: 'full' | 'limited' | 'minimal';
  enabled: boolean;
  permissions: string[];
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

export interface DailyBrief {
  date: string;
  greeting: string;
  topInsights: string[];
  upcomingMeetings: {
    title: string;
    time: string;
    attendees: string[];
    prepNotes: string;
  }[];
  pendingCommitments: number;
  memoryHealthScore: number;
}
