'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';

interface ConfidenceBreakdownProps {
  phase: string;
  confidence: number;
  insights: string[];
  missingCategories: string[];
  requiredCategories: string[];
  optionalCategories: string[];
}

export function ConfidenceBreakdown({
  phase,
  confidence,
  insights,
  requiredCategories,
  optionalCategories
}: ConfidenceBreakdownProps) {
  // Group insights by category
  const insightsByCategory = insights.reduce((acc, insight) => {
    const [category] = insight.split(':');
    const cat = category.trim();
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(insight);
    return acc;
  }, {} as Record<string, string[]>);

  // Check if category is covered
  const isCategoryCovered = (category: string) => {
    return Object.keys(insightsByCategory).some(
      key => key.toLowerCase().includes(category.toLowerCase())
    );
  };

  // Get encouragement text based on confidence
  const getEncouragementText = () => {
    if (confidence === 0) return 'Berätta mer om er situation';
    if (confidence < 30) return 'Berätta mer om er situation';
    if (confidence < 70) return 'Bra! Fortsätt berätta...';
    if (confidence < 100) return 'Nästan klart! Ett steg kvar';
    return 'Perfekt! Redo att gå vidare';
  };

  // Progress bar color gradient
  const getProgressColor = () => {
    if (confidence < 30) return 'from-red-500 to-orange-500';
    if (confidence < 70) return 'from-orange-500 to-yellow-500';
    if (confidence < 100) return 'from-yellow-500 to-blue-500';
    return 'from-blue-500 to-green-500';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {phase} - {confidence}% confidence
          </h3>
          <motion.span
            key={confidence}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold text-blue-600"
          >
            {confidence}%
          </motion.span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getProgressColor()} rounded-full`}
          />
        </div>
      </div>

      {/* Required Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
          Required Information
        </h4>
        <div className="space-y-3">
          {requiredCategories.map((category, index) => {
            const covered = isCategoryCovered(category);
            const categoryInsights = Object.entries(insightsByCategory).find(
              ([key]) => key.toLowerCase().includes(category.toLowerCase())
            );
            const insightText = categoryInsights?.[1][0]?.split(':')[1]?.trim();

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 ${
                  covered
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, delay: index * 0.1 + 0.2 }}
                  >
                    {covered ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 mb-1">
                      {category}
                    </div>
                    {covered ? (
                      <div className="text-sm text-gray-600 truncate">
                        {insightText}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        Saknas - berätta om {category.toLowerCase()}!
                      </div>
                    )}
                  </div>

                  {/* Mini progress indicator */}
                  <div className="flex items-center gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          covered ? 'bg-green-400' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Optional Categories */}
      {optionalCategories.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
            Optional (Bonus)
          </h4>
          <div className="flex flex-wrap gap-3">
            {optionalCategories.map((category) => {
              const covered = isCategoryCovered(category);
              return (
                <motion.div
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                    covered
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  <Circle className={`w-3 h-3 ${covered ? 'fill-blue-500' : ''}`} />
                  <span className="text-sm font-medium">{category}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Encouragement */}
      <motion.div
        key={confidence}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 pt-4 border-t border-gray-200 text-center"
      >
        <p className="text-sm text-gray-600">{getEncouragementText()}</p>
      </motion.div>
    </motion.div>
  );
}

