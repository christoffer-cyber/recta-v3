"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Insight {
  category: string;
  text: string;
  timestamp: string;
  isNew: boolean;
}

interface Props {
  phase: string;
  insights: Insight[];
  confidence: number;
}

export function InsightsSidebar({ phase, insights, confidence }: Props) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Företag': 'bg-blue-50 text-blue-700 border-blue-200',
      'Team': 'bg-purple-50 text-purple-700 border-purple-200',
      'Budget': 'bg-green-50 text-green-700 border-green-200',
      'Timeline': 'bg-orange-50 text-orange-700 border-orange-200',
      'Problem': 'bg-red-50 text-red-700 border-red-200',
      'Orsak': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Utmaning': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Försök': 'bg-pink-50 text-pink-700 border-pink-200',
      'Begränsning': 'bg-rose-50 text-rose-700 border-rose-200',
      'Scenario': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'Preferens': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Risk': 'bg-amber-50 text-amber-700 border-amber-200'
    };
    return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Samlade Insikter</h3>
          <span className="text-xs text-gray-500">{phase}</span>
        </div>
        
        {/* Confidence Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Completeness</span>
            <span className="font-semibold text-gray-900">{confidence}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                backgroundColor: insight.isNew ? '#eff6ff' : '#ffffff'
              }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-3 rounded-lg border ${
                insight.isNew ? 'border-blue-300 shadow-sm' : 'border-gray-200'
              }`}
            >
              {/* Category Badge */}
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 border ${getCategoryColor(insight.category)}`}>
                {insight.category}
              </div>

              {/* Insight Text */}
              <p className="text-sm text-gray-700 leading-relaxed">
                {insight.text}
              </p>

              {/* Timestamp */}
              <div className="text-xs text-gray-400 mt-2">
                {new Date(insight.timestamp).toLocaleTimeString('sv-SE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {insights.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              Insikter dyker upp här<br />medan vi pratar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

