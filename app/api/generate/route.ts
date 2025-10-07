import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { DeliverableSchemas, DeliverableType } from '@/lib/deliverable-schemas';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, insights } = body as {
      type: DeliverableType;
      insights: string[];
    };

    if (!type || !insights || insights.length === 0) {
      return NextResponse.json(
        { error: 'Type and insights required' },
        { status: 400 }
      );
    }

    console.log(`[Generate] Creating ${type} from ${insights.length} insights`);

    const context = insights.join('\n');
    const schema = DeliverableSchemas[type];

    if (!schema) {
      return NextResponse.json(
        { error: `Unknown type: ${type}` },
        { status: 400 }
      );
    }

    // Call Claude with tool_use
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools: [{
        name: `generate_${type}`,
        description: getToolDescription(type),
        input_schema: schema
      }],
      messages: [{
        role: 'user',
        content: buildPrompt(type, context)
      }]
    });

    // Extract tool_use response
    const toolUse = response.content.find(block => block.type === 'tool_use');
    
    if (!toolUse || toolUse.type !== 'tool_use') {
      console.error('[Generate] No tool use in response');
      return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
    }

    console.log(`[Generate] Successfully created ${type}`);

    return NextResponse.json({
      type,
      deliverable: toolUse.input
    });

  } catch (error: unknown) {
    console.error('[Generate] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Generation failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

function getToolDescription(type: DeliverableType): string {
  const descriptions = {
    job_description: 'Generate a complete, professional job description',
    compensation_analysis: 'Analyze market compensation and provide recommendation',
    interview_questions: 'Create comprehensive interview questions with assessment guidance',
    success_plan: 'Create a detailed 30-60-90 day success plan',
    scenario_comparison: 'Compare multiple hiring scenarios and provide recommendation'
  };
  return descriptions[type];
}

function buildPrompt(type: DeliverableType, context: string): string {
  const basePrompt = `Based on these conversation insights, generate a ${type.replace('_', ' ')}:

INSIGHTS:
${context}

REQUIREMENTS:`;

  const requirements = {
    job_description: `
- Specific to this exact situation (not generic)
- Realistic compensation for Swedish market
- Practical 30-60-90 day success plan
- Specific qualifications relevant to their needs`,

    compensation_analysis: `
- Realistic Swedish market salary ranges
- Include arbetsgivaravgift (~31%)
- Strategic positioning recommendation
- Clear rationale`,

    interview_questions: `
- 8-12 questions across categories (strategy, leadership, technical, culture)
- Specific to role and situation
- Actionable "what to listen for" and red flags
- Practical assessment guidance`,

    success_plan: `
- Specific to role and company situation
- 30 days: Learning & relationships
- 60 days: Quick wins & initiatives
- 90 days: Strategic impact
- Address specific problems mentioned`,

    scenario_comparison: `
- 3-4 distinct realistic scenarios
- Realistic Swedish market costs
- Honest pros/cons for each
- Clear recommendation with rationale`
  };

  return basePrompt + requirements[type] + '\n\nGenerate now using the tool.';
}

