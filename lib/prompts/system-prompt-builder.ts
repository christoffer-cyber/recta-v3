import { PHASE_PROMPTS, type PhasePromptConfig } from './phase-prompts';

export interface SystemPromptOptions {
  phase: string;
  insights: string[];
  confidence: number;
  researchContext?: string;
  isNewPhase?: boolean;
}

export function buildSystemPrompt(options: SystemPromptOptions): string {
  const config = PHASE_PROMPTS[options.phase];
  
  if (!config) {
    console.warn(`[Prompt Builder] Unknown phase: ${options.phase}, using Context`);
    return buildSystemPrompt({ ...options, phase: 'Context' });
  }

  const basePrompt = buildBasePrompt(config);
  const contextSection = buildContextSection(options.insights, options.confidence, config, options.isNewPhase);
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
  config: PhasePromptConfig,
  isNewPhase?: boolean
): string {
  // SIMPLE: If no insights or very low confidence, start fresh
  if (insights.length === 0 || confidence < 20) {
    return `## NUVARANDE SITUATION:
Vi har INTE samlat information än (${confidence}% confidence).

**DIN UPPGIFT:** Ställ frågor för att samla:

REQUIRED (måste ha):
${config.insightCategories.required.map(c => `- ${c}`).join('\n')}

OPTIONAL (bonus):
${config.insightCategories.optional.map(c => `- ${c}`).join('\n')}

**BÖRJA med att ställa EN fråga om en av required kategorierna.**`;
  }

  // Show what we have
  const grouped = groupInsightsByCategory(insights);
  const missingRequired = config.insightCategories.required.filter(
    cat => !grouped[cat] || grouped[cat].length === 0
  );

  let status = '';
  if (missingRequired.length > 0) {
    status = `

**SAKNAS (fråga om dessa):**
${missingRequired.map(c => `- ${c}`).join('\n')}`;
  } else if (confidence < 90) {
    status = `

**Fortsätt samla mer detaljer (confidence: ${confidence}%)**`;
  } else {
    status = `

**✓ Klar! (confidence: ${confidence}%)**`;
  }

  return `## NUVARANDE SITUATION:
Vi har samlat (${confidence}% confidence):

${insights.slice(0, 5).map((insight, i) => `${i + 1}. ${insight}`).join('\n')}
${insights.length > 5 ? `... och ${insights.length - 5} till` : ''}${status}

**Fortsätt ställa frågor tills confidence når 90%+.**`;
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
- Var vänlig och professionell
- Ställ EN fråga åt gången
- Lyssna på svaren och bygg vidare
- Använd naturlig svenska

## KRITISKA REGLER:
- SÄG ALDRIG bara "Tack för informationen!" - ställ alltid en följdfråga
- Om confidence < 90%: FORTSÄTT STÄLLA FRÅGOR
- Ställ frågor om saknade kategorier (se ovan)
- Extrahera insights i KATEGORI-format (se nedan)

## EXEMPEL PÅ BRA SÄTT ATT SVARA:
❌ DÅLIGT: "Tack för informationen!"
✅ BRA: "Tack! Nu förstår jag att ni är 25 personer. Vilken typ av roll letar ni efter?"

❌ DÅLIGT: "Okej, bra."
✅ BRA: "Perfekt! Ni söker alltså en CTO. Berätta mer om er nuvarande tech-stack - vilka teknologier använder ni?"`;
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

