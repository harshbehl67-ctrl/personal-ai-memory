import { ChatMessage } from '../types';
import { memories } from './memories';

// Seeded Q&A pairs for the Ask Memory interface
export interface ChatQA {
  question: string;
  answer: ChatMessage;
}

export const suggestedQuestions = [
  "What did I promise Alex about the product launch?",
  "Summarize the key architectural decisions we've made.",
  "What should I know before tomorrow's client call?",
  "What have I learned about AI memory systems?",
  "Who are the key people on Project Aurora?",
  "What are my open commitments this week?",
];

export const chatResponses: Record<string, Omit<ChatMessage, 'id' | 'timestamp' | 'role'>> = {
  "What did I promise Alex about the product launch?": {
    content: `Based on your email history and meeting notes, here's what you've committed to Alex regarding the product launch:

**Active Commitment (⚠️ Overdue)**
You promised to send Alex a **client portal proposal by Friday, July 26**. Alex has already sent a follow-up email on July 25 noting it's overdue. This is blocking the Aurora launch planning.

**Other Aurora Commitments**
- Review and sign off on the Aurora go-to-market plan (due Aug 15)
- Share Q2 metrics summary with Alex before the board meeting (due Aug 5)

**Project Context**
Project Aurora has a confirmed September 15 launch date. Alex is the product manager and primary decision-maker. He prefers structured bullet summaries and is data-driven.`,
    confidenceScore: 97,
    isFactBased: true,
    relatedMemories: [memories[2], memories[3], memories[5]],
    citations: [
      {
        id: 'chat-src-1',
        sourceType: 'email',
        title: 'Re: Product Launch Timeline — Alex Chen',
        date: '2026-07-24T09:15:00Z',
        excerpt: '"Can you send over the proposal by Friday? The client is expecting it."',
        sourceId: 'email-001',
      },
      {
        id: 'chat-src-2',
        sourceType: 'email',
        title: 'Follow-up: Proposal for Client Portal',
        date: '2026-07-25T17:45:00Z',
        excerpt: '"Just circling back — the proposal was due today. Any update?"',
        sourceId: 'email-003',
      },
    ],
  },
  "Summarize the key architectural decisions we've made.": {
    content: `Here are the key technical decisions made for the Personal AI Memory System:

**Database & Storage**
✅ **PostgreSQL + pgvector** selected for vector storage (over Weaviate and Pinecone). Jordan's benchmarks showed 87ms p95 latency on 1M vectors — within target. Simpler operational model given existing Postgres expertise.

**Retrieval Strategy**
✅ **Hybrid retrieval (BM25 + vector search)** approved as the core search strategy. You and Jordan discussed this in the Slack engineering channel on July 22.

**Privacy Architecture**
🔄 On-device embedding for non-sensitive data, encrypted cloud sync for cross-device memory. Risk flagged: latency on older hardware — investigating hybrid cloud/on-device approach.

**ML Classification**
✅ Memory tier classifier v0.2 achieves **89% accuracy** (target was 85%). Main confusion area: episodic vs. long-term tier boundary.`,
    confidenceScore: 94,
    isFactBased: true,
    relatedMemories: [memories[1], memories[10], memories[11]],
    citations: [
      {
        id: 'chat-src-3',
        sourceType: 'calendar',
        title: 'Design Review Meeting — Project Aurora',
        date: '2026-07-22T14:00:00Z',
        excerpt: 'Team agreed to use PostgreSQL with pgvector for the vector storage layer.',
        sourceId: 'meeting-001',
      },
      {
        id: 'chat-src-4',
        sourceType: 'document',
        title: 'Personal AI Memory — Architecture Spec v1.3',
        date: '2026-07-20T11:00:00Z',
        excerpt: 'Section 4.2: Long-term memory persistence via pgvector with hybrid BM25 retrieval.',
        sourceId: 'doc-001',
      },
    ],
  },
  "What should I know before tomorrow's client call?": {
    content: `Here's a briefing for your next client interaction, likely with **Dr. Priya Chen** (Apex Health):

**Who is Dr. Chen?**
Chief Medical Officer at Apex Health Systems. Extremely compliance-focused. Key things she cares about:
- ⚠️ **HIPAA compliance is non-negotiable** — zero data retention policy required
- 📋 **Everything in writing** — no verbal commitments
- 📅 **24-hour notice for agendas** — send it before the meeting!

**Open Items from Last Meeting (July 23)**
- Jordan is designing the zero-retention memory architecture (due Aug 10)
- You need to submit the Epic EHR API access request (due July 31)
- Draft Statement of Work for the Apex pilot is pending (due Aug 5)

**Risk to Mention**
The legacy CRM integration may take 2–3 additional weeks. This is worth flagging proactively rather than letting it surface as a surprise.

> ⚠️ *Confidence note: I assumed "client call" refers to Dr. Chen based on recency. If this is a different client, let me know.*`,
    confidenceScore: 81,
    isFactBased: false,
    inferenceWarning: "I inferred this is about Dr. Priya Chen based on your most recent client interaction. Please confirm if this is about a different client.",
    relatedMemories: [memories[6], memories[13]],
    citations: [
      {
        id: 'chat-src-5',
        sourceType: 'calendar',
        title: 'Client Onboarding Call — Dr. Priya Chen',
        date: '2026-07-23T11:00:00Z',
        excerpt: 'Dr. Chen emphasized HIPAA compliance and zero-retention data policies.',
        sourceId: 'meeting-002',
      },
    ],
  },
  "What have I learned about AI memory systems?": {
    content: `Based on your research browsing, documents, and conversations over the past 2 weeks, here's what you've learned about AI memory systems:

**Architecture & Retrieval**
- Hybrid retrieval (BM25 + dense vectors) consistently outperforms either approach alone
- pgvector offers the simplest operational model when PostgreSQL is already in use
- On-device embedding reduces privacy exposure but has latency tradeoffs on older hardware

**Privacy & Trust**
- Differential privacy and on-device processing are considered foundational for user trust
- Federated learning + local embeddings can reduce data exposure by ~94% per research you read
- Zero-retention architecture is viable but conflicts with persistent memory features — requires careful UX design

**Memory Classification**
- The core challenge is the episodic vs. long-term tier boundary (your model's main confusion area)
- Memory importance scoring benefits from multi-signal input (recency, source authority, frequency of reference)
- User control over memory classification significantly increases trust

> 💡 *This summary is partially inferred from your research patterns. Individual facts are source-backed.*`,
    confidenceScore: 79,
    isFactBased: false,
    inferenceWarning: "Some insights are synthesized from your browsing patterns and may reflect the framing of sources you read rather than your own conclusions.",
    relatedMemories: [memories[4], memories[11]],
    citations: [
      {
        id: 'chat-src-6',
        sourceType: 'browser',
        title: 'Privacy-First AI Systems — Research Paper Summary',
        date: '2026-07-19T14:20:00Z',
        sourceId: 'browser-002',
      },
      {
        id: 'chat-src-7',
        sourceType: 'browser',
        title: 'Pinecone vs Weaviate vs pgvector — Comparison Guide',
        date: '2026-07-21T16:45:00Z',
        sourceId: 'browser-001',
      },
    ],
  },
};
