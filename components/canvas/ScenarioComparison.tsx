'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, DollarSign } from 'lucide-react';
import type { Scenario } from '@/lib/types';

interface ScenarioComparisonProps {
  scenarios: Scenario[];
}

export function ScenarioComparison({ scenarios }: ScenarioComparisonProps) {
  const getRiskColor = (risk: string) => {
    if (risk === 'low') return 'text-green-600 bg-green-50 border-green-200';
    if (risk === 'medium') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getImpactColor = (impact: string) => {
    if (impact === 'high') return 'text-blue-600 bg-blue-50 border-blue-200';
    if (impact === 'medium') return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const formatCost = (min: number, max: number, currency: string) => {
    const format = (num: number) => {
      if (currency === 'SEK') {
        return `${(num / 1000).toFixed(0)}k SEK`;
      }
      return `${currency} ${(num / 1000).toFixed(0)}k`;
    };
    return `${format(min)} - ${format(max)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          3 Lösningsscenarier
        </h3>
        <p className="text-sm text-gray-600">
          Baserat på era behov och begränsningar
        </p>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario, index) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.3 }}
            className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50"
          >
            {/* Scenario Number Badge */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                </div>
                <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">
              {scenario.description}
            </p>

            {/* Key Metrics */}
            <div className="space-y-3 mb-4">
              {/* Cost */}
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">
                  {formatCost(scenario.cost.min, scenario.cost.max, scenario.cost.currency)}
                </span>
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{scenario.timeline}</span>
              </div>

              {/* Risk & Impact */}
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${getRiskColor(scenario.risk)}`}>
                  Risk: {scenario.risk}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full border ${getImpactColor(scenario.impact)}`}>
                  Impact: {scenario.impact}
                </span>
              </div>
            </div>

            {/* Approach */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-xs text-gray-600 leading-relaxed">
                {scenario.approach}
              </p>
            </div>

            {/* Pros */}
            <div className="mb-3">
              <div className="flex items-center gap-1 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-gray-700">Fördelar</span>
              </div>
              <ul className="space-y-1">
                {scenario.pros.map((pro, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-gray-700">Nackdelar</span>
              </div>
              <ul className="space-y-1">
                {scenario.cons.map((con, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparison Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 pt-4 border-t border-gray-200"
      >
        <p className="text-sm text-gray-600 text-center">
          💬 Diskutera vilket alternativ som passar er bäst i chatten
        </p>
      </motion.div>
    </motion.div>
  );
}
