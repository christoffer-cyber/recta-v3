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

**Context-fasen klar!** ✅

Nu går vi vidare till **Problem Discovery** där vi identifierar det verkliga problemet bakom behovet.

Låt oss börja: Vad är den **största utmaningen** just nu som gör att ni behöver denna person?`
  },
  {
    id: 'problem-discovery',
    name: 'Problem Discovery',
    nextPhase: 'Solution Design',
    welcomeMessage: `Perfekt! Context-fasen klar.

Nu **BÖRJAR Problem Discovery** 🔍

Låt oss gräva djupare: **Vad är den största utmaningen just nu** som gör att ni behöver denna person?`
  },
  {
    id: 'solution-design',
    name: 'Solution Design',
    nextPhase: 'Action Plan',
    welcomeMessage: `Utmärkt! Problem Discovery klar.

Nu **BÖRJAR Solution Design** 💡

**Hur har ni tänkt lösa detta?** Anställa en person, flera, eller kanske en konsult?`
  },
  {
    id: 'action-plan',
    name: 'Action Plan',
    nextPhase: null,
    welcomeMessage: `Utmärkt! Nu har ni valt lösningsväg.

Nu **BÖRJAR Action Plan** 📋

**När vill ni att personen ska vara på plats?** Hur snabbt kan ni röra er?`
  }
];

export function getPhaseConfig(phaseName: string): PhaseConfig | undefined {
  return PHASE_CONFIGS.find(p => phaseName.includes(p.name));
}
