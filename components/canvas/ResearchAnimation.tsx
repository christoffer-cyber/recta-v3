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
  totalSources = 0, 
  totalInsights = 0 
}: ResearchAnimationProps) {
  if (!isActive && queries.length === 0) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Marknadsanalys</h3>
              <p className="text-sm text-gray-600">
                Samlar relevant data för bättre beslut...
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Framsteg</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Query Status */}
          <div className="space-y-3">
            {queries.map((query, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 text-sm"
              >
                <div className="flex-shrink-0">
                  {query.status === 'pending' && (
                    <Circle className="w-4 h-4 text-gray-400" />
                  )}
                  {query.status === 'active' && (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  )}
                  {query.status === 'complete' && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <span className={`flex-1 ${
                  query.status === 'complete' ? 'text-green-700' : 
                  query.status === 'active' ? 'text-blue-700' : 
                  'text-gray-600'
                }`}>
                  {query.text}
                </span>
                {query.duration && query.status === 'complete' && (
                  <span className="text-xs text-gray-500">
                    {query.duration}ms
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          {totalSources > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="flex justify-between text-sm text-gray-600">
                <span>Källor analyserade</span>
                <span className="font-medium">{totalSources}</span>
              </div>
              {totalInsights > 0 && (
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Insights genererade</span>
                  <span className="font-medium">{totalInsights}</span>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}