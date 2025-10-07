'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PhaseVisualization } from './canvas/PhaseVisualization';
import { JDPreview } from './canvas/JDPreview';
import { DeliverablesView } from './DeliverablesView';
import type { CanvasState, JobDescriptionPreview, PhaseVisualization as PhaseViz } from '@/lib/canvas-types';
import type { JobDescription, CompensationAnalysis, InterviewQuestions, SuccessPlan } from '@/lib/deliverable-schemas';

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
}

export function Canvas({ state, data, deliverables }: CanvasProps) {
  return (
    <div className="h-full p-8 overflow-auto">
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

        {state === 'phase-progress' && data?.phaseViz && (
          <motion.div
            key="phase"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <PhaseVisualization data={data.phaseViz} />
          </motion.div>
        )}

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
  );
}
