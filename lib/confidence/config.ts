export interface PhaseRequirements {
  minInsights: number;           // Minimum insights needed
  requiredCategories: string[];  // Categories that must be covered
  optionalCategories: string[];  // Nice to have
  qualityThreshold: number;      // Min chars per insight to count as "substantial"
}

export const PHASE_REQUIREMENTS: Record<string, PhaseRequirements> = {
  'Context': {
    minInsights: 5,
    requiredCategories: [
      'Företag',    // Company info
      'Roll',       // Role
      'Team'        // Team/size info
    ],
    optionalCategories: [
      'Budget',
      'Mål',        // Goals
      'Timeline'
    ],
    qualityThreshold: 15  // Min 15 chars to be substantial
  },

  'Problem Discovery': {
    minInsights: 4,
    requiredCategories: [
      'Problem',
      'Orsak',      // Root cause
      'Utmaning'    // Challenge
    ],
    optionalCategories: [
      'Försök',     // What they tried
      'Begränsning' // Constraints
    ],
    qualityThreshold: 20
  },

  'Solution Design': {
    minInsights: 3,
    requiredCategories: [
      'Scenario',
      'Preferens'   // User preference
    ],
    optionalCategories: [
      'Budget',
      'Timeline',
      'Risk'
    ],
    qualityThreshold: 20
  },

  'Action Plan': {
    minInsights: 4,
    requiredCategories: [
      'Milestone',
      'Timeline',
      'Nästa steg'  // Next steps
    ],
    optionalCategories: [
      'Risk',
      'Beroende',   // Dependencies
      'Metrik'      // Success metrics
    ],
    qualityThreshold: 20
  }
};

