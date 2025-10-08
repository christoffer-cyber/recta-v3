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
  // CRITICAL: If brand new phase with 0 confidence, start completely fresh
  if (isNewPhase && confidence < 15) {
    return `## 🚨 VIKTIGT: DETTA ÄR EN NY FAS 🚨

Du har precis börjat fasen: ${config.role.split('Du är')[1] || 'denna fas'}

**IGNORERA all tidigare konversation om andra faser.**

Din ENDA uppgift nu är att samla information om:

REQUIRED (MÅSTE ha):
${config.insightCategories.required.map(c => `- ${c}`).join('\n')}

OPTIONAL (Bonus):
${config.insightCategories.optional.map(c => `- ${c}`).join('\n')}

**Confidence är ${confidence}% - du har INTE nog information än.**

**SÄG INTE "vi är klara" eller "redo att gå vidare".**
**BÖRJA ställa frågor relevanta för DENNA fas.**`;
  }

  // If no insights yet
  if (insights.length === 0) {
    return `## NUVARANDE KONTEXT:
Inga insights samlade än (${confidence}% confidence).

Börja samla dessa REQUIRED kategorier:
${config.insightCategories.required.map(c => `- ${c}`).join('\n')}

Valfria kategorier (bonus):
${config.insightCategories.optional.map(c => `- ${c}`).join('\n')}`;
  }

  // Filter insights - ONLY show phase-relevant ones
  const relevantCategories = [
    ...config.insightCategories.required,
    ...config.insightCategories.optional
  ];
  
  const relevantInsights = insights.filter(insight => {
    const category = insight.split(':')[0].trim();
    return relevantCategories.some(reqCat => 
      category.toLowerCase().includes(reqCat.toLowerCase()) ||
      reqCat.toLowerCase().includes(category.toLowerCase())
    );
  });

  // If NO relevant insights for THIS phase, treat as fresh start
  if (relevantInsights.length === 0 && confidence < 30) {
    return `## NUVARANDE KONTEXT:

Vi har information från tidigare fas, men för DENNA fas (${confidence}% confidence) behöver vi samla:

REQUIRED:
${config.insightCategories.required.map(c => `- ${c}`).join('\n')}

**Börja ställ frågor relevanta för dessa kategorier.**`;
  }

  // Show only relevant insights
  const grouped = groupInsightsByCategory(relevantInsights);
  const deduplicatedInsights = Array.from(new Set(relevantInsights));

  // Check coverage
  const missingRequired = config.insightCategories.required.filter(
    cat => !grouped[cat] || grouped[cat].length === 0
  );

  let coverageStatus = '';
  if (missingRequired.length > 0) {
    coverageStatus = `

**SAKNAS REQUIRED KATEGORIER (fokusera här):**
${missingRequired.map(c => `- ${c} ← FRÅGA OM DETTA!`).join('\n')}

**Du har INTE tillräckligt för att gå vidare än.**`;
  } else if (confidence < 90) {
    coverageStatus = `

✓ Required kategorier täckta, men confidence endast ${confidence}%.
**Fortsätt samla mer detaljer innan du säger "klart".**`;
  } else {
    coverageStatus = '\n\n✓ Alla required kategorier täckta med hög confidence!';
  }

  return `## NUVARANDE KONTEXT:
Vi har samlat ${relevantInsights.length} relevanta insights för denna fas (${confidence}% confidence):

${deduplicatedInsights.slice(0, 8).map((insight, i) => `${i + 1}. ${insight}`).join('\n')}
${deduplicatedInsights.length > 8 ? `... och ${deduplicatedInsights.length - 8} till` : ''}
${coverageStatus}

**Bygg på dessa insights - fortsätt ställa frågor tills confidence når 90%+.**`;
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

## 🚨 KRITISKT - FAS-REGLER:
- SÄG ALDRIG "vi är klara" eller "redo att gå vidare" förrän confidence är 90%+
- SÄG ALDRIG "perfekt, låt oss gå vidare" om du inte samlat ALL required information
- Om confidence < 90%: FORTSÄTT STÄLLA FRÅGOR
- Varje fas måste genomföras ordentligt - INGEN genväg

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

