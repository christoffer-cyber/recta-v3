'use client';
import { motion } from 'framer-motion';

interface ImpactMeterProps {
  insights: string[];
}

export function ProblemImpactMeter({ insights }: ImpactMeterProps) {
  // Parse urgency signals
  const problem = insights.find(i => i.startsWith('Problem:'))?.split(':')[1] || 'Identifierar...';
  const cost = insights.find(i => i.toLowerCase().includes('kostar') || i.toLowerCase().includes('kostnad'));
  const urgency = insights.some(i => i.toLowerCase().includes('akut') || i.toLowerCase().includes('snabbt')) ? 'high' : 'medium';
  
  const urgencyColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Impact Assessment</h3>
      
      {/* Problem Statement */}
      <div className="p-4 bg-gray-50 rounded">
        <div className="text-sm text-gray-500 mb-1">Problemet:</div>
        <div className="font-medium text-gray-900">{problem}</div>
      </div>

      {/* Urgency Meter */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Brådska</span>
          <span className="font-medium">{urgency === 'high' ? 'Hög' : 'Medium'}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: urgency === 'high' ? '90%' : '60%' }}
            className={`h-full ${urgencyColors[urgency]}`}
          />
        </div>
      </div>

      {/* Cost Impact */}
      {cost && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 bg-red-50 rounded border border-red-200"
        >
          <div className="text-sm text-red-600 font-medium">Kostnad av inaction:</div>
          <div className="text-red-800">{cost.split(':')[1]}</div>
        </motion.div>
      )}
    </div>
  );
}
