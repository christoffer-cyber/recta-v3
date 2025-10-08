import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';
import { Message } from '@/lib/types';
import { calculateConfidence } from '@/lib/confidence';
import { buildSystemPrompt as buildPrompt } from '@/lib/prompts';
import { shouldTriggerResearch, executeResearch, formatResearchForPrompt } from '@/lib/research';
import type { Scenario } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
        const messages: Message[] = body.messages || [];
        const existingInsights: string[] = body.existingInsights || [];
        const currentConfidence: number = body.currentConfidence || 0;
        const currentPhase: string = body.currentPhase || 'Context';
        const isNewPhase: boolean = body.isNewPhase || false;
        const generateScenarios: boolean = body.generateScenarios || false;

    // SPECIAL MODE: Generate Scenarios
    if (generateScenarios) {
      console.log('[Chat API] 🎯 SCENARIO GENERATION MODE');
      
      try {
        const scenarioPrompt = buildScenarioGenerationPrompt(existingInsights, messages);
        
        const scenarioResponse = await callClaude(
          [{ role: 'user', content: scenarioPrompt, timestamp: new Date().toISOString() }],
          'You are an expert organizational consultant creating solution scenarios.'
        );

        // Parse scenarios from response
        const scenarios = parseScenarios(scenarioResponse);
        
        console.log('[Chat API] Generated scenarios:', scenarios.length);
        
        return NextResponse.json({
          message: 'Scenarios generated',
          scenarios: scenarios,
          insights: existingInsights,
          confidence: currentConfidence
        });
        
      } catch (error) {
        console.error('[Chat API] Scenario generation error:', error);
        return NextResponse.json(
          { error: 'Failed to generate scenarios' },
          { status: 500 }
        );
      }
    }

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

// Helper: Build prompt for scenario generation
function buildScenarioGenerationPrompt(insights: string[], messages: Message[]): string {
  // Split messages into Context and Problem Discovery phases
  // This gives AI structured context to work with
  
  const contextMessages: string[] = [];
  const problemMessages: string[] = [];
  let currentPhase = 'context';
  
  messages.forEach(msg => {
    // Detect phase transitions by looking for welcome messages
    if (msg.content.includes('Problem Discovery') && msg.content.includes('BÖRJAR')) {
      currentPhase = 'problem';
    } else if (msg.content.includes('Solution Design')) {
      return; // Stop before Solution Design
    }
    
    if (currentPhase === 'context') {
      contextMessages.push(`${msg.role}: ${msg.content}`);
    } else {
      problemMessages.push(`${msg.role}: ${msg.content}`);
    }
  });

  const contextSection = contextMessages.length > 0 
    ? `CONTEXT PHASE (Company Info):
${contextMessages.join('\n')}`
    : '';

  const problemSection = problemMessages.length > 0
    ? `PROBLEM DISCOVERY PHASE (Challenge Details):
${problemMessages.join('\n')}`
    : '';

  return `You are generating solution scenarios for a hiring need. You have complete information from two phases:

${contextSection}

${problemSection}

TASK: Generate exactly 3 distinct solution scenarios as JSON.

Each scenario must be:
1. **Specific to THEIR situation** (company size, stage, industry, budget from Context)
2. **Addressing THEIR problem** (the actual challenge from Problem Discovery)
3. **Realistic and actionable** (not generic advice)

Each scenario should include:
- id: unique identifier (e.g., "scenario-senior-solo")
- name: Short catchy name (e.g., "Senior Solo", "Mid Duo", "Consultant Bridge")
- description: One sentence summary
- approach: Detailed explanation (2-3 sentences) of HOW this solves their specific problem
- pros: Array of 3-4 advantages (specific to their context)
- cons: Array of 2-3 disadvantages (realistic trade-offs)
- cost: {min: number, max: number, currency: "SEK"} (based on their budget from Context)
- timeline: Time to implement (e.g., "2-3 months")
- risk: "low" | "medium" | "high" (considering their constraints)
- impact: "low" | "medium" | "high" (on solving their problem)

CRITICAL RULES:
1. Make scenarios DISTINCTLY DIFFERENT (not minor variations)
2. Base cost on their stated budget range from Context phase
3. Address the ROOT CAUSE from Problem Discovery, not symptoms
4. Consider their company stage/size/constraints
5. Make it ACTIONABLE - they should know exactly what to do
6. Output ONLY valid JSON, no other text

FORMAT:
\`\`\`json
{
  "scenarios": [
    {
      "id": "scenario-1",
      "name": "...",
      "description": "...",
      "approach": "...",
      "pros": ["...", "...", "..."],
      "cons": ["...", "..."],
      "cost": {"min": 800000, "max": 1000000, "currency": "SEK"},
      "timeline": "2-3 months",
      "risk": "medium",
      "impact": "high"
    },
    {
      "id": "scenario-2",
      ...
    },
    {
      "id": "scenario-3",
      ...
    }
  ]
}
\`\`\`

Generate scenarios NOW based on the complete Context + Problem information above:`;
}

// Helper: Parse scenarios from Claude response
function parseScenarios(response: string): Scenario[] {
  try {
    // Remove markdown code blocks if present
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(cleaned);
    
    if (parsed.scenarios && Array.isArray(parsed.scenarios)) {
      return parsed.scenarios;
    }
    
    // Fallback: If response is array directly
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    throw new Error('Invalid scenario format');
    
  } catch (error) {
    console.error('[Parse Scenarios] Error:', error);
    console.error('[Parse Scenarios] Response was:', response);
    
    // Return fallback scenarios
    return [
      {
        id: 'fallback-1',
        name: 'Senior Hire',
        description: 'Hire one experienced senior professional',
        approach: 'Recruit a senior-level candidate with proven track record.',
        pros: ['Fast decision making', 'Deep expertise', 'Can mentor team'],
        cons: ['Higher cost', 'Single point of failure'],
        cost: { min: 800000, max: 1000000, currency: 'SEK' },
        timeline: '2-3 months',
        risk: 'medium',
        impact: 'high'
      },
      {
        id: 'fallback-2',
        name: 'Mid-Level Duo',
        description: 'Hire two mid-level professionals',
        approach: 'Recruit two mid-level candidates to share responsibilities.',
        pros: ['Redundancy', 'Collaborative', 'Lower individual cost'],
        cons: ['Coordination overhead', 'Longer to implement'],
        cost: { min: 1000000, max: 1200000, currency: 'SEK' },
        timeline: '3-4 months',
        risk: 'low',
        impact: 'medium'
      },
      {
        id: 'fallback-3',
        name: 'Consultant Bridge',
        description: 'Hire consultant while searching for permanent',
        approach: 'Engage a consultant short-term while recruiting permanent hire.',
        pros: ['Immediate start', 'Flexibility', 'No long-term commitment'],
        cons: ['Expensive', 'No knowledge retention', 'Temporary solution'],
        cost: { min: 1200000, max: 1500000, currency: 'SEK' },
        timeline: '1 month',
        risk: 'high',
        impact: 'medium'
      }
    ];
  }
}
