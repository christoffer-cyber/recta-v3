'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ChatSidebar } from '@/components/ChatSidebar';
import { Canvas } from '@/components/Canvas';
import { Message } from '@/lib/types';
import { getPhaseConfig } from '@/lib/phase-config';
import type { CanvasState, PhaseVisualization } from '@/lib/canvas-types';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Välkommen till Recta! 👋\n\nJag hjälper dig att bygga en **strategisk rekryteringsplan**.\n\nLåt oss börja med att förstå er situation:\n\n- Hur många är ni i företaget?\n- Vilken roll letar ni efter?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Canvas state
  const [canvasState] = useState<CanvasState>('phase-progress');
  const [canvasData, setCanvasData] = useState<{
    phaseViz?: PhaseVisualization;
  }>({
    phaseViz: {
      currentPhase: 'Context - Förstår er situation',
      completedPhases: [],
      insights: [],
      confidence: 0
    }
  });

  const currentPhase = canvasData.phaseViz?.currentPhase || 'Context';
  const phaseComplete = (canvasData.phaseViz?.confidence || 0) >= 100;
  const phaseConfig = getPhaseConfig(currentPhase);

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
        insights: canvasData.phaseViz?.insights || [],  // ← KEEP insights too!
        confidence: 0  // Reset confidence for new phase
      }
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
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        role: 'assistant',
        content: data.message || 'Tack för informationen!',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Update canvas with extracted insights and confidence
      const newConfidence = Math.min(100, (canvasData.phaseViz?.confidence || 0) + 15);
      setCanvasData(prev => ({
        ...prev,
        phaseViz: {
          ...prev.phaseViz!,
          insights: data.insights 
            ? [...(prev.phaseViz?.insights || []), ...data.insights]  // ← Use Claude's insights!
            : prev.phaseViz?.insights || [],
          confidence: newConfidence
        }
      }));
      
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

  return (
    <Layout
      chat={
        <ChatSidebar
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          phaseComplete={phaseComplete}
          onAdvancePhase={handleAdvancePhase}
          nextPhaseName={phaseConfig?.nextPhase || 'nästa fas'}
        />
      }
      canvas={<Canvas state={canvasState} data={canvasData} />}
      currentPhase={currentPhase}
    />
  );
}