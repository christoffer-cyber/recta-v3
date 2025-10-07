import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';
import { Message } from '@/lib/types';
import { calculateConfidence } from '@/lib/confidence';
import { buildSystemPrompt as buildPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages: Message[] = body.messages || [];
    const existingInsights: string[] = body.existingInsights || [];
    const currentConfidence: number = body.currentConfidence || 0;
    const currentPhase: string = body.currentPhase || 'Context';

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Build system prompt with new builder
    const systemPrompt = buildPrompt({
      phase: currentPhase,
      insights: existingInsights,
      confidence: currentConfidence,
      researchContext: ''  // Will be added when research is integrated
    });

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
