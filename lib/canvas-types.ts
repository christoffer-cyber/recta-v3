export type CanvasState = 
  | 'empty'
  | 'phase-progress'
  | 'jd-preview'
  | 'research'
  | 'scenarios'
  | 'benchmarks'
  | 'deliverables';

export interface JobDescriptionPreview {
  title: string;
  responsibilities: string[];
  qualifications: string[];
  compensation?: {
    min: number;
    max: number;
    currency: string;
  };
  completeness: number; // 0-100%
}

export interface PhaseVisualization {
  currentPhase: string;
  completedPhases: string[];
  insights: string[];
  confidence: number; // 0-100%
}
