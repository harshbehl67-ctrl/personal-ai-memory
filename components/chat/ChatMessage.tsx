'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, User, AlertTriangle, ExternalLink, Edit2, Trash2, Eye, CheckCircle } from 'lucide-react';
import { ChatMessage as ChatMessageType, Memory } from '@/lib/types';
import { formatTime, getConfidenceBg, getConfidenceColor } from '@/lib/utils';
import ConfidenceBadge from '@/components/memory/ConfidenceBadge';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  onEditMemory?: (memory: Memory) => void;
  onForgetMemory?: (memoryId: string) => void;
}

export default function ChatMessage({ message, onEditMemory, onForgetMemory }: ChatMessageProps) {
  const [expanded, setExpanded] = useState(false);
  const isAssistant = message.role === 'assistant';

  if (!isAssistant) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-violet-600/20 border border-violet-500/25 rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm text-slate-200 leading-relaxed">{message.content}</p>
          <p className="text-[10px] text-slate-600 mt-1 text-right">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* AI Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/25 mt-1">
        <Brain size={14} className="text-white" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-violet-300">Memory AI</span>
          {message.confidenceScore !== undefined && (
            <ConfidenceBadge score={message.confidenceScore} />
          )}
          {!message.isFactBased && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <AlertTriangle size={10} />
              AI Inference
            </span>
          )}
          {message.isFactBased && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle size={10} />
              Source Verified
            </span>
          )}
          <span className="text-[10px] text-slate-600 ml-auto">{formatTime(message.timestamp)}</span>
        </div>

        {/* Answer */}
        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl rounded-tl-sm p-4">
          {/* Inference warning */}
          {message.inferenceWarning && (
            <div className="flex items-start gap-2 mb-3 p-3 rounded-lg bg-amber-500/[0.08] border border-amber-500/20">
              <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300 leading-relaxed">{message.inferenceWarning}</p>
            </div>
          )}

          {/* Content - rendered as markdown-ish */}
          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line prose-custom">
            {message.content.split('\n').map((line, i) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="font-semibold text-white mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
              }
              if (line.startsWith('- ') || line.startsWith('✅ ') || line.startsWith('🔄 ') || line.startsWith('⚠️ ') || line.startsWith('📋 ') || line.startsWith('📅 ') || line.startsWith('💡 ')) {
                return <p key={i} className="text-slate-300 ml-2">{line}</p>;
              }
              if (line.startsWith('> ')) {
                return <p key={i} className="text-slate-400 italic text-xs border-l-2 border-violet-500/40 pl-3 my-1">{line.slice(2)}</p>;
              }
              return line ? <p key={i}>{line}</p> : <br key={i} />;
            })}
          </div>
        </div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-wide font-medium mb-1.5">Source Citations</p>
            <div className="flex flex-wrap gap-1.5">
              {message.citations.map((citation) => (
                <div
                  key={citation.id}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-violet-500/30 cursor-pointer transition-colors group"
                >
                  <span className="text-[11px]">
                    {citation.sourceType === 'email' ? '✉️' :
                     citation.sourceType === 'calendar' ? '📅' :
                     citation.sourceType === 'document' ? '📄' :
                     citation.sourceType === 'browser' ? '🌐' : '💬'}
                  </span>
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-300 max-w-[180px] truncate">
                    {citation.title}
                  </span>
                  <ExternalLink size={9} className="text-slate-600 group-hover:text-violet-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related memories */}
        {message.relatedMemories && message.relatedMemories.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wide font-medium hover:text-slate-300 transition-colors"
            >
              <span>{expanded ? '▼' : '▶'}</span>
              {message.relatedMemories.length} Related Memories
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-2 space-y-2"
                >
                  {message.relatedMemories.map((mem) => (
                    <div key={mem.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] group/mem">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 leading-relaxed">{mem.statement}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{mem.type} · {mem.confidenceScore}% confidence</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/mem:opacity-100 transition-opacity shrink-0">
                        {onEditMemory && (
                          <button onClick={() => onEditMemory(mem)} className="p-1 rounded text-slate-500 hover:text-blue-400 transition-colors">
                            <Edit2 size={12} />
                          </button>
                        )}
                        {onForgetMemory && (
                          <button onClick={() => onForgetMemory(mem.id)} className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
