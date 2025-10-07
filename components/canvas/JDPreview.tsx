'use client';

import { motion } from 'framer-motion';
import type { JobDescriptionPreview } from '@/lib/canvas-types';

interface Props {
  data: JobDescriptionPreview;
}


export function JDPreview({ data }: Props) {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div 
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900">{data.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-600">Färdigställd:</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full w-32 overflow-hidden">
              <motion.div
                className="h-2 bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${data.completeness}%` }}
                transition={{ 
                  type: 'spring',
                  stiffness: 100,
                  damping: 20
                }}
              />
            </div>
            <motion.span 
              className="text-sm font-medium text-gray-900"
              key={data.completeness}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {Math.round(data.completeness)}%
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Compensation with spring entrance */}
      {data.compensation && (
        <motion.div 
          className="bg-green-50 border border-green-200 rounded-lg p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)'
          }}
        >
          <div className="text-sm font-medium text-green-900 mb-1">Löneintervall</div>
          <motion.div 
            className="text-2xl font-bold text-green-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
          >
            {data.compensation.min.toLocaleString()} - {data.compensation.max.toLocaleString()} {data.compensation.currency}
          </motion.div>
        </motion.div>
      )}

      {/* Responsibilities - Progressive rendering */}
      {data.responsibilities.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Ansvarsområden</h3>
          <ul className="space-y-2">
            {data.responsibilities.map((resp, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 400, 
                  damping: 25, 
                  delay: 0.3 + index * 0.08 
                }}
                className="flex items-start gap-2"
              >
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">{resp}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Qualifications - Progressive rendering */}
      {data.qualifications.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Kvalifikationer</h3>
          <ul className="space-y-2">
            {data.qualifications.map((qual, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 400, 
                  damping: 25, 
                  delay: 0.5 + index * 0.08 
                }}
                className="flex items-start gap-2"
              >
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">{qual}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Status indicator with pulse */}
      <motion.div 
        className="pt-4 border-t border-gray-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.6 }}
      >
        <div className="flex items-center gap-2 text-sm text-gray-600">
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
          <span>Uppdateras medan konversationen pågår...</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
