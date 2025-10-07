import { PHASE_PROMPTS, type PhasePromptConfig } from './phase-prompts';

export interface SystemPromptOptions {
  phase: string;
  insights: string[];
  confidence: number;
  researchContext?: string;
}

export function buildSystemPrompt(options: SystemPromptOptions): string {
  const config = PHASE_PROMPTS[options.phase];
  
  if (!config) {
    console.warn(`[Prompt Builder] Unknown phase: ${options.phase}, using Context`);
    return buildSystemPrompt({ ...options, phase: 'Context' });
  }

  const basePrompt = buildBasePrompt(config);
  const contextSection = buildContextSection(options.insights, options.confidence, config);
  const researchSection = options.researchContext || '';
  const behaviorGuidelines = buildBehaviorGuidelines();
  const insightExtraction = buildInsightExtraction(config);

  return `${basePrompt}

${contextSection}

${researchSection}

${behaviorGuidelines}

${insightExtraction}`;
}

function buildBasePrompt(config: PhasePromptConfig): string {
  return `${config.role}

## DINA MÅL I DENNA FAS:
${config.goals.map((g, i) => `${i + 1}. ${g}`).join('\n')}

## NYCKELFRÅGOR ATT UTFORSKA:
${config.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

## ÖVERGÅNGSKRITERIER:
${config.transitionCriteria}`;
}

function buildContextSection(
  insights: string[], 
  confidence: number,
  config: PhasePromptConfig
): string {
  if (insights.length === 0) {
    return `## NUVARANDE KONTEXT:
Inga insights samlade än (${confidence}% confidence).

Börja samla dessa REQUIRED kategorier:
${config.insightCategories.required.map(c => `- ${c}`).join('\n')}

Valfria kategorier (bonus):
${config.insightCategories.optional.map(c => `- ${c}`).join('\n')}`;
  }

  // Group insights by category
  const grouped = groupInsightsByCategory(insights);
  const deduplicatedInsights = Array.from(new Set(insights));

  // Check coverage
  const missingRequired = config.insightCategories.required.filter(
    cat => !grouped[cat] || grouped[cat].length === 0
  );

  let coverageStatus = '';
  if (missingRequired.length > 0) {
    coverageStatus = `

**SAKNAS REQUIRED KATEGORIER (fokusera här):**
${missingRequired.map(c => `- ${c}`).join('\n')}`;
  } else {
    coverageStatus = '\n\n✓ Alla required kategorier täckta!';
  }

  return `## NUVARANDE KONTEXT:
Vi har samlat ${insights.length} insights (${confidence}% confidence):

${deduplicatedInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}
${coverageStatus}

**Bygg på dessa insights - fråga inte om information vi redan har.**`;
}

function groupInsightsByCategory(insights: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  insights.forEach(insight => {
    const [category] = insight.split(':');
    const cat = category.trim();
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(insight);
  });
  
  return grouped;
}

function buildBehaviorGuidelines(): string {
  return `## KONVERSATIONSSTIL:
- Var samtalsam och naturlig, inte robotisk
- Ställ EN fråga åt gången (max två om nära relaterade)
- Lyssna aktivt - referera till vad användaren sa tidigare
- Använd "Jag förstår" och "Det låter vettigt" för att visa förståelse
- Utmana antaganden artigt när det behövs
- Var koncis - undvik långa förklaringar om inte ombedd
- Naturlig svenska (du kan mixa in engelska termer när lämpligt)

## RESEARCH-ANVÄNDNING (om tillgänglig):
När research-kontext finns:
- Referera insights naturligt: "Jag ser att företag i liknande situation..."
- Använd för att validera tänkande: "Det stämmer med vad som brukar fungera..."
- SÄG ALDRIG "research shows" eller "enligt data"
- Visa bara informerad förståelse

## VIKTIGA REGLER:
- Extrahera insights kontinuerligt i KATEGORI-format (se nedan)
- Upprepa inte frågor om info vi redan har
- Utveckla konversationen mot att täcka saknade kategorier
- Kvalitet över kvantitet - bara substantial insights
- Varje insight ska vara specifik och actionable`;
}

function buildInsightExtraction(config: PhasePromptConfig): string {
  return `## INSIGHT-EXTRAKTIONSFORMAT:

**KRITISKT: Använd kategori-prefix för att confidence-systemet ska fungera!**

Required kategorier för denna fas:
${config.insightCategories.required.map(c => `- ${c}:`).join('\n')}

Valfria kategorier (bonus):
${config.insightCategories.optional.map(c => `- ${c}:`).join('\n')}

**Format-regler:**
1. Börja med kategorinamn följt av kolon: "Företag:", "Problem:", etc
2. Var specifik och substantial (min 15-20 tecken faktiskt innehåll)
3. Använd inte "unknown", "ej specificerat", eller tomma värden
4. Uppdatera befintliga insights om ny info kompletterar dem
5. Extrahera bara NYA insights som inte redan finns i kontext

**Bra exempel:**
${config.insightExamples.map(e => `✓ ${e}`).join('\n')}

**Dåliga exempel:**
✗ Företag: okej (för vag, för kort)
✗ Roll: unknown (innehåller "unknown")
✗ Team: inte angivet (tomt värde)
✗ Budget: cirka (inget faktiskt nummer)

Lägg till insights i ditt svar med:
###INSIGHTS###
- [Kategori: specifikt substantial innehåll]
- [Kategori: specifikt substantial innehåll]

Kom ihåg: Kvalitet > Kvantitet. Bättre 2 substantial insights än 5 vaga.`;
}

