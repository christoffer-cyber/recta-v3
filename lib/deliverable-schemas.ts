/**
 * Deliverable Type Definitions and Claude Tool Schemas
 */

// ============================================
// TypeScript Type Definitions
// ============================================

export interface JobDescription {
  role: {
    title: string;
    level: string;
    reportsTo: string;
    teamSize?: string;
  };
  overview: string;
  responsibilities: Array<{
    category: string;
    items: string[];
  }>;
  qualifications: {
    mustHave: string[];
    niceToHave: string[];
  };
  compensation: {
    baseSalary: {
      min: number;
      max: number;
      currency: string;
    };
    equity?: string;
    benefits?: string;
  };
  successPlan: {
    thirtyDays: string[];
    sixtyDays: string[];
    ninetyDays: string[];
  };
}

export interface CompensationAnalysis {
  marketData: {
    role: string;
    location: string;
    industry: string;
    companySize: string;
    dataPoints: number;
    lastUpdated: string;
  };
  benchmarks: {
    percentile25: number;
    median: number;
    percentile75: number;
    percentile90: number;
  };
  recommendation: {
    baseSalary: {
      min: number;
      max: number;
      target: number;
    };
    totalCost: {
      base: number;
      employerFees: number;
      benefits: number;
      total: number;
    };
    positioning: string;
    rationale: string;
  };
  comparableRoles?: Array<{
    company: string;
    size: string;
    salary: number;
    source: string;
  }>;
}

export interface InterviewQuestions {
  role: string;
  questions: Array<{
    category: string;
    question: string;
    whatToListenFor: string[];
    redFlags: string[];
    followUps?: string[];
  }>;
  assessmentGuidance: {
    scoringCriteria: string[];
    comparisonTips: string[];
  };
}

export interface SuccessPlan {
  role: string;
  overview: string;
  thirtyDays: {
    focus: string;
    objectives: string[];
    deliverables: string[];
    keyMeetings: string[];
  };
  sixtyDays: {
    focus: string;
    objectives: string[];
    deliverables: string[];
    keyMilestones: string[];
  };
  ninetyDays: {
    focus: string;
    objectives: string[];
    deliverables: string[];
    successMetrics: string[];
  };
  supportNeeded: string[];
}

export interface Scenario {
  name: string;
  description: string;
  approach: string;
  pros: string[];
  cons: string[];
  totalCost: {
    year1: number;
    year3: number;
  };
  timeToImpact: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ScenarioComparison {
  context: string;
  scenarios: Scenario[];
  recommendation: {
    chosenScenario: string;
    rationale: string;
    nextSteps: string[];
  };
  decisionFramework: string[];
}

// ============================================
// Claude Tool Schemas (for tool_use)
// ============================================

export const JobDescriptionSchema = {
  type: 'object' as const,
  properties: {
    role: {
      type: 'object' as const,
      properties: {
        title: { type: 'string' as const, description: 'Job title' },
        level: { type: 'string' as const, description: 'Seniority level' },
        reportsTo: { type: 'string' as const, description: 'Who this role reports to' },
        teamSize: { type: 'string' as const, description: 'Expected team size (optional)' }
      },
      required: ['title', 'level', 'reportsTo']
    },
    overview: { type: 'string' as const, description: 'Compelling 2-3 sentence role overview' },
    responsibilities: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          category: { type: 'string' as const },
          items: { type: 'array' as const, items: { type: 'string' as const } }
        },
        required: ['category', 'items']
      }
    },
    qualifications: {
      type: 'object' as const,
      properties: {
        mustHave: { type: 'array' as const, items: { type: 'string' as const } },
        niceToHave: { type: 'array' as const, items: { type: 'string' as const } }
      },
      required: ['mustHave', 'niceToHave']
    },
    compensation: {
      type: 'object' as const,
      properties: {
        baseSalary: {
          type: 'object' as const,
          properties: {
            min: { type: 'number' as const },
            max: { type: 'number' as const },
            currency: { type: 'string' as const }
          },
          required: ['min', 'max', 'currency']
        },
        equity: { type: 'string' as const },
        benefits: { type: 'string' as const }
      },
      required: ['baseSalary']
    },
    successPlan: {
      type: 'object' as const,
      properties: {
        thirtyDays: { type: 'array' as const, items: { type: 'string' as const } },
        sixtyDays: { type: 'array' as const, items: { type: 'string' as const } },
        ninetyDays: { type: 'array' as const, items: { type: 'string' as const } }
      },
      required: ['thirtyDays', 'sixtyDays', 'ninetyDays']
    }
  },
  required: ['role', 'overview', 'responsibilities', 'qualifications', 'compensation', 'successPlan']
};

