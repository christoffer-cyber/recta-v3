'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Scenario } from '@/lib/types';
import { ScenarioButtons } from './chat/ScenarioButtons';
import { LoadingAnimation } from './LoadingAnimation';

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
  onGenerateReport?: () => void;
  scenarios?: Scenario[];
  onScenarioSelect?: (scenario: Scenario) => void;
  isGeneratingScenarios?: boolean;
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
    isActionPlan = false,
    onGenerateReport,
    scenarios,
    onScenarioSelect,
    isGeneratingScenarios = false
  },
  scrollContainerRef
) {
  const [input, setInput] = useState('');
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
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

  // Phase Summary Component (collapsed view)
  const PhaseSummary = ({ 
    phaseName, 
    messageCount, 
    isExpanded, 
    onToggle 
  }: { 
    phaseName: string; 
    messageCount: number; 
    isExpanded: boolean; 
    onToggle: () => void;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 border border-gray-700 rounded-lg bg-gray-800/50 overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-green-500 text-sm">✓</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-200">{phaseName} - Klar</div>
            <div className="text-xs text-gray-500">{messageCount} meddelanden</div>
          </div>
        </div>
        <div className="text-gray-400">
          {isExpanded ? '▲' : '▼'}
        </div>
      </button>
    </motion.div>
  );

  // Group messages by phase with improved detection
  const groupMessagesByPhase = () => {
    const phases: Array<{
      name: string;
      messages: Message[];
      isComplete: boolean;
    }> = [];

    let currentPhaseMessages: Message[] = [];
    let currentPhaseName = 'Context';

    messages.forEach((msg) => {
      // Detect phase transitions by looking for welcome messages
      if (msg.role === 'assistant' && msg.content.includes('BÖRJAR')) {
        // Save previous phase BEFORE adding transition message
        if (currentPhaseMessages.length > 0) {
          phases.push({
            name: currentPhaseName,
            messages: [...currentPhaseMessages],
            isComplete: true
          });
          currentPhaseMessages = [];
        }

        // Detect new phase name BEFORE adding message
        if (msg.content.includes('Problem Discovery')) {
          currentPhaseName = 'Problem Discovery';
        } else if (msg.content.includes('Solution Design')) {
          currentPhaseName = 'Solution Design';
        } else if (msg.content.includes('Action Plan')) {
          currentPhaseName = 'Action Plan';
        }
        
        // NOW add the transition message to the NEW phase
        currentPhaseMessages.push(msg);
      } else {
        // Regular message - add to current phase
        currentPhaseMessages.push(msg);
      }
    });

    // Add current phase (incomplete)
    if (currentPhaseMessages.length > 0) {
      phases.push({
        name: currentPhaseName,
        messages: currentPhaseMessages,
        isComplete: false
      });
    }

    return phases;
  };

  const phaseGroups = groupMessagesByPhase();
  const currentPhaseIndex = phaseGroups.length - 1;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-300">AI Coach</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth" style={{ minHeight: 0 }}>
        {phaseGroups.map((phase, phaseIndex) => {
          const isCurrentPhase = phaseIndex === currentPhaseIndex;
          const isCollapsed = !isCurrentPhase && collapsedPhases.has(phase.name);
          const shouldAutoCollapse = !isCurrentPhase && phase.isComplete;

          // Auto-collapse completed phases on mount
          if (shouldAutoCollapse && !collapsedPhases.has(phase.name)) {
            setCollapsedPhases(prev => new Set(prev).add(phase.name));
          }

          return (
            <div key={phaseIndex} className="space-y-4">
              {/* Show phase summary if completed and collapsed */}
              {shouldAutoCollapse && isCollapsed && (
                <PhaseSummary
                  phaseName={phase.name}
                  messageCount={phase.messages.length}
                  isExpanded={false}
                  onToggle={() => {
                    setCollapsedPhases(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(phase.name);
                      return newSet;
                    });
                  }}
                />
              )}

              {/* Show phase summary expanded header if completed and expanded */}
              {shouldAutoCollapse && !isCollapsed && (
                <PhaseSummary
                  phaseName={phase.name}
                  messageCount={phase.messages.length}
                  isExpanded={true}
                  onToggle={() => {
                    setCollapsedPhases(prev => new Set(prev).add(phase.name));
                  }}
                />
              )}

              {/* Show messages if current phase OR expanded */}
              {(isCurrentPhase || !isCollapsed) && (
                <AnimatePresence initial={false}>
                  {phase.messages.map((message, index) => (
                    <motion.div
                      key={`${phaseIndex}-${index}`}
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
                        <div className="space-y-2">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Du</span>
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">AI Coach</span>
                          <div className="text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none
                            prose-p:text-gray-300 prose-p:leading-relaxed
                            prose-strong:text-gray-100 prose-strong:font-semibold
                            prose-ul:text-gray-300 prose-li:text-gray-300
                            prose-h2:text-gray-100 prose-h2:text-base prose-h2:font-semibold prose-h2:mb-2 prose-h2:mt-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                            
                            {/* Show scenario buttons if message contains scenarios trigger phrase */}
                            {message.content.includes('3 möjliga lösningsvägar') && scenarios && scenarios.length > 0 && onScenarioSelect && (
                              <ScenarioButtons 
                                scenarios={scenarios} 
                                onSelect={onScenarioSelect}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && !isGeneratingScenarios && (
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

        {/* Scenario generation loading */}
        {isGeneratingScenarios && (
          <LoadingAnimation message="Analyserar möjliga lösningar..." />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Phase Complete Button */}
      {phaseComplete && onAdvancePhase && !isActionPlan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-3 flex-shrink-0"
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
          className="px-4 pb-3 flex-shrink-0"
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

      {/* Generate Report Button (Action Plan only) */}
      {phaseComplete && isActionPlan && onGenerateReport && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-3 flex-shrink-0"
        >
          <button
            onClick={onGenerateReport}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Genererar rapport...</span>
              </>
            ) : (
              <>
                <span>📊 Generera Full Rapport</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-800 flex-shrink-0">
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
