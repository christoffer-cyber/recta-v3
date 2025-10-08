'use client';

import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { ChatSidebar } from '@/components/ChatSidebar';
import { Canvas } from '@/components/Canvas';
import { Message } from '@/lib/types';
import { getPhaseConfig } from '@/lib/phase-config';
import { deduplicateInsights } from '@/lib/insight-utils';
import type { CanvasState, PhaseVisualization } from '@/lib/canvas-types';
import type { JobDescription, CompensationAnalysis, InterviewQuestions, SuccessPlan, DeliverableType } from '@/lib/deliverable-schemas';

// Get phase-specific wrap-up message
function getPhaseWrapUpMessage(phaseName: string): string {
  const phaseMessages: Record<string, string> = {
    'Context': `Perfekt! Nu har vi en tydlig bild av er situation.

**Sammanfattning:**
Vi förstår nu ert företag, er roll-behov och era mål.

Är du redo att gå vidare till **Problem Discovery** där vi identifierar rotorsaken till utmaningarna?`,

    'Problem Discovery': `Utmärkt! Nu förstår vi problemet bakom behovet.

**Sammanfattning:**
Vi har identifierat de verkliga utmaningarna och varför ni behöver denna person just nu.

Är du redo att gå vidare till **Solution Design** där vi utforskar lösningar?`,

    'Solution Design': `Bra jobbat! Nu har vi flera lösningsalternativ.

**Sammanfattning:**
Vi har kartlagt möjliga vägar framåt och vad som passar er bäst.

Är du redo att gå vidare till **Action Plan** där vi skapar en konkret handlingsplan?`,

    'Action Plan': `Fantastiskt! Nu har vi allt vi behöver.

**Sammanfattning:**
Vi har en komplett strategi för hur ni går vidare.

Nu kan vi skapa era deliverables!`
  };

  // Extract phase name (e.g., "Context - Förstår er situation" → "Context")
  const basePhase = phaseName.split(' - ')[0];
  return phaseMessages[basePhase] || phaseMessages['Context'];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Välkommen till Recta! 👋\n\nJag hjälper dig att bygga en **strategisk rekryteringsplan**.\n\nLåt oss börja med att förstå er situation:\n\n- Hur många är ni i företaget?\n- Vilken roll letar ni efter?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Canvas state
  const [canvasState, setCanvasState] = useState<CanvasState>('phase-progress');
  const [canvasData, setCanvasData] = useState<{
    phaseViz?: PhaseVisualization;
    isNewPhase?: boolean;
  }>({
    phaseViz: {
      currentPhase: 'Context - Förstår er situation',
      completedPhases: [],
      insights: [],
      confidence: 0
    },
    isNewPhase: true // First load is new phase
  });

  const [deliverables, setDeliverables] = useState<{
    jobDescription?: JobDescription;
    compensation?: CompensationAnalysis;
    interviewQuestions?: InterviewQuestions;
    successPlan?: SuccessPlan;
  }>({});

  // Scroll preservation ref
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const previousHeightRef = useRef<number>(0);

  // Preserve scroll position when canvas updates
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const currentHeight = container.scrollHeight;
    const heightDiff = currentHeight - previousHeightRef.current;

    // If content added and user was scrolled up, maintain position
    if (heightDiff > 0 && container.scrollTop > 0) {
      const wasNearBottom = 
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (!wasNearBottom) {
        // User was reading up, preserve position
        container.scrollTop += heightDiff;
      }
    }

    previousHeightRef.current = currentHeight;
  }, [canvasData]);

  const currentPhase = canvasData.phaseViz?.currentPhase || 'Context';
  const phaseComplete = (canvasData.phaseViz?.confidence || 0) >= 100;
  const phaseConfig = getPhaseConfig(currentPhase);
  const isActionPlan = currentPhase.toLowerCase().includes('action');

  // Helper to get clean phase ID for API
  const getCurrentPhaseId = (): string => {
    const phaseMap: Record<string, string> = {
      'Context': 'Context',
      'Problem Discovery': 'Problem Discovery',
      'Solution Design': 'Solution Design',
      'Action Plan': 'Action Plan'
    };
    
    const currentPhaseText = canvasData.phaseViz?.currentPhase || 'Context';
    const phaseName = currentPhaseText.split(' - ')[0].trim();
    
    return phaseMap[phaseName] || 'Context';
  };

  const handleAdvancePhase = () => {
    if (!phaseConfig?.nextPhase) return;

    // Get next phase config
    const nextConfig = getPhaseConfig(phaseConfig.nextPhase);
    if (!nextConfig) return;

    // KEEP existing messages and ADD welcome message
    const welcomeMessage: Message = {
      role: 'assistant',
      content: nextConfig.welcomeMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, welcomeMessage]);  // ← APPEND, don't replace!

    // Update canvas to show new phase
    setCanvasData({
      phaseViz: {
        currentPhase: `${nextConfig.name} - ${
          nextConfig.id === 'problem-discovery' ? 'Identifierar utmaningar' : 
          nextConfig.id === 'solution-design' ? 'Utforskar lösningar' : 
          'Skapar action plan'
        }`,
        completedPhases: [...(canvasData.phaseViz?.completedPhases || []), phaseConfig.name],
        insights: [],  // ← Clear insights for fresh start
        confidence: 0  // Reset confidence for new phase
      },
      isNewPhase: true // Mark as new phase
    });
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          existingInsights: canvasData.phaseViz?.insights || [],
          currentConfidence: canvasData.phaseViz?.confidence || 0,
          currentPhase: getCurrentPhaseId(),
          isNewPhase: canvasData.isNewPhase || false
        })
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        role: 'assistant',
        content: data.message || 'Tack för informationen!',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Deduplicate insights with improved algorithm
      const currentInsights = canvasData.phaseViz?.insights || [];
      const incomingInsights = data.insights || [];
      const deduplicatedInsights = deduplicateInsights(currentInsights, incomingInsights);
      
      // Use confidence from API (quality-based, not hardcoded)
      const oldConfidence = canvasData.phaseViz?.confidence || 0;
      const newConfidence = data.confidence ?? oldConfidence;
      
          // Update canvas state
          setCanvasData(prev => ({
            ...prev,
            phaseViz: {
              ...prev.phaseViz!,
              insights: deduplicatedInsights,
              confidence: newConfidence
            },
            isNewPhase: false // Clear after first message
          }));
      
      // Check if we just crossed 100% threshold
      const justReached100 = newConfidence >= 100 && oldConfidence < 100;
      
      if (justReached100) {
        console.log('[Wrap-up] Confidence reached 100%, adding wrap-up message');
        
        // Always add wrap-up message when hitting 100%
        // Use phase-specific message
        const currentPhase = canvasData.phaseViz?.currentPhase || 'Context';
        const wrapUpContent = getPhaseWrapUpMessage(currentPhase);
        
        // Add wrap-up after a brief delay to feel natural
        setTimeout(() => {
          const wrapUpMessage: Message = {
            role: 'assistant',
            content: wrapUpContent,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, wrapUpMessage]);
        }, 800);
      }
      
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Ett fel uppstod. Försök igen.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDeliverables = async () => {
    if (!canvasData.phaseViz?.insights || canvasData.phaseViz.insights.length === 0) {
      alert('Inte tillräckligt med information för att generera deliverables');
      return;
    }

    setIsGenerating(true);

    try {
      const types: DeliverableType[] = [
        'job_description',
        'compensation_analysis',
        'interview_questions',
        'success_plan'
      ];

      console.log('[Generate] Starting deliverable generation...');

      const results = await Promise.all(
        types.map(async (type) => {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type,
              insights: canvasData.phaseViz?.insights || []
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to generate ${type}`);
          }

          const data = await response.json();
          return { type, deliverable: data.deliverable };
        })
      );

      const newDeliverables: {
        jobDescription?: JobDescription;
        compensation?: CompensationAnalysis;
        interviewQuestions?: InterviewQuestions;
        successPlan?: SuccessPlan;
      } = {};
      
      for (const result of results) {
        if (result.type === 'job_description') newDeliverables.jobDescription = result.deliverable;
        else if (result.type === 'compensation_analysis') newDeliverables.compensation = result.deliverable;
        else if (result.type === 'interview_questions') newDeliverables.interviewQuestions = result.deliverable;
        else if (result.type === 'success_plan') newDeliverables.successPlan = result.deliverable;
      }

      setDeliverables(newDeliverables);
      setCanvasState('deliverables');

      console.log('[Generate] All deliverables generated successfully');

    } catch (error) {
      console.error('Error generating deliverables:', error);
      alert('Ett fel uppstod när deliverables skulle genereras');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout
      chat={
        <ChatSidebar
          ref={chatContainerRef}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          phaseComplete={phaseComplete}
          onAdvancePhase={handleAdvancePhase}
          nextPhaseName={phaseConfig?.nextPhase || 'nästa fas'}
          onGenerateDeliverables={handleGenerateDeliverables}
          isGenerating={isGenerating}
          isActionPlan={isActionPlan}
        />
      }
      canvas={<Canvas state={canvasState} data={canvasData} deliverables={deliverables} researchState={undefined} />}
      currentPhase={currentPhase}
    />
  );
}