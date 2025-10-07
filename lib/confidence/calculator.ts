import { PHASE_REQUIREMENTS } from './config';

export interface ConfidenceResult {
  confidence: number;      // 0-100
  breakdown: {
    insightCount: number;
    substantialCount: number;
    requiredCovered: number;
    requiredTotal: number;
    optionalCovered: number;
  };
  missingCategories: string[];
}

export function calculateConfidence(
  phase: string,
  insights: string[]
): ConfidenceResult {
  const requirements = PHASE_REQUIREMENTS[phase];
  
  if (!requirements) {
    console.warn(`[Confidence] Unknown phase: ${phase}, defaulting to 0`);
    return {
      confidence: 0,
      breakdown: {
        insightCount: 0,
        substantialCount: 0,
        requiredCovered: 0,
        requiredTotal: 0,
        optionalCovered: 0
      },
      missingCategories: []
    };
  }

  // Filter out low-quality insights
  const substantialInsights = insights.filter(
    insight => isSubstantial(insight, requirements.qualityThreshold)
  );

  // Check which categories are covered
  const coveredRequired = requirements.requiredCategories.filter(
    category => hasCategoryInsight(insights, category)
  );

  const coveredOptional = requirements.optionalCategories.filter(
    category => hasCategoryInsight(insights, category)
  );

  // Calculate confidence using weighted scoring
  const scores = {
    // 50% weight: Required categories coverage
    requiredScore: (coveredRequired.length / requirements.requiredCategories.length) * 50,
    
    // 30% weight: Substantial insights count
    insightScore: Math.min(
      (substantialInsights.length / requirements.minInsights) * 30,
      30
    ),
    
    // 20% weight: Optional categories coverage (bonus)
    optionalScore: requirements.optionalCategories.length > 0
      ? (coveredOptional.length / requirements.optionalCategories.length) * 20
      : 20  // Full bonus if no optional categories
  };

  const totalConfidence = Math.round(
    scores.requiredScore + scores.insightScore + scores.optionalScore
  );

  // Find missing required categories
  const missingCategories = requirements.requiredCategories.filter(
    category => !coveredRequired.includes(category)
  );

  // Log for debugging
  console.log('[Confidence] Phase:', phase);
  console.log('[Confidence] Total insights:', insights.length);
  console.log('[Confidence] Substantial:', substantialInsights.length);
  console.log('[Confidence] Required covered:', coveredRequired);
  console.log('[Confidence] Missing:', missingCategories);
  console.log('[Confidence] Scores:', scores);
  console.log('[Confidence] Final score:', totalConfidence);

  return {
    confidence: Math.min(100, totalConfidence),
    breakdown: {
      insightCount: insights.length,
      substantialCount: substantialInsights.length,
      requiredCovered: coveredRequired.length,
      requiredTotal: requirements.requiredCategories.length,
      optionalCovered: coveredOptional.length
    },
    missingCategories
  };
}

function isSubstantial(insight: string, threshold: number): boolean {
  // Remove category prefix to measure actual content
  const content = insight.split(':')[1] || insight;
  const cleaned = content.trim();
  
  // Check if substantial (not empty, not "unknown", meets length)
  return (
    cleaned.length >= threshold &&
    !cleaned.toLowerCase().includes('unknown') &&
    !cleaned.toLowerCase().includes('ej specificerat') &&
    !cleaned.toLowerCase().includes('inte angivet')
  );
}

function hasCategoryInsight(insights: string[], category: string): boolean {
  // Check if any insight starts with this category
  return insights.some(insight => {
    const insightCategory = insight.split(':')[0].trim();
    return insightCategory.toLowerCase().includes(category.toLowerCase());
  });
}

