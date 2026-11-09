'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, ArrowRight, MessageSquare } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import { useMemories, useStats } from '@/lib/client';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import EmptyState from '@/components/ui/empty-state';

let msgId = 1;
function makeId() { return `msg-${msgId++}-${Date.now()}`; }

type ChatPayload = {
  content?: string;
  relatedMemories?: ChatMessageType['relatedMemories'];
  citations?: ChatMessageType['citations'];
  confidenceScore?: number;
  isFactBased?: boolean;
  inferenceWarning?: string;
  error?: string;
};

export default function AskMemoryPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "I answer only from the memories you have captured. Ask me something, or save something new first and I will use it.",
      timestamp: new Date().toISOString(),
      citations: [],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recent = useMemories({ limit: 50 });
  const stats = useStats();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestions = useMemo(() => {
    const tags = new Map<string, number>();
    for (const memory of recent.data ?? []) {
      for (const tag of memory.tags) tags.set(tag, (tags.get(tag) ?? 0) + 1);
    }
    const top = [...tags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    const questions = top.map(([tag]) => `What do I know about ${tag}?`);
    if ((stats.data?.byType.commitment ?? 0) > 0) questions.push('What have I promised that is still open?');
    if ((stats.data?.pendingInbox ?? 0) > 0) questions.push('What is waiting for me in the inbox?');
    return questions.slice(0, 4);
  }, [recent.data, stats.data]);

  const handleSend = async (text: string) => {
    const userMsg: ChatMessageType = {
      id: makeId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      const payload = (await res.json()) as ChatPayload;

      const assistantMsg: ChatMessageType = res.ok && payload.content
        ? {
            id: makeId(),
            role: 'assistant',
            content: payload.content,
            timestamp: new Date().toISOString(),
            confidenceScore: payload.confidenceScore ?? 0,
            isFactBased: payload.isFactBased ?? false,
            relatedMemories: payload.relatedMemories ?? [],
            citations: payload.citations ?? [],
            inferenceWarning: payload.inferenceWarning,
          }
        : {
            id: makeId(),
            role: 'assistant',
            content: payload.error
              ? `The memory service could not answer: ${payload.error}`
              : 'The memory service returned no answer.',
            timestamp: new Date().toISOString(),
            confidenceScore: 0,
            isFactBased: false,
            citations: [],
            inferenceWarning: 'Nothing was stored or retrieved for this question.',
          };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: makeId(),
        role: 'assistant',
        content: error instanceof Error ? `Request failed: ${error.message}` : 'Request failed.',
        timestamp: new Date().toISOString(),
        confidenceScore: 0,
        isFactBased: false,
        citations: [],
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasMemories = (stats.data?.total ?? 0) > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">Ask Memory</h1>
              <p className="text-xs text-slate-500">
                Grounded answers from the {stats.data?.total ?? 0} memories you have captured
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/capture"
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1.5"
          >
            Capture something <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChatMessage message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shrink-0">
                <Brain size={14} className="text-white" />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.025] border border-white/[0.06]">
                <Sparkles size={12} className="text-violet-400 animate-pulse" />
                <span className="text-xs text-slate-500">Searching your memories...</span>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-violet-400"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggestions or first-run prompt */}
      {messages.length <= 1 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-6 pb-4">
          <div className="max-w-4xl mx-auto">
            {hasMemories && suggestions.length > 0 ? (
              <>
                <p className="text-[11px] text-slate-600 uppercase tracking-wide font-medium mb-3">
                  Try asking about what you stored
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs text-slate-400 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-violet-500/30 hover:text-slate-200 transition-all duration-200"
                    >
                      <MessageSquare size={13} className="text-slate-600 group-hover:text-violet-400 shrink-0" />
                      {q}
                      <ArrowRight size={11} className="text-slate-700 group-hover:text-violet-400 ml-auto shrink-0" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                title="Your memory store is empty"
                hint="Nothing here is simulated — the assistant can only answer from memories you capture yourself."
                actionLabel="Capture your first memory"
              />
            )}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="shrink-0 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
