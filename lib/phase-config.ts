export interface PhaseConfig {
  id: string;
  name: string;
  nextPhase: string | null;
  welcomeMessage: string;
}

export const PHASE_CONFIGS: PhaseConfig[] = [
  {
    id: 'context',
    name: 'Context',
    nextPhase: 'Problem Discovery',
    welcomeMessage: `Bra jobbat! Vi har nu en tydlig bild av er situation.

**Fas 1 klar:** Context

Nu går vi vidare till **Problem Discovery** där vi identifierar det verkliga problemet bakom behovet.

Vad är den **största utmaningen** just nu som gör att ni behöver denna person?`
  },
  {
    id: 'problem-discovery',
    name: 'Problem Discovery',
    nextPhase: 'Solution Design',
    welcomeMessage: `Utmärkt! Vi förstår nu problemet.

**Fas 2 klar:** Problem Discovery

Nu går vi vidare till **Solution Design** där vi utforskar möjliga lösningar och strategier.

Baserat på det verkliga problemet - vilka olika sätt skulle kunna lösa detta?`
  },
  {
    id: 'solution-design',
    name: 'Solution Design',
    nextPhase: 'Action Plan',
    welcomeMessage: `Perfekt! Vi har identifierat lösningar.

**Fas 3 klar:** Solution Design

Nu skapar vi er **Action Plan** - konkreta nästa steg.

Vad är den viktigaste åtgärden att ta nu?`
  },
  {
    id: 'action-plan',
    name: 'Action Plan',
    nextPhase: null,
    welcomeMessage: `Grattis! Alla faser klara.

**Fas 4 klar:** Action Plan

Nu har ni en komplett strategi. Låt oss sammanfatta och skapa era deliverables.`
  }
];

export function getPhaseConfig(phaseName: string): PhaseConfig | undefined {
  return PHASE_CONFIGS.find(p => phaseName.includes(p.name));
}
