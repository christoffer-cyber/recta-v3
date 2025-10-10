"use client";
import React from "react";

type NavItem = { id: string; label: string };
type Props = { items: NavItem[] };

export default function ReportNavigation({ items }: Props) {
  return (
    <div className="p-4">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Rapport
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <a 
            key={item.id} 
            href={`#${item.id}`} 
            className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 py-2 px-3 rounded transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

