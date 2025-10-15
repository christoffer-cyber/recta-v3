'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { ChatSidebar } from '@/components/ChatSidebar';
import { Canvas } from '@/components/Canvas';
import { Message, Scenario } from '@/lib/types';
import { getPhaseConfig } from '@/lib/phase-config';
import { deduplicateInsights } from '@/lib/insight-utils';
import type { CanvasState, PhaseVisualization } from '@/lib/canvas-types';
import type { JobDescription, CompensationAnalysis, InterviewQuestions, SuccessPlan, DeliverableType } from '@/lib/deliverable-schemas';
import ReportLayout from '@/components/report/ReportLayout';
import ReportToolbar from '@/components/report/ReportToolbar';
import ReportNavigation from '@/components/report/ReportNavigation';
import ReportToolboxPanel from '@/components/report/ReportToolboxPanel';
import { RectaReportContent, type ReportData } from '@/components/report/RectaReportContent';
import { InsightsSidebar } from '@/components/InsightsSidebar';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

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

function HomeContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationIdFromUrl = searchParams?.get('conversation');
  
  const [conversationId, setConversationId] = useState<number | null>(null);
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
    },
    isNewPhase: true // First load is new phase
  });

  const [deliverables, setDeliverables] = useState<{
    jobDescription?: JobDescription;
    compensation?: CompensationAnalysis;
    interviewQuestions?: InterviewQuestions;
    successPlan?: SuccessPlan;
  }>({});

  // Deliverable generation state tracking
  const [generatingDeliverables, setGeneratingDeliverables] = useState<{
    job_description: 'pending' | 'generating' | 'complete';
    compensation_analysis: 'pending' | 'generating' | 'complete';
    interview_questions: 'pending' | 'generating' | 'complete';
    success_plan: 'pending' | 'generating' | 'complete';
  }>({
    job_description: 'pending',
    compensation_analysis: 'pending',
    interview_questions: 'pending',
    success_plan: 'pending',
  });

  // Report state
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [showReport, setShowReport] = useState(false);
  
  // Progress state
  const [showProgress, setShowProgress] = useState(false);

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
  const phaseComplete = (canvasData.phaseViz?.confidence || 0) >= 90;
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

  const handleAdvancePhase = async () => {  // ← Make it async
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
        insights: canvasData.phaseViz?.insights || [],  // ← Preserve insights across phases
        confidence: 0,  // Reset confidence for new phase
        scenarios: undefined  // ← Clear old scenarios
      },
      isNewPhase: true // Mark as new phase
    });

    // Reset generation flags when changing phases
    setScenariosGenerated(false);
    setActionPlanGenerated(false);

    // AUTO-GENERATE SCENARIOS FOR SOLUTION DESIGN
    if (nextConfig.id === 'solution-design') {
      await generateScenariosAutomatically();
    }

    // FIX 5: AUTO-GENERATE PRE-FILLED ACTION PLAN
    if (nextConfig.id === 'action-plan') {
      await generateActionPlanAutomatically();
    }
  };

  // ADD THIS NEW FUNCTION after handleAdvancePhase
  const generateScenariosAutomatically = async () => {
    // Prevent multiple triggers
    if (scenariosGenerated) {
      console.log('[Auto-Scenarios] Already generated, skipping...');
      return;
    }
    
    setScenariosGenerated(true);
    setIsGeneratingScenarios(true);
    setShowProgress(true);
    
    try {
      // CRITICAL: Collect insights from BOTH Context and Problem Discovery phases
      // We need complete picture: company info + problem details
      
      // Get ALL messages from Context and Problem Discovery
      const allPhaseMessages = messages.filter(m => 
        m.role === 'assistant' || m.role === 'user'
      );
      
      // Get completed phases' insights from completedPhases array
      // (Context and Problem Discovery should both be complete by now)
      // This will be empty since we clear insights on transition
      // But we keep ALL messages which contain the info

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: allPhaseMessages,  // ← ALL messages (Context + Problem Discovery)
          existingInsights: [],  // Not used for scenario gen
          currentConfidence: 0,
          currentPhase: 'Solution Design',
          isNewPhase: true,
          generateScenarios: true  // ← Special flag
        })
      });

      const data = await response.json();
      
      if (data.scenarios) {
        console.log('[Auto-Scenarios] ✅ Received', data.scenarios.length, 'scenarios');
        
        // Add scenarios to canvas
        setCanvasData(prev => ({
          ...prev,
          phaseViz: {
            ...prev.phaseViz!,
            scenarios: data.scenarios
          }
        }));

        // Add AI follow-up message
        const followUpMessage: Message = {
          role: 'assistant',
          content: `Jag har analyserat er situation och tagit fram 3 möjliga lösningsvägar. Du kan se dem i Canvas till höger.

${data.scenarios.map((s: Scenario, i: number) => `**${i + 1}. ${s.name}** - ${s.description}`).join('\n\n')}

Vilken av dessa scenarios känns mest rätt för er situation?`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, followUpMessage]);
      }

    } catch (error) {
      console.error('Error generating scenarios:', error);
      
      // Fallback: Ask user to describe scenarios themselves
      const fallbackMessage: Message = {
        role: 'assistant',
        content: 'Baserat på problemet ni beskrivit - vilka olika lösningsvägar kan ni tänka er? (T.ex. anställa senior, anställa två juniors, ta in konsult, etc.)',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setShowProgress(false);
      setIsGeneratingScenarios(false);
    }
  };

  // FIX 5: AUTO-GENERATE PRE-FILLED ACTION PLAN
  const generateActionPlanAutomatically = async () => {
    // Prevent multiple triggers
    if (actionPlanGenerated) {
      console.log('[Action Plan] Already generated, skipping...');
      return;
    }
    
    setActionPlanGenerated(true);
    setIsLoading(true);
    
    try {
      console.log('[Action Plan] Auto-generating pre-filled action plan from insights...');
      
      // Collect ALL insights from ALL phases to build comprehensive action plan
      const allMessages = messages.filter(m => m.role === 'assistant' || m.role === 'user');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          existingInsights: [],
          currentConfidence: 0,
          currentPhase: 'Action Plan',
          isNewPhase: true,
          generateActionPlan: true // Special flag for action plan generation
        })
      });

      const data = await response.json();
      
      if (data.actionPlan) {
        console.log('[Action Plan] ✅ Received pre-filled action plan');
        
        // Add AI message with pre-filled action plan
        const actionPlanMessage: Message = {
          role: 'assistant',
          content: `Baserat på er situation har jag tagit fram en konkret handlingsplan:

## 📅 Timeline
${data.actionPlan.timeline}

## 🎯 Key Milestones
${data.actionPlan.milestones.map((m: string, i: number) => `${i + 1}. ${m}`).join('\n')}

## ⚡ Nästa Steg
${data.actionPlan.nextSteps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

## ⚠️ Risker & Beroenden
${data.actionPlan.risks.map((r: string) => `- ${r}`).join('\n')}

**Stämmer denna plan?** Vill du justera något eller kan vi gå vidare till att generera dina deliverables?`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, actionPlanMessage]);
        
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
      } else {
        // Fallback: Ask user to build plan from scratch
        const fallbackMessage: Message = {
          role: 'assistant',
          content: 'Låt oss skapa en konkret handlingsplan. Vilken timeline ser ni framför er för denna rekrytering?',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      }

    } catch (error) {
      console.error('[Action Plan] Error generating action plan:', error);
      
      // Fallback message
      const fallbackMessage: Message = {
        role: 'assistant',
        content: 'Låt oss bygga en handlingsplan tillsammans. Hur snabbt behöver ni få denna person på plats?',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
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
      
          // Update canvas state (preserve scenarios!)
          setCanvasData(prev => ({
            ...prev,
            phaseViz: {
              ...prev.phaseViz!,
              insights: deduplicatedInsights,
              confidence: newConfidence,
              scenarios: prev.phaseViz?.scenarios // ← PRESERVE scenarios
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

      // FIX 4: AUTO-TRIGGER SCENARIO GENERATION AT 85%+ IN SOLUTION DESIGN
      if (data.autoGenerateScenarios && !isGeneratingScenarios && !scenariosGenerated) {
        console.log('[Auto-Scenarios] Triggering automatic scenario generation');
        // Trigger async (don't await to keep chat flowing)
        generateScenariosAutomatically().catch(err => {
          console.error('[Auto-Scenarios] Error:', err);
        });
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

      console.log('[Generate] Starting sequential deliverable generation...');

      // Track success locally to avoid React state closure issue
      const successfulTypes: string[] = [];
      const failedTypes: string[] = [];

      // Generate SEQUENTIALLY to show progress
      for (const type of types) {
        // Set to generating
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

          // Mark as complete
          setGeneratingDeliverables(prev => ({
            ...prev,
            [type]: 'complete'
          }));

          // Track success locally
          successfulTypes.push(type);
          console.log(`✅ Generated ${type}`);

        } catch (error) {
          console.error(`❌ Error generating ${type}:`, error);
          
          // Mark as pending (failed) but continue
          setGeneratingDeliverables(prev => ({
            ...prev,
            [type]: 'pending'
          }));
          failedTypes.push(type);
          // Don't throw - continue to next deliverable
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

    } catch (error) {
      console.error('[Generate] Fatal error:', error);
      alert('Ett fel uppstod när deliverables skulle genereras');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      console.log('[Generate Report] Starting...');
      
      // Try to extract selected scenario from recent messages
      const recentMessages = messages.slice(-10);
      let selectedScenarioName = '';
      
      // Look for user's scenario choice in recent messages
      for (const msg of recentMessages.reverse()) {
        if (msg.role === 'user' && canvasData.phaseViz?.scenarios) {
          // Check if message mentions any scenario name
          for (const scenario of canvasData.phaseViz.scenarios) {
            if (msg.content.toLowerCase().includes(scenario.name.toLowerCase())) {
              selectedScenarioName = scenario.name;
              break;
            }
          }
          if (selectedScenarioName) break;
        }
      }
      
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          scenarios: canvasData.phaseViz?.scenarios || [],
          conversationId: conversationId,
          selectedScenario: {
            name: selectedScenarioName || 'Första alternativet'
          }
        })
      });

      const data = await response.json();
      
      if (data.reportData) {
        setReportData(data.reportData);
        setShowReport(true);
        console.log('[Generate Report] Success!');
      }

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Ett fel uppstod när rapporten skulle genereras');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScenarioSelect = async (scenario: Scenario) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: `Jag väljer alternativ: ${scenario.name}`,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'assistant',
        content: `Utmärkt val! ${scenario.name} är ett smart beslut baserat på era behov.\n\nLåt mig fråga lite mer om implementation och timeline för att säkerställa att vi har alla detaljer på plats.`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Update insights and confidence
      setCanvasData(prev => ({
        ...prev,
        phaseViz: {
          ...prev.phaseViz!,
          insights: [
            ...(prev.phaseViz?.insights || []),
            `Preferens: Valde ${scenario.name} för ${scenario.cost.min / 1000}-${scenario.cost.max / 1000}k SEK`
          ],
          confidence: Math.min(100, (prev.phaseViz?.confidence || 0) + 15)
        }
      }));
      
      setIsLoading(false);
    }, 1500);
  };

  // AUTO-SAVE: Save conversation function
  const saveConversation = useCallback(async () => {
    if (!conversationId) return;
    
    setIsSaving(true);
    
    try {
      const currentPhase = canvasData.phaseViz?.currentPhase.split(' - ')[0].trim() || 'Context';
      
      const response = await fetch(`/api/conversations/${conversationId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          canvasData,
          currentPhase,
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    } finally {
      setIsSaving(false);
    }
  }, [conversationId, messages, canvasData]);

  // AUTO-SAVE: Trigger save when messages/canvas change
  useEffect(() => {
    if (conversationId && messages.length > 1) {
      const timer = setTimeout(() => {
        saveConversation();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [conversationId, messages, canvasData, saveConversation]);

  // LOAD: Load existing conversation from URL
  useEffect(() => {
    const loadConversation = async (id: string) => {
      try {
        const response = await fetch(`/api/conversations/${id}`);
        const data = await response.json();

        if (data.conversation) {
          setConversationId(parseInt(id));
          setMessages(data.messages || []);
          if (data.canvasData) {
            setCanvasData(data.canvasData);
          }
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    };

    if (conversationIdFromUrl && !conversationId) {
      loadConversation(conversationIdFromUrl);
    }
  }, [conversationIdFromUrl, conversationId]);

  // CREATE: Create new conversation on mount
  useEffect(() => {
    const createNewConversation = async () => {
      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Ny analys' }),
        });

        const data = await response.json();
        if (data.conversation) {
          setConversationId(data.conversation.id);
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    };

    if (user && !conversationId && !conversationIdFromUrl) {
      createNewConversation();
    }
  }, [user, conversationId, conversationIdFromUrl]);

  // REDIRECT: Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // PREVENT LEAVE: Warn before leaving with unsaved work
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (messages.length > 1 && isSaving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages, isSaving]);

  // LOADING: Show loading state while authenticating
  if (authLoading) {
  return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // REPORT VIEW - Render if report is ready
  if (showReport && reportData) {
    const toolboxItems = [
      {
        title: 'Job Description',
        subtitle: deliverables.jobDescription ? 'Klar att publicera' : 'Inte genererad än',
        onClick: () => {
          if (deliverables.jobDescription) {
            setCanvasState('deliverables');
            setShowReport(false);
          }
        }
      },
      {
        title: 'Interview Questions',
        subtitle: deliverables.interviewQuestions ? 'Strukturerad guide' : 'Inte genererad än',
        onClick: () => {
          if (deliverables.interviewQuestions) {
            setCanvasState('deliverables');
            setShowReport(false);
          }
        }
      },
      {
        title: '90-Day Success Plan',
        subtitle: deliverables.successPlan ? '30-60-90 milestones' : 'Inte genererad än',
        onClick: () => {
          if (deliverables.successPlan) {
            setCanvasState('deliverables');
            setShowReport(false);
          }
        }
      },
      {
        title: 'Compensation Analysis',
        subtitle: deliverables.compensation ? 'Market benchmarks' : 'Inte genererad än',
        onClick: () => {
          if (deliverables.compensation) {
            setCanvasState('deliverables');
            setShowReport(false);
          }
        }
      }
    ];

    const navItems = [
      { id: 'slide-1', label: 'Cover' },
      { id: 'slide-2', label: 'Executive Summary' },
      { id: 'slide-3', label: 'Problem Analysis' },
      { id: 'slide-4', label: 'Solution Scenarios' },
      { id: 'slide-5', label: 'Selected Solution' },
      { id: 'slide-6', label: 'Cost Analysis' },
      { id: 'slide-7', label: 'Timeline' },
      { id: 'slide-8', label: 'Recommendations' },
      { id: 'slide-9', label: 'Next Steps' },
      { id: 'slide-10', label: 'Thank You' }
    ];

    return (
      <>
        <ReportToolbar onBackToChat={() => setShowReport(false)} />
        <ReportLayout
          left={<ReportToolboxPanel items={toolboxItems} onItemClick={(item) => item.onClick?.()} />}
          right={<ReportNavigation items={navItems} />}
        >
          <RectaReportContent data={reportData} />
        </ReportLayout>
      </>
    );
  }

  // Format insights for sidebar
  const formatInsightsForSidebar = (insights: string[]) => {
    return insights.map((insight, index) => {
      const [category, ...textParts] = insight.split(':');
      return {
        category: category.trim(),
        text: textParts.join(':').trim(),
        timestamp: new Date(Date.now() - (insights.length - index) * 60000).toISOString(),
        isNew: index === insights.length - 1
      };
    });
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
          onGenerateReport={handleGenerateReport}
          scenarios={canvasData.phaseViz?.scenarios}
          onScenarioSelect={handleScenarioSelect}
          isGeneratingScenarios={isGeneratingScenarios}
        />
      }
      canvas={<Canvas state={canvasState} data={canvasData} deliverables={deliverables} researchState={undefined} showProgress={showProgress} generatingDeliverables={generatingDeliverables} isGeneratingScenarios={isGeneratingScenarios} conversationId={conversationId ?? undefined} />}
      insights={
        <InsightsSidebar 
          phase={currentPhase}
          insights={formatInsightsForSidebar(canvasData.phaseViz?.insights || [])}
          confidence={canvasData.phaseViz?.confidence || 0}
        />
      }
      currentPhase={currentPhase}
    >
      {/* Saving indicator */}
      {isSaving && <span className="text-gray-500">Sparar...</span>}
      {!isSaving && lastSaved && (
        <span className="text-gray-500">
          Sparad {formatDistanceToNow(new Date(lastSaved), { addSuffix: true, locale: sv })}
        </span>
      )}
    </Layout>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}