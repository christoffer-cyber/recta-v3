import Anthropic from '@anthropic-ai/sdk';
import { RESEARCH_CONFIG, type PhaseId } from './config';
import { extractEntities } from './entity-extractor';
import { generateQueries } from './query-generator';

export interface ResearchResult {
  query: string;
  summary: string;
  confidence: number;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function executeResearch(
  insights: string[],
  phase: PhaseId
): Promise<ResearchResult[]> {
  const config = RESEARCH_CONFIG[phase];
  
  if (!config.enabled || !config.queryTemplates) {
    console.log('[Research] Research not enabled for', phase);
    return [];
  }

  console.log('[Research] Starting research for', phase);

  // Extract entities from insights
  const entities = extractEntities(insights);
  
  // Generate queries from templates
  const queries = generateQueries(config.queryTemplates, entities);
  
  if (queries.length === 0) {
    console.log('[Research] No queries generated (missing entities)');
    return [];
  }
  
  // Limit to max queries
  const limitedQueries = queries.slice(0, config.maxQueries);
  console.log('[Research] Executing', limitedQueries.length, 'queries');
  
  // Execute research for each query
  const results = await Promise.all(
    limitedQueries.map(query => researchQuery(query))
  );
  
  const successfulResults = results.filter(r => r !== null) as ResearchResult[];
  console.log('[Research] Completed:', successfulResults.length, 'successful');
  
  return successfulResults;
}

async function researchQuery(query: string): Promise<ResearchResult | null> {
  try {
    console.log('[Research Query] Executing:', query);
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Research this topic and provide specific, actionable insights for Swedish market context:

${query}

Focus on:
- Specific numbers and ranges (salaries, timelines, costs)
- Current market trends (2024-2025)
- Common patterns and best practices
- Swedish market specifics when relevant

Be concise (2-3 sentences max). No general advice - only data-driven insights.`
      }],
      tools: [{
        name: 'web_search',
        description: 'Search the web for current information',
        input_schema: {
          type: 'object' as const,
          properties: {
            query: {
              type: 'string' as const,
              description: 'Search query'
            }
          },
          required: ['query']
        }
      }]
    });
    
    // Extract text from response
    let summary = '';
    for (const block of response.content) {
      if (block.type === 'text') {
        summary += block.text;
      }
    }
    
    if (!summary.trim()) {
      console.log('[Research Query] No summary generated for:', query);
      return null;
    }
    
    console.log('[Research Query] Success:', query, '→', summary.substring(0, 100) + '...');
    
    return {
      query,
      summary: summary.trim(),
      confidence: 0.75
    };
    
  } catch (error) {
    console.error('[Research Query] Error:', query, error);
    return null;
  }
}

