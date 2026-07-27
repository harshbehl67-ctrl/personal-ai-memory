'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, ArrowRight, MessageSquare } from 'lucide-react';
import { ChatMessage as ChatMessageType, Memory } from '@/lib/types';
import { chatResponses, suggestedQuestions } from '@/lib/demo-data/chat-responses';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { sleep } from '@/lib/utils';

let msgId = 1;
function makeId() { return `msg-${msgId++}-${Date.now()}`; }

export default function AskMemoryPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your Personal AI Memory assistant. I have access to your emails, meetings, documents, and browsing history to give you accurate, cited answers.\n\nTry asking me something, or pick one of the suggested questions below.",
      timestamp: new Date().toISOString(),
      confidenceScore: 100,
      isFactBased: true,
      citations: [],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    const userMsg: ChatMessageType = {
      id: makeId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    await sleep(1200 + Math.random() * 800);

    // Find matching response or generate generic one
    const matched = Object.entries(chatResponses).find(([key]) =>
      text.toLowerCase().includes(key.toLowerCase().slice(0, 20)) ||
      key.toLowerCase().includes(text.toLowerCase().slice(0, 20))
    );

    const responseData = matched
      ? matched[1]
      : {
          content: `I searched your memory for "${text}" but couldn't find a direct match in my demo data. In the full version, I'd search across all your connected sources — emails, meetings, documents, and browser history — to give you a cited answer.\n\nTry one of the suggested questions to see the full experience.`,
          confidenceScore: 45,
          isFactBased: false,
          relatedMemories: [] as Memory[],
          citations: [],
          inferenceWarning: "This is a demo response — the full AI would search your actual connected sources.",
        };

    const assistantMsg: ChatMessageType = {
      id: makeId(),
      role: 'assistant',
      content: responseData.content,
      timestamp: new Date().toISOString(),
      confidenceScore: responseData.confidenceScore,
      isFactBased: responseData.isFactBased,
      relatedMemories: responseData.relatedMemories as Memory[],
      citations: responseData.citations,
      inferenceWarning: responseData.inferenceWarning,
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);
  };

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
              <p className="text-xs text-slate-500">AI answers with citations from your connected sources</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            5 sources active
          </div>
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

          {/* Loading indicator */}
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
                <span className="text-xs text-slate-500">Searching your memory...</span>
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

      {/* Suggested questions (only shown when at start) */}
      {messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pb-4"
        >
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] text-slate-600 uppercase tracking-wide font-medium mb-3">Try asking...</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedQuestions.map((q) => (
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
