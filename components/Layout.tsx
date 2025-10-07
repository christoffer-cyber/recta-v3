'use client';

import { ReactNode } from 'react';

interface LayoutProps {
  chat: ReactNode;
  canvas: ReactNode;
  currentPhase: string;
}

export function Layout({ chat, canvas, currentPhase }: LayoutProps) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            R
          </div>
          <h1 className="text-white font-semibold text-lg">Recta</h1>
          <span className="text-gray-400 text-sm">AI Powered Organizational Intelligence</span>
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

        <button className="text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Sidebar - 30% */}
        <aside className="w-[30%] bg-gray-900 border-r border-gray-800 flex flex-col">
          {chat}
        </aside>

        {/* Canvas - 70% */}
        <main className="flex-1 bg-white overflow-auto">
          {canvas}
        </main>
      </div>
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
