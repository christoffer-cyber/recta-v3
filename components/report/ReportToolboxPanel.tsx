"use client";
import React from "react";

type ToolItem = { 
  title: string; 
  subtitle?: string;
  onClick?: () => void;
};

type Props = { 
  items: ToolItem[];
  onItemClick?: (item: ToolItem) => void;
};

export default function ReportToolboxPanel({ items, onItemClick }: Props) {
  return (
    <div className="p-4">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Verktyg & Deliverables
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => onItemClick?.(item)}
            className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="font-medium text-sm text-gray-900">{item.title}</div>
            {item.subtitle && (
              <div className="text-xs text-gray-500 mt-1">{item.subtitle}</div>
            )}
          </button>
        ))}
      </div>
      <div className="mt-6 text-xs text-gray-400 text-center">
        Powered by Recta
      </div>
    </div>
  );
}

