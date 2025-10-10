'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { JDPreview } from './canvas/JDPreview';
import { DeliverablesView } from './DeliverablesView';
import { ConfidenceBreakdown } from './canvas/ConfidenceBreakdown';
import { ResearchAnimation } from './canvas/ResearchAnimation';
import { ScenarioComparison } from './canvas/ScenarioComparison';
import { ProgressSteps } from './canvas/ProgressSteps';
import { DeliverableProgressCard } from './DeliverableProgressCard';
import type { CanvasState, JobDescriptionPreview, PhaseVisualization as PhaseViz } from '@/lib/canvas-types';
import type { JobDescription, CompensationAnalysis, InterviewQuestions, SuccessPlan } from '@/lib/deliverable-schemas';
import { PHASE_REQUIREMENTS } from '@/lib/confidence/config';

interface CanvasProps {
  state: CanvasState;
  data?: {
    jdPreview?: JobDescriptionPreview;
    phaseViz?: PhaseViz;
  };
  deliverables?: {
    jobDescription?: JobDescription;
    compensation?: CompensationAnalysis;
    interviewQuestions?: InterviewQuestions;
    successPlan?: SuccessPlan;
  };
  researchState?: {
    isActive: boolean;
    progress: number;
    queries: Array<{
      text: string;
      status: 'pending' | 'active' | 'complete';
      duration?: number;
    }>;
    totalSources?: number;
    totalInsights?: number;
  };
  showProgress?: boolean;
  generatingDeliverables?: {
    job_description: 'pending' | 'generating' | 'complete';
    compensation_analysis: 'pending' | 'generating' | 'complete';
    interview_questions: 'pending' | 'generating' | 'complete';
    success_plan: 'pending' | 'generating' | 'complete';
  };
  conversationId?: number;
}

export function Canvas({ state, data, deliverables, researchState, showProgress, generatingDeliverables, conversationId }: CanvasProps) {
  return (
    <div className="h-full bg-gray-50 overflow-y-auto" style={{ minHeight: 0 }}>
      <div className="p-6">
        <AnimatePresence mode="wait">
        {state === 'empty' && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center max-w-md">
              <motion.div 
                className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </motion.div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Din analys byggs här</h2>
              <p className="text-gray-600 text-sm">
                Börja konversationen i chatten så kommer resultatet att visas här i realtid.
              </p>
            </div>
          </motion.div>
        )}

        {state === 'phase-progress' && data?.phaseViz && (() => {
          const phaseId = data.phaseViz.currentPhase.split(' - ')[0].trim();
          const requirements = PHASE_REQUIREMENTS[phaseId];

          return (
            <div className="h-full overflow-y-auto">
              <motion.div
                key="phase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto space-y-6"
              >
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {data.phaseViz.currentPhase.split(' - ')[1] || 'Analyserar er situation'}
                </h2>
                <p className="text-gray-600">
                  Samlar information för att ge bästa möjliga rekommendation
                </p>
              </div>

              {/* Progress Steps (when active) */}
              {showProgress && (
                <ProgressSteps 
                  isActive={showProgress}
                  onComplete={() => {
                    console.log('[Progress] Complete!');
                  }}
                />
              )}

              {/* Confidence Breakdown */}
              {requirements && (
                <ConfidenceBreakdown
                  phase={phaseId}
                  confidence={data.phaseViz.confidence}
                  insights={data.phaseViz.insights}
                  missingCategories={[]}
                  requiredCategories={requirements.requiredCategories}
                  optionalCategories={requirements.optionalCategories}
                />
              )}

              {/* Scenario Comparison (Solution Design only) */}
              {data.phaseViz.scenarios && data.phaseViz.scenarios.length > 0 && (
                <ScenarioComparison scenarios={data.phaseViz.scenarios} />
              )}

              {/* Deliverables Generation Progress */}
              {generatingDeliverables && (
                generatingDeliverables.job_description !== 'pending' ||
                generatingDeliverables.compensation_analysis !== 'pending' ||
                generatingDeliverables.interview_questions !== 'pending' ||
                generatingDeliverables.success_plan !== 'pending'
              ) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                    <span>📦</span>
                    <span>Genererar Dokument</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <DeliverableProgressCard
                      title="job_description"
                      status={generatingDeliverables.job_description}
                      content={deliverables?.jobDescription}
                      conversationId={conversationId}
                    />
                    
                    <DeliverableProgressCard
                      title="compensation_analysis"
                      status={generatingDeliverables.compensation_analysis}
                      content={deliverables?.compensation}
                      conversationId={conversationId}
                    />
                    
                    <DeliverableProgressCard
                      title="interview_questions"
                      status={generatingDeliverables.interview_questions}
                      content={deliverables?.interviewQuestions}
                      conversationId={conversationId}
                    />
                    
                    <DeliverableProgressCard
                      title="success_plan"
                      status={generatingDeliverables.success_plan}
                      content={deliverables?.successPlan}
                      conversationId={conversationId}
                    />
                  </div>
                </div>
              )}

              {/* Research Animation (conditional) */}
              {researchState && (
                <ResearchAnimation
                  isActive={researchState.isActive}
                  progress={researchState.progress}
                  queries={researchState.queries}
                  totalSources={researchState.totalSources}
                  totalInsights={researchState.totalInsights}
                />
              )}
              </motion.div>
            </div>
          );
        })()}

        {state === 'jd-preview' && data?.jdPreview && (
          <motion.div
            key="jd"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <JDPreview data={data.jdPreview} />
          </motion.div>
        )}

        {state === 'deliverables' && deliverables && (
          <motion.div
            key="deliverables"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full"
          >
            <DeliverablesView {...deliverables} />
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
