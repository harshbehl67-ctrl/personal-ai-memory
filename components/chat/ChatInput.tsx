'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, isLoading, placeholder = "Ask anything about your memory..." }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [value]);

  const handleSend = () => {
    if (value.trim() && !isLoading) {
      onSend(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      <div className={cn(
        'flex items-end gap-3 p-3 rounded-2xl border transition-all duration-200',
        'bg-white/[0.03] border-white/[0.08] focus-within:border-violet-500/40 focus-within:bg-white/[0.05] focus-within:shadow-lg focus-within:shadow-violet-500/10'
      )}>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none resize-none leading-relaxed py-1.5 min-h-[36px] max-h-[160px]"
        />

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSend}
            disabled={!value.trim() || isLoading}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
              value.trim() && !isLoading
                ? 'bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105'
                : 'bg-white/[0.05] text-slate-600 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
      </div>
      <p className="text-[10px] text-slate-700 text-center mt-2">
        Press <kbd className="font-mono bg-white/[0.05] px-1 rounded text-slate-600">Enter</kbd> to send · 
        <kbd className="font-mono bg-white/[0.05] px-1 rounded text-slate-600 ml-1">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
