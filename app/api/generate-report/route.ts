import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';
import type { Message } from '@/lib/types';
import type { ReportData } from '@/components/report/RectaReportContent';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messages, scenarios, selectedScenario, conversationId } = body;

    console.log('[Generate Report] Starting report generation...');

    // Build comprehensive prompt for report data extraction
    const prompt = buildReportPrompt(messages, scenarios, selectedScenario);

    const response = await callClaude(
      [{ role: 'user', content: prompt, timestamp: new Date().toISOString() }],
      'You are an expert management consultant creating executive reports.'
    );

    // Parse JSON response
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const reportData: ReportData = JSON.parse(cleaned);

    console.log('[Generate Report] Report data generated successfully');

    // Save to database if conversationId provided
    if (conversationId) {
      try {
        await sql`
          INSERT INTO reports (conversation_id, report_data, created_at)
          VALUES (${parseInt(conversationId)}, ${JSON.stringify(reportData)}, CURRENT_TIMESTAMP)
          ON CONFLICT (conversation_id) 
          DO UPDATE SET 
            report_data = EXCLUDED.report_data,
            created_at = CURRENT_TIMESTAMP
        `;
        console.log('[Generate Report] Saved to database');
      } catch (dbError) {
        console.error('[Generate Report] Database save error:', dbError);
        // Continue even if DB save fails
      }
    }

    return NextResponse.json({ 
      reportData,
      conversationId: conversationId ? parseInt(conversationId) : null
    });

  } catch (error) {
    console.error('[Generate Report] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

interface ScenarioInput {
  name: string;
  description: string;
  cost: { min: number; max: number };
  timeline: string;
  pros?: string[];
  cons?: string[];
}

interface SelectedScenarioInput {
  name: string;
  rationale?: string;
}

function buildReportPrompt(
  messages: Message[], 
  scenarios: ScenarioInput[], 
  selectedScenario: SelectedScenarioInput
): string {
  const conversationText = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n\n');

  return `Based on this organizational consulting conversation:

${conversationText}

SCENARIOS DISCUSSED:
${JSON.stringify(scenarios, null, 2)}

SELECTED SCENARIO:
${JSON.stringify(selectedScenario, null, 2)}

Generate a comprehensive management report in JSON format:

{
  "company": {
    "name": "Extract from conversation",
    "size": number,
    "stage": "seed/seriesA/seriesB/growth",
    "industry": "string"
  },
  "summary": {
    "challenge": "One sentence problem statement",
    "solution": "One sentence solution (selected scenario)",
    "investment": "900k-1M SEK/år",
    "timeline": "2-3 months to hire"
  },
  "problem": {
    "description": "2-3 sentence problem description",
    "rootCause": ["cause 1", "cause 2", "cause 3"],
    "impact": "Business impact if not solved"
  },
  "scenarios": [
    // Use the 3 scenarios from conversation
    {
      "name": "string",
      "description": "string",
      "cost": { "min": number, "max": number },
      "timeline": "string",
      "pros": ["pro1", "pro2"],
      "cons": ["con1", "con2"]
    }
  ],
  "selectedScenario": {
    "name": "string",
    "rationale": "2-3 sentences why this is best"
  },
  "cost": {
    "breakdown": [
      { "category": "Grundlön", "amount": 720000 },
      { "category": "Arbetsgivaravgifter", "amount": 200000 },
      { "category": "Benefits & förmåner", "amount": 80000 }
    ],
    "total": 1000000,
    "roi": "Expected to deliver 10x value within 12 months through scaling"
  },
  "timeline": {
    "milestones": [
      { "week": "Vecka 1-2", "task": "Skriv och publicera JD", "owner": "CTO" },
      { "week": "Vecka 3-6", "task": "Sourcing & screening", "owner": "HR" },
      { "week": "Vecka 7-8", "task": "Tekniska intervjuer", "owner": "Team" },
      { "week": "Vecka 9-10", "task": "Final intervjuer", "owner": "CEO + CTO" },
      { "week": "Vecka 11", "task": "Offer & förhandling", "owner": "CEO" },
      { "week": "Vecka 12", "task": "Start & onboarding", "owner": "CTO" }
    ]
  },
  "recommendations": [
    "Start recruitment immediately - market is competitive",
    "Focus on microservices experience over specific languages",
    "Plan for 3-4 month onboarding period",
    "Consider contractor overlap during transition",
    "Set clear 90-day success metrics"
  ],
  "nextSteps": [
    { "action": "Download och publicera JD från Toolbox", "owner": "CTO", "deadline": "Denna vecka" },
    { "action": "Identifiera 10+ kandidater på LinkedIn", "owner": "HR", "deadline": "Vecka 2" },
    { "action": "Boka intervjutider med teamet", "owner": "Team Lead", "deadline": "Vecka 3" },
    { "action": "Säkra budget-godkännande från CFO", "owner": "CEO", "deadline": "Omedelbart" }
  ]
}

CRITICAL: Base everything on the actual conversation. Extract real company name, real numbers, real challenges. Make it SPECIFIC to their situation.

Output ONLY valid JSON.`;
}

