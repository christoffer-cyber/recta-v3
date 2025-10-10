"use client";
import React from "react";

type ReportLayoutProps = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
};

export default function ReportLayout({ left, right, children }: ReportLayoutProps) {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
      {/* Left toolbox - fixed */}
      {left && (
        <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto" aria-label="Toolbox">
          {left}
        </aside>
      )}

      {/* Center document - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto py-8 px-4">
          {children}
        </div>
      </div>

      {/* Right navigation - fixed */}
      {right && (
        <aside className="w-48 bg-white border-l border-gray-200 flex-shrink-0 overflow-y-auto" aria-label="Navigation">
          {right}
        </aside>
      )}
    </div>
  );
}

