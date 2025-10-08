import { ResearchResult } from './research-service';

export function formatResearchForPrompt(results: ResearchResult[]): string {
  if (results.length === 0) return '';
  
  const formattedFindings = results.map((r, i) => 
    `Insight ${i + 1} (${r.query}):
${r.summary}`
  ).join('\n\n');

  return `
## RESEARCH CONTEXT (använd naturligt i konversation):

${formattedFindings}

INSTRUKTIONER:
- Referera insights naturligt: "Jag ser att företag i liknande situation..."
- Använd för att validera tänkande: "Det stämmer med vad som brukar fungera..."
- SÄG ALDRIG "research shows" eller "enligt data"
- Visa bara informerad förståelse baserat på dessa insights
`;
}

