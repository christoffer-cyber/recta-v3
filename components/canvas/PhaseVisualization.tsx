'use client';

import { motion } from 'framer-motion';
import type { PhaseVisualization as PhaseViz } from '@/lib/canvas-types';

interface Props {
  data: PhaseViz;
}


export function PhaseVisualization({ data }: Props) {
  return (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Analyserar er situation</h2>
        <p className="text-gray-600">Samlar information för att ge bästa möjliga rekommendation</p>
      </motion.div>

      {/* Progress Circle with Spring Effect */}
      <motion.div 
        className="flex items-center justify-center py-8"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.1 }}
      >
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-blue-600"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 352" }}
              animate={{ strokeDasharray: `${(data.confidence / 100) * 352} 352` }}
              transition={{ 
                type: 'spring',
                stiffness: 100,
                damping: 15,
                mass: 0.5
              }}
            />
          </svg>
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: data.confidence > 75 ? 1.1 : 1 
            }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 10,
              repeat: data.confidence > 75 ? Infinity : 0,
              repeatType: 'reverse',
              duration: 0.3
            }}
          >
            <motion.span 
              className="text-3xl font-bold text-gray-900"
              key={data.confidence}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {Math.round(data.confidence)}%
            </motion.span>
          </motion.div>
        </div>
      </motion.div>

      {/* Current Phase with pulse */}
      <motion.div 
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ 
          opacity: 1,
          x: 0,
          boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)'
        }}
        transition={{ 
          opacity: { type: 'spring', stiffness: 300, damping: 24, delay: 0.2 },
          x: { type: 'spring', stiffness: 300, damping: 24, delay: 0.2 },
          boxShadow: { 
            duration: 1,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }
        }}
      >
        <div className="text-sm font-medium text-blue-900 mb-1">Nuvarande fas</div>
        <div className="text-lg font-semibold text-blue-700">{data.currentPhase}</div>
      </motion.div>

      {/* Insights Collected - Progressive Rendering */}
      {data.insights.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Insamlad information:</h3>
          <div className="space-y-2">
            {data.insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 400,
                  damping: 24,
                  delay: 0.4 + index * 0.1
                }}
                className="flex items-start gap-2 text-sm"
              >
                <motion.svg 
                  className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 400,
                    damping: 15,
                    delay: 0.5 + index * 0.1
                  }}
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </motion.svg>
                <span className="text-gray-700">{insight}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Working Indicator */}
      <motion.div
        className="flex items-center gap-2 text-sm text-gray-600 pt-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.5 }}
      >
        <motion.div
          className="w-2 h-2 bg-blue-600 rounded-full"
          animate={{ 
            scale: 1.3,
            opacity: 0.5
          }}
          transition={{ 
            duration: 0.75,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        />
        <span>AI:n analyserar er situation...</span>
      </motion.div>
    </motion.div>
  );
}
