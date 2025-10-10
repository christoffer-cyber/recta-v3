"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  label: string;
  text: string;
  duration: number; // milliseconds
}

const STEPS: Step[] = [
  { label: "ANALYZE", text: "Analyserar företagsstorlek och fas", duration: 2000 },
  { label: "COMPARE", text: "Jämför med 847 liknande företag", duration: 3000 },
  { label: "IDENTIFY", text: "Identifierar tekniska krav", duration: 2500 },
  { label: "CALCULATE", text: "Beräknar kostnadsscenarier", duration: 3000 },
  { label: "EVALUATE", text: "Väger risk vs impact", duration: 2500 },
  { label: "DESIGN", text: "Utvärderar implementeringsvägar", duration: 2000 },
  { label: "GENERATE", text: "Genererar rekommendationer", duration: 2000 }
];

interface Props {
  isActive: boolean;
  onComplete?: () => void;
}

export function ProgressSteps({ isActive, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    if (currentStep >= STEPS.length) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }, STEPS[currentStep].duration);

    return () => clearTimeout(timer);
  }, [isActive, currentStep, onComplete]);

  if (!isActive) return null;

  const totalDuration = STEPS.reduce((sum, step) => sum + step.duration, 0);
  const elapsedDuration = STEPS.slice(0, currentStep).reduce((sum, step) => sum + step.duration, 0);
  const progress = Math.min(100, (elapsedDuration / totalDuration) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Analyserar er situation
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <AnimatePresence>
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStep === index;
            const isPending = index > currentStep;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isPending ? 0.3 : 1, 
                  x: 0 
                }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isCurrent ? 'bg-blue-50 border border-blue-200' :
                  isCompleted ? 'bg-green-50 border border-green-200' :
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                {/* Status Indicator */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : isCurrent ? (
                    <svg 
                      className="animate-spin h-6 w-6 text-blue-600" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="none" 
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                      />
                    </svg>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                  )}
                </div>

                {/* Step Info */}
                <div className="flex-1">
                  <div className={`text-xs font-mono font-semibold mb-0.5 ${
                    isCurrent ? 'text-blue-600' :
                    isCompleted ? 'text-green-600' :
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </div>
                  <p className={`text-sm ${
                    isCurrent ? 'text-blue-900 font-medium' :
                    isCompleted ? 'text-green-900' :
                    'text-gray-600'
                  }`}>
                    {step.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer hint */}
      <div className="mt-6 text-center text-xs text-gray-500">
        Detta tar vanligtvis 15-20 sekunder
      </div>
    </motion.div>
  );
}



