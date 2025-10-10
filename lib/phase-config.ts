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

Mitt mål nu är att förstå det VERKLIGA problemet bakom behovet (inte bara symptomen).

Berätta: Vilket specifikt problem försöker ni lösa genom att anställa denna person?`
  },
  {
    id: 'solution-design',
    name: 'Solution Design',
    nextPhase: 'Action Plan',
    welcomeMessage: `Utmärkt! Problem Discovery klar.

Nu **BÖRJAR Solution Design** 💡

Jag ska nu hjälpa er designa 2-3 konkreta lösningsscenarier baserat på problemet vi identifierat.

Låt mig tänka 20 sekunder och analysera möjliga vägar framåt...`
  },
  {
    id: 'action-plan',
    name: 'Action Plan',
    nextPhase: null,
    welcomeMessage: `Utmärkt! Nu har ni valt lösningsväg.

Nu **BÖRJAR Action Plan** 📋

För att skapa en konkret, körbar handlingsplan med tidslinjer och nästa steg...

**Vem äger rekryteringsprocessen?** (VD, HR, eller någon annan?)`
  }
];

export function getPhaseConfig(phaseName: string): PhaseConfig | undefined {
  return PHASE_CONFIGS.find(p => phaseName.includes(p.name));
}
