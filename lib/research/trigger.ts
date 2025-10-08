import { RESEARCH_CONFIG, type PhaseId } from './config';
import { extractEntities, hasRequiredEntities } from './entity-extractor';

export interface ConversationState {
  currentPhase: PhaseId;
  confidence: number;
  insights: string[];
}

export function shouldTriggerResearch(state: ConversationState): boolean {
  const config = RESEARCH_CONFIG[state.currentPhase];
  
  console.log('[Research Trigger] Evaluating:', {
    phase: state.currentPhase,
    enabled: config.enabled,
    confidence: state.confidence,
    minConfidence: config.minConfidence
  });
  
  // Check if research is enabled for this phase
  if (!config.enabled) {
    console.log('[Research Trigger] Research disabled for', state.currentPhase);
    return false;
  }
  
  // Check confidence threshold
  if (state.confidence < config.minConfidence) {
    console.log('[Research Trigger] Confidence too low:', state.confidence, '<', config.minConfidence);
    return false;
  }
  
  // Check if we have required entities
  if (config.requiredEntities.length > 0) {
    const entities = extractEntities(state.insights);
    if (!hasRequiredEntities(entities, config.requiredEntities)) {
      return false;
    }
  }
  
  console.log('[Research Trigger] ✓ All conditions met, triggering research');
  return true;
}

