"use client";
import React from "react";
import { motion } from "framer-motion";
import type { Scenario } from "@/lib/types";

interface Props {
  scenarios: Scenario[];
  onSelect: (scenario: Scenario) => void;
}

export function ScenarioButtons({ scenarios, onSelect }: Props) {
  return (
    <div className="space-y-3 my-4">
      <p className="text-xs text-gray-500 mb-2">Välj ett alternativ:</p>
      {scenarios.map((scenario, index) => (
        <motion.button
          key={scenario.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelect(scenario)}
          className="w-full text-left p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-750 transition-all group"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold group-hover:bg-blue-500/30">
                {index + 1}
              </div>
              <h4 className="font-semibold text-gray-200 group-hover:text-white">
                {scenario.name}
              </h4>
            </div>
            <svg 
              className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          <p className="text-sm text-gray-400 mb-3">
            {scenario.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{scenario.cost.min / 1000}-{scenario.cost.max / 1000}k SEK</span>
            <span>{scenario.timeline}</span>
            <span className={`px-2 py-0.5 rounded-full ${
              scenario.risk === 'low' ? 'bg-green-500/20 text-green-400' :
              scenario.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              Risk: {scenario.risk}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}


