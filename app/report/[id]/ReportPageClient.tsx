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
      <ReportToolbar onPresentationMode={setPresentationMode} />

      {/* Main report layout */}
      <div className="flex-1 overflow-hidden">
        <ReportLayout
          left={<ReportToolboxPanel items={toolboxItems} />}
          right={<ReportNavigation items={navItems} />}
        >
          <RectaReportContent data={reportData} />
        </ReportLayout>
      </div>
    </div>
  );
}

