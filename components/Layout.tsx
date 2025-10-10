'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface LayoutProps {
  chat: ReactNode;
  canvas: ReactNode;
  insights?: ReactNode;
  currentPhase: string;
  children?: ReactNode;
}

export function Layout({ chat, canvas, insights, currentPhase, children }: LayoutProps) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex flex-col" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Top Bar */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
            <h1 className="text-white font-semibold text-lg">Recta</h1>
            <span className="text-gray-400 text-sm">AI Powered Organizational Intelligence</span>
          </div>
          
          {children && (
            <div className="text-sm text-gray-400">
              {children}
            </div>
          )}

          <Link 
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Mina Sidor
          </Link>
        </div>

        {/* Phase Indicator */}
        <div className="flex items-center gap-3">
          <PhaseStep 
            label="Context" 
            icon="🏢" 
            active={currentPhase.includes('Context')} 
          />
          <div className="w-6 h-px bg-gray-700" />
          <PhaseStep 
            label="Discovery" 
            icon="🔍" 
            active={currentPhase.includes('Discovery')} 
          />
          <div className="w-6 h-px bg-gray-700" />
          <PhaseStep 
            label="Solution" 
            icon="💡" 
            active={currentPhase.includes('Solution')} 
          />
          <div className="w-6 h-px bg-gray-700" />
          <PhaseStep 
            label="Action" 
            icon="📋" 
            active={currentPhase.includes('Action')} 
          />
        </div>

        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          Mina Sidor
        </Link>
      </header>

      {/* Main Content - FIXED HEIGHT */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        {/* Chat Sidebar */}
        <aside className={`${insights ? 'w-[25%]' : 'w-[30%]'} bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden`} style={{ minHeight: 0 }}>
          {chat}
        </aside>

        {/* Canvas with FIXED HEIGHT and INTERNAL SCROLL */}
        <main className="flex-1 bg-white flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            {canvas}
          </div>
        </main>

        {/* Insights Sidebar (conditional) */}
        {insights && (
          <aside className="w-[25%] bg-gray-50 border-l border-gray-200 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
            {insights}
          </aside>
        )}
      </div>
      
      {/* Render children (for saving indicator, etc.) */}
      {children}
    </div>
  );
}

function PhaseStep({ label, icon, active = false }: { label: string; icon: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
      active ? 'bg-blue-600 text-white' : 'text-gray-300'
    }`}>
      <span className="text-sm">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
