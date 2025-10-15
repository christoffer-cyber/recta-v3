// Canvas State Machine - Priority-based visualization rendering

export type CanvasStateType = 
  | 'generation-progress'  // Highest priority: Deliverable generation in progress
  | 'research'             // High priority: Research in progress
  | 'generating-scenarios' // Medium-high priority: Scenarios being generated
  | 'scenarios'            // Medium priority: Solution scenarios available
  | 'confidence'           // Low priority: Confidence breakdown
  | 'phase-progress';      // Default: Phase progress visualization

export interface CanvasStateMachine {
  isGenerating: boolean;
  isResearching: boolean;
  isGeneratingScenarios: boolean;
  hasScenarios: boolean;
  currentPhase: string;
  confidence: number;
  insights: string[];
}

/**
 * Determines the active canvas state based on priority hierarchy
 * 
 * Priority (highest to lowest):
 * 1. Generation Progress - Show when deliverables are being generated
 * 2. Research - Show when research is active
 * 3. Generating Scenarios - Show when scenarios are being generated
 * 4. Scenarios - Show when scenarios are available (Solution Design phase)
 * 5. Confidence Breakdown - Show when confidence < 100%
 * 6. Phase Progress - Default visualization
 */
export function getActiveCanvasState(machine: CanvasStateMachine): CanvasStateType {
  // Priority 1: Generation in progress
  if (machine.isGenerating) {
    return 'generation-progress';
  }

  // Priority 2: Research in progress
  if (machine.isResearching) {
    return 'research';
  }

  // Priority 3: Generating scenarios
  if (machine.isGeneratingScenarios) {
    return 'generating-scenarios';
  }

  // Priority 4: Scenarios available (Solution Design phase only)
  if (machine.hasScenarios && machine.currentPhase.includes('Solution Design')) {
    return 'scenarios';
  }

  // Priority 5: Confidence breakdown (when not at 100%)
  if (machine.confidence < 100 && machine.insights.length > 0) {
    return 'confidence';
  }

  // Priority 6: Default phase progress
  return 'phase-progress';
}

/**
 * Determines if the progress banner should be shown at the top
 */
export function shouldShowProgressBanner(machine: CanvasStateMachine): boolean {
  return machine.isGenerating;
}

/**
 * Helper to create a canvas state machine from current state
 */
export function createCanvasStateMachine(
  isGenerating: boolean,
  isResearching: boolean,
  scenarios: any[] | undefined,
  currentPhase: string,
  confidence: number,
  insights: string[],
  isGeneratingScenarios: boolean = false
): CanvasStateMachine {
  return {
    isGenerating,
    isResearching,
    isGeneratingScenarios,
    hasScenarios: (scenarios && scenarios.length > 0) || false,
    currentPhase,
    confidence,
    insights
  };
}
