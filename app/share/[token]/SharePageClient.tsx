'use client';

import React from 'react';
import { RectaReportContent, type ReportData } from '@/components/report/RectaReportContent';
import Link from 'next/link';

interface SharePageClientProps {
  reportData: ReportData;
  companyName?: string;
  title?: string;
  createdAt: string;
}

export default function SharePageClient({
  reportData,
  companyName,
  title,
  createdAt,
}: SharePageClientProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Recta branding */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  R
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  Recta
                </h1>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                AI-Powered Organizational Intelligence
              </p>
            </div>
            
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Prova Gratis →
            </Link>
          </div>
        </div>
      </div>

      {/* Watermark banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-sm text-blue-800">
            📊 Denna rapport skapades med <strong>Recta</strong> •{' '}
            <Link href="/signup" className="underline hover:text-blue-900">
              Skapa din egen rapport
            </Link>
          </p>
        </div>
      </div>

      {/* Report content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Title */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {title || 'Organisationsanalys'}
            </h2>
            {companyName && (
              <p className="text-lg text-gray-600">{companyName}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Skapad {new Date(createdAt).toLocaleDateString('sv-SE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Report */}
          <RectaReportContent data={reportData} />
        </div>

        {/* CTA footer */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-center text-white shadow-lg">
          <h3 className="text-2xl font-bold mb-2">
            Skapa din egen organisationsanalys
          </h3>
          <p className="text-blue-100 mb-6">
            Få professionella rekommendationer på 20 minuter
          </p>
          <Link
            href="/signup"
            className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors shadow-md"
          >
            Kom igång gratis →
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Används av ledande företag för strategisk rekrytering</p>
        </div>
      </div>
    </div>
  );
}

