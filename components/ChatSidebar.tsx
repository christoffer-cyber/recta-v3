'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/lib/types';

interface ChatSidebarProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  phaseComplete?: boolean;
  onAdvancePhase?: () => void;
  nextPhaseName?: string;
  onGenerateDeliverables?: () => void;
  isGenerating?: boolean;
  isActionPlan?: boolean;
}

export const ChatSidebar = forwardRef<HTMLDivElement, ChatSidebarProps>(function ChatSidebar(
  { 
    messages, 
    onSendMessage, 
    isLoading,
    phaseComplete = false,
    onAdvancePhase,
    nextPhaseName = 'nästa fas',
    onGenerateDeliverables,
    isGenerating = false,
    isActionPlan = false
  },
  scrollContainerRef
) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const internalScrollRef = useRef<HTMLDivElement>(null);
  
  // Use external ref if provided, otherwise use internal
  const scrollRef = scrollContainerRef || internalScrollRef;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show only last 6 messages
  const visibleMessages = messages.slice(-6);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-300">AI Coach</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
        <AnimatePresence initial={false}>
          {visibleMessages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: message.role === 'user' ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ 
                type: 'spring',
                stiffness: 400,
                damping: 30
              }}
            >
              {message.role === 'user' ? (
                // User message: Structured card (NOT bubble)
                <div className="w-full">
                  <div className="text-xs text-gray-300 mb-1.5 font-medium">DU</div>
                  <div className="bg-gray-800 border border-gray-700 px-4 py-2.5 rounded text-sm text-gray-100">
                    {message.content}
                  </div>
                </div>
              ) : (
                // AI message: Full-width markdown
                <div className="w-full">
                  <div className="text-xs text-gray-400 mb-1.5 font-medium">AI COACH</div>
                  <div className="prose prose-invert prose-sm max-w-none text-gray-100 [&>*]:text-gray-100 [&>p]:text-gray-100 [&>ul]:text-gray-100 [&>ol]:text-gray-100 [&>li]:text-gray-100 [&>h1]:text-gray-100 [&>h2]:text-gray-100 [&>h3]:text-gray-100 [&>strong]:text-gray-100 [&>em]:text-gray-100">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-300 text-sm"
          >
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Tänker...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Phase Complete Button */}
      {phaseComplete && onAdvancePhase && !isActionPlan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-3"
        >
          <button
            onClick={onAdvancePhase}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>Fortsätt till {nextPhaseName}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Generate Deliverables Button (Action Plan only) */}
      {phaseComplete && isActionPlan && onGenerateDeliverables && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-3"
        >
          <button
            onClick={onGenerateDeliverables}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Genererar deliverables...</span>
              </>
            ) : (
              <>
                <span>📦 Generera Alla Deliverables</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              phaseComplete 
                ? "Fas klar - klicka 'Fortsätt' ovan ⬆️" 
                : "Skriv ditt meddelande..."
            }
            disabled={isLoading || phaseComplete}
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || phaseComplete}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Skicka
          </button>
        </div>
      </div>
    </div>
  );
});
