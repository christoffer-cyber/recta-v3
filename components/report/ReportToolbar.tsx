"use client";
import React, { useState } from "react";
import { exportToPDF } from '@/lib/pdf-export';

type Props = {
  onPresentationMode?: (enabled: boolean) => void;
  onBackToChat?: () => void;
  reportTitle?: string;
  companyName?: string;
};

export default function ReportToolbar({ 
  onPresentationMode, 
  onBackToChat,
  reportTitle = 'Organisationsanalys',
  companyName 
}: Props) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const handlePresent = () => {
    document.documentElement.requestFullscreen().catch(() => {
      console.log('Fullscreen not supported');
    });
    document.body.classList.add('presentation-mode');
    onPresentationMode?.(true);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    setShowExportModal(false);
    
    try {
      await exportToPDF('report-content', {
        filename: `${companyName || 'Recta'}_Rapport_${new Date().toISOString().split('T')[0]}.pdf`,
        title: reportTitle,
        subtitle: companyName,
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Kunde inte exportera rapporten. Försök igen.');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
    setShowExportModal(false);
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex gap-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
        {onBackToChat && (
          <button 
            onClick={onBackToChat} 
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Tillbaka till chat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
        )}
        <button 
          onClick={handlePresent} 
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Presentera"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </button>
        <button 
          onClick={() => setShowExportModal(true)} 
          className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          title={exporting ? "Exporterar..." : "Exportera PDF"}
          disabled={exporting}
        >
          {exporting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          )}
        </button>
      </div>
      
      {showExportModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
          onClick={() => setShowExportModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Exportera rapport</h3>
            <div className="space-y-2">
              <button 
                className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                onClick={handleExportPDF}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Exportera som PDF</span>
              </button>
              
              <button 
                className="w-full border border-gray-300 py-2 px-4 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                onClick={handlePrint}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                <span>Skriv ut</span>
              </button>
              
              <button 
                className="w-full mt-2 border border-gray-300 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
                onClick={() => setShowExportModal(false)}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