export const CompensationAnalysisSchema = {
  type: 'object' as const,
  properties: {
    marketData: {
      type: 'object' as const,
      properties: {
        role: { type: 'string' as const },
        location: { type: 'string' as const },
        industry: { type: 'string' as const },
        companySize: { type: 'string' as const },
        dataPoints: { type: 'number' as const },
        lastUpdated: { type: 'string' as const }
      },
      required: ['role', 'location', 'industry', 'companySize', 'dataPoints', 'lastUpdated']
    },
    benchmarks: {
      type: 'object' as const,
      properties: {
        percentile25: { type: 'number' as const },
        median: { type: 'number' as const },
        percentile75: { type: 'number' as const },
        percentile90: { type: 'number' as const }
      },
      required: ['percentile25', 'median', 'percentile75', 'percentile90']
    },
    recommendation: {
      type: 'object' as const,
      properties: {
        baseSalary: {
          type: 'object' as const,
          properties: {
            min: { type: 'number' as const },
            max: { type: 'number' as const },
            target: { type: 'number' as const }
          },
          required: ['min', 'max', 'target']
        },
        totalCost: {
          type: 'object' as const,
          properties: {
            base: { type: 'number' as const },
            employerFees: { type: 'number' as const },
            benefits: { type: 'number' as const },
            total: { type: 'number' as const }
          },
          required: ['base', 'employerFees', 'benefits', 'total']
        },
        positioning: { type: 'string' as const },
        rationale: { type: 'string' as const }
      },
      required: ['baseSalary', 'totalCost', 'positioning', 'rationale']
    },
    comparableRoles: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          company: { type: 'string' as const },
          size: { type: 'string' as const },
          salary: { type: 'number' as const },
          source: { type: 'string' as const }
        },
        required: ['company', 'size', 'salary', 'source']
      }
    }
  },
  required: ['marketData', 'benchmarks', 'recommendation']
};

export const InterviewQuestionsSchema = {
  type: 'object' as const,
  properties: {
    role: { type: 'string' as const },
    questions: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          category: { type: 'string' as const },
          question: { type: 'string' as const },
          whatToListenFor: { type: 'array' as const, items: { type: 'string' as const } },
          redFlags: { type: 'array' as const, items: { type: 'string' as const } },
          followUps: { type: 'array' as const, items: { type: 'string' as const } }
        },
        required: ['category', 'question', 'whatToListenFor', 'redFlags']
      }
    },
    assessmentGuidance: {
      type: 'object' as const,
      properties: {
        scoringCriteria: { type: 'array' as const, items: { type: 'string' as const } },
        comparisonTips: { type: 'array' as const, items: { type: 'string' as const } }
      },
      required: ['scoringCriteria', 'comparisonTips']
    }
  },
  required: ['role', 'questions', 'assessmentGuidance']
};

export const SuccessPlanSchema = {
  type: 'object' as const,
  properties: {
    role: { type: 'string' as const },
    overview: { type: 'string' as const },
    thirtyDays: {
      type: 'object' as const,
      properties: {
        focus: { type: 'string' as const },
        objectives: { type: 'array' as const, items: { type: 'string' as const } },
        deliverables: { type: 'array' as const, items: { type: 'string' as const } },
        keyMeetings: { type: 'array' as const, items: { type: 'string' as const } }
      },
      required: ['focus', 'objectives', 'deliverables', 'keyMeetings']
    },
    sixtyDays: {
      type: 'object' as const,
      properties: {
        focus: { type: 'string' as const },
        objectives: { type: 'array' as const, items: { type: 'string' as const } },
        deliverables: { type: 'array' as const, items: { type: 'string' as const } },
        keyMilestones: { type: 'array' as const, items: { type: 'string' as const } }
      },
      required: ['focus', 'objectives', 'deliverables', 'keyMilestones']
    },
    ninetyDays: {
      type: 'object' as const,
      properties: {
        focus: { type: 'string' as const },
        objectives: { type: 'array' as const, items: { type: 'string' as const } },
        deliverables: { type: 'array' as const, items: { type: 'string' as const } },
        successMetrics: { type: 'array' as const, items: { type: 'string' as const } }
      },
      required: ['focus', 'objectives', 'deliverables', 'successMetrics']
    },
    supportNeeded: { type: 'array' as const, items: { type: 'string' as const } }
  },
  required: ['role', 'overview', 'thirtyDays', 'sixtyDays', 'ninetyDays', 'supportNeeded']
};

export const ScenarioComparisonSchema = {
  type: 'object' as const,
  properties: {
    context: { type: 'string' as const },
    scenarios: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          name: { type: 'string' as const },
          description: { type: 'string' as const },
          approach: { type: 'string' as const },
          pros: { type: 'array' as const, items: { type: 'string' as const } },
          cons: { type: 'array' as const, items: { type: 'string' as const } },
          totalCost: {
            type: 'object' as const,
            properties: {
              year1: { type: 'number' as const },
              year3: { type: 'number' as const }
            },
            required: ['year1', 'year3']
          },
          timeToImpact: { type: 'string' as const },
          riskLevel: { type: 'string' as const, enum: ['low', 'medium', 'high'] }
        },
        required: ['name', 'description', 'approach', 'pros', 'cons', 'totalCost', 'timeToImpact', 'riskLevel']
      }
    },
    recommendation: {
      type: 'object' as const,
      properties: {
        chosenScenario: { type: 'string' as const },
        rationale: { type: 'string' as const },
        nextSteps: { type: 'array' as const, items: { type: 'string' as const } }
      },
      required: ['chosenScenario', 'rationale', 'nextSteps']
    },
    decisionFramework: { type: 'array' as const, items: { type: 'string' as const } }
  },
  required: ['context', 'scenarios', 'recommendation', 'decisionFramework']
};

// Export all schemas
export const DeliverableSchemas = {
  job_description: JobDescriptionSchema,
  compensation_analysis: CompensationAnalysisSchema,
  interview_questions: InterviewQuestionsSchema,
  success_plan: SuccessPlanSchema,
  scenario_comparison: ScenarioComparisonSchema
} as const;

export type DeliverableType = keyof typeof DeliverableSchemas;
