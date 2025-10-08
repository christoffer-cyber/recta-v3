// Core conversation types
export type Phase = 'context' | 'problem-discovery' | 'solution-design' | 'action-plan';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CompanyInfo {
  name?: string;
  size?: number;
  industry?: string;
  location?: string;
  stage?: 'seed' | 'seriesA' | 'seriesB' | 'growth';
  funding?: number;
}

export interface ProblemInfo {
  summary?: string;
  rootCause?: string;
  urgency?: 'low' | 'medium' | 'high';
  constraints?: string[];
}

export interface Claim {
  statement: string;
  confidence: 'certain' | 'uncertain' | 'conflicting';
  timestamp: string;
}

export interface PhaseProgress {
  context: number;      // 0-100%
  'problem-discovery': number;
  'solution-design': number;
  'action-plan': number;
}

export interface QualitySignals {
  hasContradictions: boolean;
  vaguenessScore: number;     // 0-100
  missingInfo: string[];
  readyToAdvance: boolean;
}

export interface ConversationState {
  company: CompanyInfo;
  problem: ProblemInfo;
  claims: Claim[];
  currentPhase: Phase;
  phaseProgress: PhaseProgress;
  quality: QualitySignals;
  scenarios?: Array<{
    name: string;
    description: string;
    pros: string[];
    cons: string[];
    cost: number;
  }>;
}

export interface ClaudeResponse {
  message: string;
  conversationState: ConversationState;
  canvasAction?: 'show_org_chart' | 'show_cost' | 'show_timeline' | 'show_benchmarks' | 'show_scenarios' | 'show_research';
  canvasData?: Record<string, unknown>;
  phase: Phase;
  confidence: number; // 0-1
}

// Scenario types for Solution Design
export interface Scenario {
  id: string;
  name: string;
  description: string;
  approach: string;
  pros: string[];
  cons: string[];
  cost: {
    min: number;
    max: number;
    currency: 'SEK' | 'USD' | 'EUR';
  };
  timeline: string;
  risk: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface ScenarioComparison {
  scenarios: Scenario[];
  recommendation?: string;
  reasoning?: string;
}
