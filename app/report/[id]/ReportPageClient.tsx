'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ReportLayout from '@/components/report/ReportLayout';
import ReportToolbar from '@/components/report/ReportToolbar';
import ReportNavigation from '@/components/report/ReportNavigation';
import ReportToolboxPanel from '@/components/report/ReportToolboxPanel';
import { RectaReportContent, type ReportData } from '@/components/report/RectaReportContent';

interface ReportPageClientProps {
  reportData: ReportData;
  conversationId: number;
}

export function ReportPageClient({ reportData, conversationId }: ReportPageClientProps) {
  const [presentationMode, setPresentationMode] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [generatingShare, setGeneratingShare] = useState(false);

  const handleShare = async () => {
    setGeneratingShare(true);
    
    try {
      const response = await fetch(`/api/reports/${conversationId}/share`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to generate share link');

      const data = await response.json();
      setShareUrl(data.shareUrl);
      setShowShareDialog(true);
    } catch (error) {
      console.error('Share error:', error);
      alert('Kunde inte skapa delningslänk. Försök igen.');
    } finally {
      setGeneratingShare(false);
    }
  };

  const navItems = [
    { id: 'executive-summary', label: 'Executive Summary' },
    { id: 'problem', label: 'Problem Analysis' },
    { id: 'root-cause', label: 'Root Cause' },
    { id: 'scenarios', label: 'Solution Scenarios' },
    { id: 'recommendation', label: 'Recommendation' },
    { id: 'cost', label: 'Cost Analysis' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'risks', label: 'Risks & Mitigation' },
    { id: 'success', label: 'Success Metrics' },
    { id: 'next-steps', label: 'Next Steps' },
  ];

  const toolboxItems = [
    { title: 'Jobbeskrivning', subtitle: 'Full roll-beskrivning' },
    { title: 'Kompensation', subtitle: 'Lön & benefits analys' },
    { title: 'Intervjufrågor', subtitle: '20+ strukturerade frågor' },
    { title: '90-Dagarsplan', subtitle: 'Onboarding roadmap' },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top navigation bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <Link 
          href={`/?id=${conversationId}`}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          <span>←</span>
          <span>Tillbaka till chat</span>
        </Link>
        
        <h1 className="text-lg font-semibold text-gray-900">
          Organisationsanalys – {reportData.company.name}
        </h1>

        <div className="w-32"></div> {/* Spacer for centering */}
      </div>

      {/* Toolbar */}
      <ReportToolbar 
        onPresentationMode={setPresentationMode}
        reportTitle="Organisationsanalys"
        companyName={reportData.company?.name}
        onShare={handleShare}
      />

      {/* Main report layout */}
      <div className="flex-1 overflow-hidden">
        <ReportLayout
          left={<ReportToolboxPanel items={toolboxItems} />}
          right={<ReportNavigation items={navItems} />}
        >
          <div id="report-content" className="bg-white">
            <RectaReportContent data={reportData} />
          </div>
        </ReportLayout>
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowShareDialog(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">🔗 Dela rapport</h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Alla med denna länk kan se rapporten (utan att logga in)
            </p>

            <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-4">
              <code className="text-sm break-all text-gray-800">{shareUrl}</code>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Länk kopierad!');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📋 Kopiera länk
              </button>
              
              <button
                onClick={() => setShowShareDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Stäng
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              💡 Tips: Dela med kollegor eller styrelsen för att få input
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

