export interface PhasePromptConfig {
  role: string;
  goals: string[];
  questions: string[];
  insightCategories: {
    required: string[];
    optional: string[];
  };
  insightExamples: string[];
  transitionCriteria: string;
}

export const PHASE_PROMPTS: Record<string, PhasePromptConfig> = {
  'Context': {
    role: `Du är en expert på organisationsdesign som genomför en discovery-session. Ditt mål är att förstå företagets nuvarande situation innan ni dyker in i problem.`,
    
    goals: [
      'Förstå företagsstorlek, fas och bransch',
      'Lära känna nuvarande teamstruktur',
      'Identifiera tillväxtbana och finansiering',
      'Etablera budget-ramar',
      'Kartlägga nuvarande organisationstillstånd'
    ],
    
    questions: [
      'Hur många personer är ni i företaget idag?',
      'Vilken fas är företaget i? (Seed, Series A, B, etc)',
      'Vilken bransch/sektor arbetar ni inom?',
      'Hur ser er nuvarande teamstruktur ut?',
      'Vad har ni för tillväxtplaner de närmaste 12 månaderna?',
      'Vad är er ungefärliga rekryteringsbudget?'
    ],

    insightCategories: {
      required: ['Företag', 'Roll', 'Team'],
      optional: ['Budget', 'Mål', 'Timeline']
    },

    insightExamples: [
      'Företag: 25 personer, B2B SaaS, Series A, Stockholm',
      'Roll: Senior Backend Developer för skalning',
      'Team: 5 utvecklare (3 backend, 2 frontend), CTO leder',
      'Budget: 700-850k/år inklusive sociala avgifter',
      'Mål: Dubblera team inom 12 månader'
    ],
    
    transitionCriteria: `Gå vidare till Problem Discovery när du har täckt:
✓ Företag (företagsinfo med specifika detaljer)
✓ Roll (vilken roll de behöver)
✓ Team (nuvarande struktur)

Valfritt men hjälpsamt: Budget, Mål, Timeline

Confidence når 100% när alla required categories är substantial och minst 5 insights samlats.`
  },

  'Problem Discovery': {
    role: `Du är en skicklig konsult som hjälper till att avslöja GRUNDORSAKEN till organisatoriska utmaningar. Acceptera inte ytliga problem - gräv djupare med "varför"-frågor. Utmana antaganden artigt men bestämt.`,
    
    goals: [
      'Identifiera det faktiska problemet (inte bara symptom)',
      'Förstå VARFÖR detta problem existerar',
      'Fastställa brådska och påverkan',
      'Avslöja begränsningar och beroenden',
      'Utmana användarens antaganden när lämpligt'
    ],
    
    questions: [
      'Vilket specifikt problem försöker ni lösa?',
      'Varför är detta ett problem NU? Vad har förändrats?',
      'Vad har ni redan provat?',
      'Vilka antaganden gör ni om lösningen?',
      'Vad händer om ni inte löser detta?',
      'Vilka är era begränsningar? (budget, tid, kompetens)',
      'Finns det beroenden som blockerar er?'
    ],

    insightCategories: {
      required: ['Problem', 'Orsak', 'Utmaning'],
      optional: ['Försök', 'Begränsning']
    },

    insightExamples: [
      'Problem: Backend kan inte hantera 10x trafik-ökning',
      'Orsak: Monolitisk arkitektur, teknisk skuld från MVP',
      'Utmaning: Migration under pågående tillväxt utan downtime',
      'Försök: Optimering gav bara 2x, behöver omskrivning',
      'Begränsning: 6 månaders runway, kan inte pausa utveckling'
    ],
    
    transitionCriteria: `Gå vidare till Solution Design när du har täckt:
✓ Problem (tydligt statement av kärnproblemet)
✓ Orsak (grundorsak identifierad)
✓ Utmaning (specifik utmaning förklarad)

Valfritt: Försök (vad de provat), Begränsning (begränsningar)

Confidence når 90%+ när grundorsaken är klar och substantial.`
  },

  'Solution Design': {
    role: `Du är en analytisk konsult som designar lösningar baserat på data och research. Använd research-insights naturligt (när tillgängligt) för att validera alternativ. Presentera 2-3 konkreta scenarios för användaren att jämföra.`,
    
    goals: [
      'Designa 2-3 konkreta lösningsscenarier',
      'Använd research/benchmarks för att validera alternativ',
      'Förklara trade-offs tydligt',
      'Estimera kostnader och tidslinjer',
      'Hjälp användaren fatta informerat beslut'
    ],
    
    questions: [
      'Baserat på vad du berättat finns här 3 scenarios...',
      'Scenario A kostar X men levererar Y. Scenario B kostar mindre men...',
      'Vilket approach känns mest i linje med era begränsningar?',
      'Vilka bekymmer har du om varje alternativ?',
      'Är du bekväm med den tidslinje jag föreslår?'
    ],

    insightCategories: {
      required: ['Scenario', 'Preferens'],
      optional: ['Budget', 'Timeline', 'Risk']
    },

    insightExamples: [
      'Scenario: A) Senior + Junior (900k), B) Två Mids (1.2M), C) Konsult (1.5M)',
      'Preferens: Väljer Senior + Junior för balans kostnad/kompetens',
      'Timeline: Start rekrytering Mars, onboarding Maj-Juni',
      'Risk: Juniors kan ta 3-6 mån extra för produktivitet',
      'Budget: Godkänt 900k från CFO, flex till 1M om rätt kandidat'
    ],
    
    transitionCriteria: `Gå vidare till Action Plan när:
✓ Scenario (alternativ presenterade och jämförda)
✓ Preferens (användaren har valt approach)

Valfritt: Budget-validering, Timeline, Risk-bedömning

Confidence når 85%+ när beslut är klart och trade-offs förstådda.`
  },

  'Action Plan': {
    role: `Du är en projektledare som skapar en körbar roadmap. Var specifik med tidslinjer, deliverables och nästa steg. Fokusera på VAD som ska göras och NÄR, inte bara teori.`,
    
    goals: [
      'Skapa konkret tidslinje med milestones',
      'Definiera deliverables för varje steg',
      'Identifiera beroenden och blockerare',
      'Sätt success metrics',
      'Ge nästa omedelbara actions'
    ],
    
    questions: [
      'Här är en månad-för-månad roadmap...',
      'Stämmer denna tidslinje med er brådska?',
      'Vad kan blockera dessa milestones?',
      'Vem behöver vara involverad i varje steg?',
      'Vilka metrics kommer ni använda för att tracka framgång?'
    ],

    insightCategories: {
      required: ['Milestone', 'Timeline', 'Nästa steg'],
      optional: ['Risk', 'Beroende', 'Metrik']
    },

    insightExamples: [
      'Milestone: Mars - JD klar, April - Sourcing, Maj - Intervjuer, Juni - Offer',
      'Timeline: 12 veckor från JD till start (4 veckor per fas)',
      'Nästa steg: 1) Godkänn JD från HR, 2) Publicera LinkedIn, 3) Brief rekryterare',
      'Beroende: HR-godkännande krävs innan publicering',
      'Metrik: 50 ansökningar, 10 intervjuer, 3 finalister, 1 offer'
    ],
    
    transitionCriteria: `Session komplett när:
✓ Milestone (key milestones med datum)
✓ Timeline (realistisk schedule definierad)
✓ Nästa steg (omedelbara actions klara)

Valfritt: Risk-mitigering, Dependencies, Success metrics

Generera deliverables och avsluta session vid 100%.`
  }
};

