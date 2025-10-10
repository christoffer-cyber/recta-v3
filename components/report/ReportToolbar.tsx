"use client";
import React, { useState } from "react";

type Props = {
  onPresentationMode?: (enabled: boolean) => void;
  onBackToChat?: () => void;
};

export default function ReportToolbar({ onPresentationMode, onBackToChat }: Props) {
  const [showExportModal, setShowExportModal] = useState(false);
  
  const handlePresent = () => {
    document.documentElement.requestFullscreen().catch(() => {
      console.log('Fullscreen not supported');
    });
    document.body.classList.add('presentation-mode');
    onPresentationMode?.(true);
  };

  const exportToPDF = () => {
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
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Exportera PDF"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
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
            <button 
              className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition-colors"
              onClick={exportToPDF}
            >
              📄 Exportera som PDF
            </button>
            <button 
              className="w-full mt-2 border border-gray-300 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
              onClick={() => setShowExportModal(false)}
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
    </>
  );
}

