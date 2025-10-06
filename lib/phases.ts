import { Phase } from './types';

export interface PhaseConfig {
  id: Phase;
  title: string;
  description: string;
  icon: string;
  questions: string[];
  requiredInsights: number;
}

export const PHASES: PhaseConfig[] = [
  {
    id: 'context',
    title: 'Context',
    description: 'Understanding the company, team, and current situation',
    icon: '🏢',
    questions: [
      'Hur många är ni i företaget?',
      'Vilken bransch verkar ni i?',
      'I vilket skede är företaget?'
    ],
    requiredInsights: 5
  },
  {
    id: 'problem-discovery',
    title: 'Problem Discovery',
    description: 'Identifying the root cause of the challenge',
    icon: '🔍',
    questions: [
      'Vad är det verkliga problemet?',
      'Varför just nu?',
      'Vad har ni provat tidigare?'
    ],
    requiredInsights: 6
  },
  {
    id: 'solution-design',
    title: 'Solution Design',
    description: 'Exploring solutions and scenarios',
    icon: '💡',
    questions: [
      'Vilka alternativa lösningar finns?',
      'Vad behöver ni för att lyckas?',
      'Vilka begränsningar har ni?'
    ],
    requiredInsights: 7
  },
  {
    id: 'action-plan',
    title: 'Action Plan',
    description: 'Concrete roadmap and next steps',
    icon: '📋',
    questions: [
      'Vad är nästa steg?',
      'Vem ansvarar för vad?',
      'När ska det vara klart?'
    ],
    requiredInsights: 5
  }
];

export function getPhaseById(id: Phase): PhaseConfig | undefined {
  return PHASES.find(p => p.id === id);
}

export function getNextPhase(currentPhase: Phase): Phase | null {
  const currentIndex = PHASES.findIndex(p => p.id === currentPhase);
  if (currentIndex < PHASES.length - 1) {
    return PHASES[currentIndex + 1].id;
  }
  return null;
}
