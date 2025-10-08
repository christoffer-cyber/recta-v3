import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';
import { Message } from '@/lib/types';
import { calculateConfidence } from '@/lib/confidence';
import { buildSystemPrompt as buildPrompt } from '@/lib/prompts';
import { shouldTriggerResearch, executeResearch, formatResearchForPrompt } from '@/lib/research';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
        const messages: Message[] = body.messages || [];
        const existingInsights: string[] = body.existingInsights || [];
        const currentConfidence: number = body.currentConfidence || 0;
        const currentPhase: string = body.currentPhase || 'Context';
        const isNewPhase: boolean = body.isNewPhase || false;

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Chat API] Phase:', currentPhase);
    console.log('[Chat API] IsNewPhase:', isNewPhase);
    console.log('[Chat API] Confidence:', currentConfidence);
    console.log('[Chat API] Total Insights:', existingInsights.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Research trigger - generic and intelligent
    let researchContext = '';

    const conversationState = {
      currentPhase: currentPhase as 'Context' | 'Problem Discovery' | 'Solution Design' | 'Action Plan',
      confidence: currentConfidence,
      insights: existingInsights
    };

    if (shouldTriggerResearch(conversationState)) {
      console.log('[Chat API] Triggering research for', currentPhase);
      
      try {
        const results = await executeResearch(
          existingInsights,
          currentPhase as 'Context' | 'Problem Discovery' | 'Solution Design' | 'Action Plan'
        );
        
        if (results.length > 0) {
          console.log('[Chat API] Research complete:', results.length, 'findings');
          researchContext = formatResearchForPrompt(results);
        }
      } catch (error) {
        console.error('[Chat API] Research error:', error);
        // Continue without research if it fails - don't block conversation
      }
    }

        // Build system prompt with research context
        const systemPrompt = buildPrompt({
          phase: currentPhase,
          insights: existingInsights,
          confidence: currentConfidence,
          researchContext: researchContext,
          isNewPhase: isNewPhase
        });

        // Log first 500 chars of system prompt for debugging
        console.log('[Chat API] System Prompt Preview:', systemPrompt.substring(0, 500));

    // Call Claude
    const fullResponse = await callClaude(messages, systemPrompt);

    // Split response into message and insights
    const [message, insightSection] = fullResponse.split('###INSIGHTS###');
    
    const insights = insightSection 
      ? insightSection
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.trim().substring(2)) // Remove "- "
      : [];

    // Calculate confidence based on all insights (existing + new)
    const allInsights = [...existingInsights, ...insights];
    const confidenceResult = calculateConfidence(currentPhase, allInsights);

    console.log('[Chat API] Confidence calculated:', confidenceResult);

    return NextResponse.json({ 
      message: message.trim(),
      insights: insights.length > 0 ? insights : undefined,
      confidence: confidenceResult.confidence,
      confidenceBreakdown: confidenceResult.breakdown
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
