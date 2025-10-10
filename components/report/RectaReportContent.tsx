"use client";
import React from "react";
import { motion } from "framer-motion";

// Report data types
export interface ReportData {
  company: {
    name: string;
    size: number;
    stage: string;
    industry: string;
  };
  summary: {
    challenge: string;
    solution: string;
    investment: string;
    timeline: string;
  };
  problem: {
    description: string;
    rootCause: string[];
    impact: string;
  };
  scenarios: Array<{
    name: string;
    description: string;
    cost: { min: number; max: number };
    timeline: string;
    pros: string[];
    cons: string[];
  }>;
  selectedScenario: {
    name: string;
    rationale: string;
  };
  cost: {
    breakdown: Array<{ category: string; amount: number }>;
    total: number;
    roi: string;
  };
  timeline: {
    milestones: Array<{ week: string; task: string; owner: string }>;
  };
  recommendations: string[];
  nextSteps: Array<{ action: string; owner: string; deadline: string }>;
}

interface Props {
  data: ReportData;
}

export function RectaReportContent({ data }: Props) {
  return (
    <div className="space-y-12">
      {/* Slide 1: Cover */}
      <section id="slide-1" className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 to-white rounded-xl p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Organisationsanalys
          </h1>
          <h2 className="text-3xl text-gray-600 mb-8">
            {data.company.name}
          </h2>
          <div className="text-sm text-gray-500">
            Prepared by Recta AI • {new Date().toLocaleDateString('sv-SE')}
          </div>
        </motion.div>
      </section>

      {/* Slide 2: Executive Summary */}
      <section id="slide-2" className="min-h-screen bg-white rounded-xl p-12">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">Executive Summary</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Företag</h4>
            <p className="text-gray-700">
              {data.company.size} personer • {data.company.stage} • {data.company.industry}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Utmaning</h4>
            <p className="text-gray-700">{data.summary.challenge}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Rekommenderad lösning</h4>
            <p className="text-gray-700">{data.summary.solution}</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Investering</h4>
              <p className="text-2xl font-bold text-blue-600">{data.summary.investment}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
              <p className="text-2xl font-bold text-blue-600">{data.summary.timeline}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 3: Problem Analysis */}
      <section id="slide-3" className="min-h-screen bg-white rounded-xl p-12">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">Problemanalys</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-2xl font-semibold text-gray-900 mb-4">Nuvarande situation</h4>
            <p className="text-lg text-gray-700 leading-relaxed">{data.problem.description}</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Grundorsaker</h4>
            <ul className="space-y-3">
              {data.problem.rootCause.map((cause, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-red-500 font-bold text-xl">•</span>
                  <span className="text-gray-700">{cause}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
            <h4 className="font-semibold text-red-900 mb-2">Påverkan</h4>
            <p className="text-red-800">{data.problem.impact}</p>
          </div>
        </div>
      </section>

      {/* Slide 4: Solution Scenarios */}
      <section id="slide-4" className="min-h-screen bg-white rounded-xl p-12">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">Utvärderade alternativ</h3>
        <div className="grid grid-cols-3 gap-6">
          {data.scenarios.map((scenario, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
            >
              <div className="text-4xl font-bold text-gray-300 mb-2">{index + 1}</div>
              <h4 className="font-semibold text-gray-900 mb-2">{scenario.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>
              <div className="text-sm text-gray-700 mb-2">
                {scenario.cost.min / 1000}k - {scenario.cost.max / 1000}k SEK
              </div>
              <div className="text-sm text-gray-500">{scenario.timeline}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Slide 5: Selected Solution */}
      <section id="slide-5" className="min-h-screen bg-gradient-to-br from-blue-50 to-white rounded-xl p-12">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">Rekommenderad lösning</h3>
        <div className="max-w-3xl mx-auto text-center">
          <h4 className="text-4xl font-bold text-gray-900 mb-6">{data.selectedScenario.name}</h4>
          <p className="text-xl text-gray-700 leading-relaxed">{data.selectedScenario.rationale}</p>
        </div>
      </section>

      {/* Slide 6: Cost Breakdown */}
      <section id="slide-6" className="min-h-screen bg-white rounded-xl p-12">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">Kostnadsanalys</h3>
        <div className="space-y-6">
          {data.cost.breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-4 border-b border-gray-200">
              <span className="text-gray-700">{item.category}</span>
              <span className="text-2xl font-bold text-gray-900">
                {(item.amount / 1000).toFixed(0)}k SEK
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between py-6 border-t-2 border-gray-300">
            <span className="text-xl font-semibold text-gray-900">Total årskostnad</span>
            <span className="text-3xl font-bold text-blue-600">
              {(data.cost.total / 1000).toFixed(0)}k SEK
            </span>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
            <h4 className="font-semibold text-green-900 mb-2">ROI</h4>
            <p className="text-green-800">{data.cost.roi}</p>
          </div>
        </div>
      </section>

      {/* Slide 7: Timeline */}
      <section id="slide-7" className="min-h-screen bg-white rounded-xl p-12">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">Rekryteringsplan</h3>
        <div className="space-y-4">
          {data.timeline.milestones.map((milestone, index) => (
            <div 
              key={index} 
              className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg"
            >
              <div className="w-24 flex-shrink-0 font-semibold text-gray-900">
                {milestone.week}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{milestone.task}</div>
                <div className="text-sm text-gray-600 mt-1">Ansvarig: {milestone.owner}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Slide 8: Recommendations */}
      <section id="slide-8" className="min-h-screen bg-white rounded-xl p-12">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">Rekommendationer</h3>
        <div className="space-y-4">
          {data.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-4 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-8 h-8 flex-shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <p className="text-gray-800 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Slide 9: Next Steps */}
      <section id="slide-9" className="min-h-screen bg-white rounded-xl p-12">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-6">Nästa steg</h3>
        <div className="space-y-4">
          {data.nextSteps.map((step, index) => (
            <div 
              key={index}
              className="flex items-start gap-6 p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <input 
                type="checkbox" 
                className="mt-1 w-5 h-5 text-blue-600 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{step.action}</div>
                <div className="text-sm text-gray-600 mt-2">
                  Ansvarig: {step.owner} • Deadline: {step.deadline}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-600">
            💡 Tillgång till alla verktyg & deliverables i vänster sidopanel
          </p>
        </div>
      </section>

      {/* Slide 10: Thank You */}
      <section id="slide-10" className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 to-white rounded-xl p-12">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">Tack!</h1>
        <p className="text-xl text-gray-600">
          Frågor? Kontakta oss på info@recta.ai
        </p>
      </section>
    </div>
  );
}

