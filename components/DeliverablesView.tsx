'use client';

import { useState } from 'react';
import {
  JobDescription,
  CompensationAnalysis,
  InterviewQuestions,
  SuccessPlan
} from '@/lib/deliverable-schemas';
import { generateMarkdown, downloadMarkdown, downloadJSON, downloadPDF } from '@/lib/export-utils';

interface DeliverablesViewProps {
  jobDescription?: JobDescription;
  compensation?: CompensationAnalysis;
  interviewQuestions?: InterviewQuestions;
  successPlan?: SuccessPlan;
}

export function DeliverablesView({
  jobDescription,
  compensation,
  interviewQuestions,
  successPlan
}: DeliverablesViewProps) {
  const [activeTab, setActiveTab] = useState<'jd' | 'comp' | 'interview' | 'plan'>('jd');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleExportMarkdown = () => {
    const markdown = generateMarkdown({
      jobDescription,
      compensation,
      interviewQuestions,
      successPlan
    });
    downloadMarkdown(markdown);
  };

  const handleExportJSON = () => {
    downloadJSON({
      jobDescription,
      compensation,
      interviewQuestions,
      successPlan
    });
  };

  const handleExportPDF = async () => {
    await downloadPDF({
      jobDescription,
      compensation,
      interviewQuestions,
      successPlan
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tab Navigation + Export Buttons */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6">
        <div className="flex">
        <button
          onClick={() => setActiveTab('jd')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'jd'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          📄 Job Description
        </button>
        <button
          onClick={() => setActiveTab('comp')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'comp'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          💰 Compensation
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'interview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          ❓ Interview Questions
        </button>
        <button
          onClick={() => setActiveTab('plan')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'plan'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          📅 90-Day Plan
        </button>
        </div>
        
        {/* Export Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleExportMarkdown}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            📄 Markdown
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            💾 JSON
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            📑 PDF
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'jd' && jobDescription && (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {jobDescription.role.title}
            </h1>
            <p className="text-gray-600 mb-6">
              {jobDescription.role.level} • Reports to {jobDescription.role.reportsTo}
              {jobDescription.role.teamSize && ` • Team: ${jobDescription.role.teamSize}`}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-gray-800">{jobDescription.overview}</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Responsibilities</h2>
            {jobDescription.responsibilities.map((category, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">{category.category}</h3>
                <ul className="list-disc list-inside space-y-1">
                  {category.items.map((item, i) => (
                    <li key={i} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>
            ))}

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Qualifications</h2>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Must Have</h3>
            <ul className="list-disc list-inside space-y-1 mb-4">
              {jobDescription.qualifications.mustHave.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Nice to Have</h3>
            <ul className="list-disc list-inside space-y-1">
              {jobDescription.qualifications.niceToHave.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Compensation</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 font-medium">
                Base Salary: {formatCurrency(jobDescription.compensation.baseSalary.min)} - 
                {formatCurrency(jobDescription.compensation.baseSalary.max)} {jobDescription.compensation.baseSalary.currency}
              </p>
              {jobDescription.compensation.equity && (
                <p className="text-gray-700 mt-2">Equity: {jobDescription.compensation.equity}</p>
              )}
              {jobDescription.compensation.benefits && (
                <p className="text-gray-700 mt-2">Benefits: {jobDescription.compensation.benefits}</p>
              )}
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Success Plan</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800">First 30 Days</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {jobDescription.successPlan.thirtyDays.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">60 Days</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {jobDescription.successPlan.sixtyDays.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">90 Days</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {jobDescription.successPlan.ninetyDays.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comp' && compensation && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Compensation Analysis</h1>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Market Data</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium text-gray-900">{compensation.marketData.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{compensation.marketData.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Industry</p>
                  <p className="font-medium text-gray-900">{compensation.marketData.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company Size</p>
                  <p className="font-medium text-gray-900">{compensation.marketData.companySize}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Market Benchmarks</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">25th Percentile</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(compensation.benchmarks.percentile25)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Median (50th)</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(compensation.benchmarks.median)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">75th Percentile</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(compensation.benchmarks.percentile75)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">90th Percentile</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(compensation.benchmarks.percentile90)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Our Recommendation</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Base Salary Range</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(compensation.recommendation.baseSalary.min)} - {formatCurrency(compensation.recommendation.baseSalary.max)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Target: {formatCurrency(compensation.recommendation.baseSalary.target)}
                  </p>
                </div>
                
                <div className="border-t border-green-200 pt-4">
                  <p className="text-sm text-gray-600 mb-2">Total Cost (Year 1)</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Base Salary</span>
                      <span className="text-gray-900">{formatCurrency(compensation.recommendation.totalCost.base)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Employer Fees</span>
                      <span className="text-gray-900">{formatCurrency(compensation.recommendation.totalCost.employerFees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Benefits</span>
                      <span className="text-gray-900">{formatCurrency(compensation.recommendation.totalCost.benefits)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base border-t border-green-200 pt-2 mt-2">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">{formatCurrency(compensation.recommendation.totalCost.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-green-200 pt-4">
                  <p className="text-sm text-gray-600 mb-1">Market Positioning</p>
                  <p className="font-medium text-gray-900">{compensation.recommendation.positioning}</p>
                  <p className="text-sm text-gray-700 mt-2">{compensation.recommendation.rationale}</p>
                </div>
              </div>
            </div>

            {compensation.comparableRoles && compensation.comparableRoles.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Comparable Roles</h2>
                <div className="space-y-3">
                  {compensation.comparableRoles.map((role, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{role.company}</p>
                          <p className="text-sm text-gray-600">{role.size}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(role.salary)}</p>
                          <p className="text-xs text-gray-500">{role.source}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'interview' && interviewQuestions && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Interview Questions: {interviewQuestions.role}
            </h1>

            <div className="space-y-6">
              {interviewQuestions.questions.map((q, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded mb-2">
                        {q.category}
                      </span>
                      <p className="text-lg font-medium text-gray-900">{q.question}</p>
                    </div>
                  </div>

                  <div className="ml-11 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-green-700 mb-1">✓ What to Listen For:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {q.whatToListenFor.map((item, i) => (
                          <li key={i} className="text-sm text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-red-700 mb-1">⚠ Red Flags:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {q.redFlags.map((item, i) => (
                          <li key={i} className="text-sm text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>

                    {q.followUps && q.followUps.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-blue-700 mb-1">💬 Follow-ups:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {q.followUps.map((item, i) => (
                            <li key={i} className="text-sm text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assessment Guidance</h2>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Scoring Criteria:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {interviewQuestions.assessmentGuidance.scoringCriteria.map((item, i) => (
                    <li key={i} className="text-sm text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Comparison Tips:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {interviewQuestions.assessmentGuidance.comparisonTips.map((item, i) => (
                    <li key={i} className="text-sm text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plan' && successPlan && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              90-Day Success Plan: {successPlan.role}
            </h1>
            <p className="text-gray-600 mb-8">{successPlan.overview}</p>

            <div className="space-y-8">
              {/* 30 Days */}
              <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-6">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">First 30 Days</h2>
                <p className="text-blue-800 font-medium mb-4">{successPlan.thirtyDays.focus}</p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Objectives:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {successPlan.thirtyDays.objectives.map((item, i) => (
                        <li key={i} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Deliverables:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {successPlan.thirtyDays.deliverables.map((item, i) => (
                        <li key={i} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Key Meetings:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {successPlan.thirtyDays.keyMeetings.map((item, i) => (
                        <li key={i} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 60 Days */}
              <div className="bg-green-50 border-l-4 border-green-600 rounded-r-lg p-6">
                <h2 className="text-2xl font-bold text-green-900 mb-2">60 Days</h2>
                <p className="text-green-800 font-medium mb-4">{successPlan.sixtyDays.focus}</p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-green-900 mb-2">Objectives:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {successPlan.sixtyDays.objectives.map((item, i) => (
                        <li key={i} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-green-900 mb-2">Deliverables:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {successPlan.sixtyDays.deliverables.map((item, i) => (
                        <li key={i} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-green-900 mb-2">Key Milestones:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {successPlan.sixtyDays.keyMilestones.map((item, i) => (
                        <li key={i} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 90 Days */}
              <div className="bg-purple-50 border-l-4 border-purple-600 rounded-r-lg p-6">
                <h2 className="text-2xl font-bold text-purple-900 mb-2">90 Days</h2>
                <p className="text-purple-800 font-medium mb-4">{successPlan.ninetyDays.focus}</p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-purple-900 mb-2">Objectives:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {successPlan.ninetyDays.objectives.map((item, i) => (
                        <li key={i} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-purple-900 mb-2">Deliverables:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {successPlan.ninetyDays.deliverables.map((item, i) => (
                        <li key={i} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-purple-900 mb-2">Success Metrics:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {successPlan.ninetyDays.successMetrics.map((item, i) => (
                        <li key={i} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Support Needed</h2>
              <ul className="list-disc list-inside space-y-2">
                {successPlan.supportNeeded.map((item, i) => (
                  <li key={i} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex gap-3">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            📄 Export as PDF
          </button>
          <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            📝 Export as Markdown
          </button>
        </div>
      </div>
    </div>
  );
}

