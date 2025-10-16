'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { ChatSidebar } from '@/components/ChatSidebar';
import { Canvas } from '@/components/Canvas';
import { Message, Scenario } from '@/lib/types';
import { getPhaseConfig } from '@/lib/phase-config';
import type { CanvasState, PhaseVisualization } from '@/lib/canvas-types';
import type { JobDescription, CompensationAnalysis, InterviewQuestions, SuccessPlan } from '@/lib/deliverable-schemas';
import { PHASE_CONFIGS } from '@/lib/phase-config';

export default function ConversationPage() {
  // Auth
  const { user, loading } = useAuth();
  const router = useRouter();
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-lg">Laddar...</div>
      </div>
    );
  }
  
  if (!user) {
    router.push('/signin');
    return null;
  }

  // URL params
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id');
  
  // State
  const [conversationIdState, setConversationIdState] = useState<number | null>(
    conversationId ? parseInt(conversationId, 10) : null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Välkommen till Recta! 👋\n\nJag hjälper er att bygga en **strategisk rekryteringsplan** - oavsett om ni är ett tech-företag, konsultbyrå, produktionsbolag eller annan verksamhet.\n\nLåt oss börja med att förstå er situation:\n\n**Berätta lite om er organisation** - hur många ni är och vad ni gör?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState(false);
  const [scenariosGenerated, setScenariosGenerated] = useState(false); // Prevent multiple triggers
  const [actionPlanGenerated, setActionPlanGenerated] = useState(false); // Prevent multiple triggers
  
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
    }
  });
  
  // Deliverables state
  const [deliverables, setDeliverables] = useState<{
    jobDescription?: JobDescription;
    compensation?: CompensationAnalysis;
    interviewQuestions?: InterviewQuestions;
    successPlan?: SuccessPlan;
  }>({});
  
  const [showProgress, setShowProgress] = useState(false);
  const [generatingDeliverables, setGeneratingDeliverables] = useState<{
    job_description: 'pending' | 'generating' | 'complete';
    compensation_analysis: 'pending' | 'generating' | 'complete';
    interview_questions: 'pending' | 'generating' | 'complete';
    success_plan: 'pending' | 'generating' | 'complete';
  }>({
    job_description: 'pending',
    compensation_analysis: 'pending',
    interview_questions: 'pending',
    success_plan: 'pending'
  });

  // Scroll preservation ref
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const previousHeightRef = useRef<number>(0);

  // Load onboarding data if available
  useEffect(() => {
    const onboarding = sessionStorage.getItem('onboarding');
    if (onboarding) {
      const data = JSON.parse(onboarding);
      // Pre-populate insights
      const insights = [
        `Företag: ${data.companySize}`,
        `Roll: ${data.role}`,
        data.industry && `Företag: ${data.industry}`,
        data.budget && `Budget: ${data.budget}`
      ].filter(Boolean);
      
      setCanvasData(prev => ({
        ...prev,
        phaseViz: { 
          ...prev.phaseViz!,
          insights: insights as string[], 
          confidence: 40 
        }
      }));
      
      sessionStorage.removeItem('onboarding');
    }
  }, []);

  // Preserve scroll position when canvas updates
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const currentHeight = container.scrollHeight;
      
      if (previousHeightRef.current > 0 && currentHeight > previousHeightRef.current) {
        const scrollDiff = currentHeight - previousHeightRef.current;
        container.scrollTop = container.scrollTop + scrollDiff;
      }
      
      previousHeightRef.current = currentHeight;
    }
  }, [canvasData, messages]);

  const currentPhase = canvasData.phaseViz?.currentPhase || 'Context';
  const phaseComplete = (canvasData.phaseViz?.confidence || 0) >= 100;
  const phaseConfig = getPhaseConfig(currentPhase);

  // Helper to get clean phase ID for API
  const getCurrentPhaseId = (): string => {
    return currentPhase.split(' - ')[0].trim();
  };

  const handleAdvancePhase = () => {
    if (!phaseConfig) return;
    
    // Reset generation flags for new phase
    setScenariosGenerated(false);
    setActionPlanGenerated(false);
    
    // Clear insights for fresh start in new phase
    const nextPhaseConfig = PHASE_CONFIGS.find(p => p.id === phaseConfig.nextPhase);
    if (nextPhaseConfig) {
      setCanvasData({
        phaseViz: {
          currentPhase: nextPhaseConfig.name,
          completedPhases: [...(canvasData.phaseViz?.completedPhases || []), currentPhase.split(' - ')[0]],
          insights: [], // Clear insights for fresh start
          confidence: 0
        },
        isNewPhase: true
      });
    }

    // Add welcome message for new phase
    if (nextPhaseConfig?.welcomeMessage) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: nextPhaseConfig.welcomeMessage,
        timestamp: new Date().toISOString()
      }]);
    }

    // Auto-generate scenarios for Solution Design
    if (nextPhaseConfig?.id === 'solution-design') {
      generateScenariosAutomatically();
    }

    // Auto-generate action plan for Action Plan
    if (nextPhaseConfig?.id === 'action-plan') {
      generateActionPlanAutomatically();
    }
  };

  const generateScenariosAutomatically = async () => {
    if (scenariosGenerated) return; // Prevent multiple triggers
    
    setIsGeneratingScenarios(true);
    setScenariosGenerated(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          existingInsights: canvasData.phaseViz?.insights || [],
          currentConfidence: canvasData.phaseViz?.confidence || 0,
          currentPhase: getCurrentPhaseId(),
          isNewPhase: true,
          generateScenarios: true
        })
      });

      if (!response.ok) {
        console.error('Failed to generate scenarios');
        return;
      }

      const data = await response.json();
      
      if (data.scenarios) {
        // Update canvas with scenarios
        setCanvasData(prev => ({
          ...prev,
          phaseViz: {
            ...prev.phaseViz!,
            scenarios: data.scenarios,
            confidence: 85 // Scenarios generated = high confidence
          }
        }));

        // Add AI follow-up message
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Perfect! Jag har skapat **3 lösningsscenarier** baserat på er situation. Kolla till höger och låt mig veta vilken ni tycker passar bäst! 🎯\n\n*Ni kan klicka på varje scenario för mer detaljer.*`,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error generating scenarios:', error);
    } finally {
      setIsGeneratingScenarios(false);
    }
  };

  const generateActionPlanAutomatically = async () => {
    if (actionPlanGenerated) return; // Prevent multiple triggers
    
    setActionPlanGenerated(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          existingInsights: canvasData.phaseViz?.insights || [],
          currentConfidence: canvasData.phaseViz?.confidence || 0,
          currentPhase: getCurrentPhaseId(),
          isNewPhase: true,
          generateActionPlan: true
        })
      });

      if (!response.ok) {
        console.error('Failed to generate action plan');
        return;
      }

      const data = await response.json();
      
      if (data.actionPlan) {
        // Add action plan message
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Excellent! Jag har skapat en **förfylld handlingsplan** baserat på allt vi diskuterat. Kolla till höger och låt mig veta om ni vill justera något! 📋\n\n*Timeline, milstolpar och nästa steg är alla förberedda.*`,
          timestamp: new Date().toISOString()
        }]);

        // Extract insights from action plan and set confidence to 60%
        const extractedInsights = [
          `Timeline: ${data.actionPlan.timeline}`,
          ...data.actionPlan.milestones.map((m: string) => `Milestone: ${m}`),
          ...data.actionPlan.nextSteps.map((s: string) => `Nästa steg: ${s}`),
          ...data.actionPlan.risks.map((r: string) => `Risk: ${r}`)
        ];

        setCanvasData(prev => ({
          ...prev,
          phaseViz: {
            ...prev.phaseViz!,
            insights: [...(prev.phaseViz?.insights || []), ...extractedInsights],
            confidence: 60 // Pre-filled plan = needs validation
          }
        }));
      }
    } catch (error) {
      console.error('Error generating action plan:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const newMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          existingInsights: canvasData.phaseViz?.insights || [],
          currentConfidence: canvasData.phaseViz?.confidence || 0,
          currentPhase: getCurrentPhaseId(),
          isNewPhase: canvasData.isNewPhase || false
        })
      });

      if (!response.ok) {
        throw new Error('Chat API failed');
      }

      const data = await response.json();
      
      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString()
      }]);

      // Update canvas data - preserve scenarios
      setCanvasData(prev => ({
        ...prev,
        phaseViz: {
          ...prev.phaseViz!,
          insights: data.insights || [],
          confidence: data.confidence || 0,
          scenarios: prev.phaseViz?.scenarios // Preserve scenarios
        },
        isNewPhase: false
      }));

      // Check for auto-scenario generation
      if (data.autoGenerateScenarios && !scenariosGenerated) {
        generateScenariosAutomatically();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, något gick fel. Försök igen.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDeliverables = async () => {
    if (Object.values(generatingDeliverables).some(s => s === 'generating')) return;
    
    setShowProgress(true);
    
    const types = ['job_description', 'compensation_analysis', 'interview_questions', 'success_plan'];
    
    // Track success locally to avoid React state closure issue
    const successfulTypes: string[] = [];
    const failedTypes: string[] = [];
    
    for (const type of types) {
      setGeneratingDeliverables(prev => ({
        ...prev,
        [type]: 'generating'
      }));

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            insights: canvasData.phaseViz?.insights || []
          })
        });

        if (!response.ok) {
          console.error(`❌ Failed to generate ${type} (${response.status}), skipping...`);
          setGeneratingDeliverables(prev => ({
            ...prev,
            [type]: 'pending'
          }));
          failedTypes.push(type);
          continue; // Skip to next deliverable
        }

        const data = await response.json();
        
        if (data.error) {
          console.error(`❌ API error for ${type}:`, data.error);
          setGeneratingDeliverables(prev => ({
            ...prev,
            [type]: 'pending'
          }));
          failedTypes.push(type);
          continue;
        }
        
        // Update deliverables state with correct field name
        setDeliverables(prev => {
          const newDeliverables = { ...prev };
          if (type === 'job_description') newDeliverables.jobDescription = data.data;
          else if (type === 'compensation_analysis') newDeliverables.compensation = data.data;
          else if (type === 'interview_questions') newDeliverables.interviewQuestions = data.data;
          else if (type === 'success_plan') newDeliverables.successPlan = data.data;
          return newDeliverables;
        });

        setGeneratingDeliverables(prev => ({
          ...prev,
          [type]: 'complete'
        }));

        successfulTypes.push(type);
        console.log(`✅ Generated ${type}`);

      } catch (error) {
        console.error(`❌ Error generating ${type}:`, error);
        
        setGeneratingDeliverables(prev => ({
          ...prev,
          [type]: 'pending'
        }));
        failedTypes.push(type);
      }
    }

    console.log('[Generate] ✅ All deliverables processed');
    console.log(`[Generate] Successful: ${successfulTypes.join(', ')}`);
    console.log(`[Generate] Failed: ${failedTypes.join(', ')}`);
    
    // Use local tracking instead of reading from state
    const successCount = successfulTypes.length;
    
    console.log(`[Generate] Summary: ${successCount}/${types.length} deliverables generated successfully`);

    if (successCount > 0) {
      setCanvasState('deliverables');
      console.log('[Generate] Switching to deliverables view');
    } else {
      console.log('[Generate] ❌ No deliverables generated successfully');
      alert('Kunde inte generera några deliverables. Försök igen eller kontakta support.');
    }
    
    setShowProgress(false);
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
        />
      }
      canvas={
        <Canvas 
          state={canvasState} 
          data={canvasData}
          deliverables={deliverables}
          showProgress={showProgress}
          generatingDeliverables={generatingDeliverables}
          isGeneratingScenarios={isGeneratingScenarios}
        />
      }
      currentPhase={currentPhase}
    />
  );
}
