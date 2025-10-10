'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DeliverableProgressCardProps {
  title: string;
  status: 'pending' | 'generating' | 'complete';
  content?: any;
  conversationId?: number;
}

const ICONS = {
  job_description: '📄',
  compensation_analysis: '💰',
  interview_questions: '💬',
  success_plan: '📊',
};

const TITLES = {
  job_description: 'Jobbeskrivning',
  compensation_analysis: 'Kompensationsanalys',
  interview_questions: 'Intervjufrågor',
  success_plan: '90-Dagarsplan',
};

export function DeliverableProgressCard({
  title,
  status,
  content,
  conversationId,
}: DeliverableProgressCardProps) {
  if (status === 'pending') return null;

  const getPreviewText = () => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (content.title) return content.title;
    if (content.role) return content.role;
    if (content.overview) return content.overview;
    return JSON.stringify(content).substring(0, 120);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg p-4 bg-white shadow-sm mb-3 transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{ICONS[title as keyof typeof ICONS] || '📋'}</span>
            <h3 className="font-semibold text-gray-900">
              {TITLES[title as keyof typeof TITLES] || title}
            </h3>
          </div>

          {status === 'generating' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Genererar...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
                />
              </div>
            </div>
          )}

          {status === 'complete' && content && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Klar</span>
              </div>
              
              {/* Preview of content */}
              <div className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded border border-gray-200">
                {getPreviewText()}
              </div>

              {/* Öppna i Rapport-vy button */}
              {conversationId && (
                <Link
                  href={`/report/${conversationId}`}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <span>→</span>
                  <span>Öppna i Rapport-vy</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

