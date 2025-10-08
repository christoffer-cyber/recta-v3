'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, Loader2, Circle } from 'lucide-react';

interface ResearchQuery {
  text: string;
  status: 'pending' | 'active' | 'complete';
  duration?: number;
}

interface ResearchAnimationProps {
  isActive: boolean;
  progress: number;
  queries: ResearchQuery[];
  totalSources?: number;
  totalInsights?: number;
}

export function ResearchAnimation({
  isActive,
  progress,
  queries,
  totalSources,
  totalInsights
}: ResearchAnimationProps) {
  const isComplete = progress >= 100 && !isActive;

  return (
    <AnimatePresence mode="wait">
      {(isActive || isComplete) && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={
                isActive
                  ? {
                      scale: [1, 1.1, 1],
                      opacity: [1, 0.7, 1]
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: isActive ? Infinity : 0
              }}
            >
              {isComplete ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <Search className="w-6 h-6 text-blue-600" />
              )}
            </motion.div>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {isComplete ? 'Research Klart' : 'AI Research Pågår'}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4">
            {isComplete
              ? 'Analyserade marknaden och hittade relevanta insights för er situation.'
              : 'Analyserar marknaden för din situation...'}
          </p>

          {/* Progress Bar (only when active) */}
          {isActive && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="relative h-2 bg-white/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                />
                {/* Shimmer effect */}
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 0%', '200% 0%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  style={{
                    backgroundSize: '200% 100%'
                  }}
                />
              </div>
            </div>
          )}

          {/* Query List */}
          <div className="space-y-3">
            {queries.map((query, index) => (
              <motion.div
                key={query.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  query.status === 'complete'
                    ? 'bg-green-50'
                    : query.status === 'active'
                    ? 'bg-blue-50'
                    : 'bg-white/50'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {query.status === 'complete' && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </motion.div>
                  )}
                  {query.status === 'active' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    >
                      <Loader2 className="w-5 h-5 text-blue-600" />
                    </motion.div>
                  )}
                  {query.status === 'pending' && (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {query.text}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {query.status === 'complete' && query.duration
                      ? `Färdig (${query.duration.toFixed(1)}s)`
                      : query.status === 'active'
                      ? 'Söker...'
                      : 'Väntar...'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary (only when complete) */}
          {isComplete && totalSources && totalInsights && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 pt-4 border-t border-blue-200"
            >
              <p className="text-sm text-gray-600">
                Hittade <span className="font-semibold text-gray-900">{totalInsights} insights</span>{' '}
                från <span className="font-semibold text-gray-900">{totalSources} källor</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                AI:n använder dessa insights i svaret
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

