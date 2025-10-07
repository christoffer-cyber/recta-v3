'use client';

import { motion } from 'framer-motion';
import type { PhaseVisualization as PhaseViz } from '@/lib/canvas-types';

interface Props {
  data: PhaseViz;
}


export function PhaseVisualization({ data }: Props) {
  // Show completion state if 100%
  if (data.confidence >= 100) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Success Header */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <motion.div
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Fas klar!</h2>
          <p className="text-gray-600">Vi har nu all information vi behöver för denna fas</p>
        </motion.div>

        {/* Current Phase Info */}
        <motion.div 
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-sm font-medium text-blue-900 mb-1">Avslutad fas</div>
          <div className="text-lg font-semibold text-blue-700">{data.currentPhase}</div>
        </motion.div>

        {/* Summary of insights */}
        {data.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Sammanfattning:</h3>
            <div className="space-y-2">
              {data.insights.slice(0, 8).map((insight, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{insight}</span>
                </div>
              ))}
              {data.insights.length > 8 && (
                <div className="text-sm text-gray-500 italic pl-7">
                  Och {data.insights.length - 8} till...
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Next step indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900 mb-1">Redo för nästa fas</div>
              <div className="text-sm text-gray-600">
                Klicka på den gröna knappen &quot;Fortsätt till nästa fas&quot; i chatten för att gå vidare
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // PROGRESS STATE - Show when confidence < 100%
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

      {/* Insights Collected - Max 8 visible */}
      {data.insights.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Insamlad information:</h3>
          <div className="space-y-2">
            {data.insights.slice(0, 8).map((insight, index) => (
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
            
            {/* Ellipsis if more than 8 insights */}
            {data.insights.length > 8 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex items-center gap-2 text-sm text-gray-500 italic pl-7"
              >
                <span>Och {data.insights.length - 8} till...</span>
              </motion.div>
            )}
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
