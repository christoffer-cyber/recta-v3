'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    goal: '', companySize: '', industry: '', role: '', budget: ''
  });

  const handleComplete = () => {
    sessionStorage.setItem('onboarding', JSON.stringify(data));
    router.push('/conversation');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex gap-2 mb-2">
            {[1,2,3].map(i => (
              <div key={i} className={`flex-1 h-2 rounded ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Välkommen! 👋</h2>
            <p className="text-gray-600">Vad vill du göra?</p>
            {[
              { value: 'jd', label: 'Skapa jobbeskrivning', icon: '📝' },
              { value: 'org', label: 'Analysera organisation', icon: '🏢' },
              { value: 'comp', label: 'Löneanalys', icon: '💰' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => { setData({...data, goal: opt.value}); setStep(2); }}
                className="w-full p-4 border-2 rounded-lg hover:border-blue-600 text-left flex gap-3"
              >
                <span className="text-3xl">{opt.icon}</span>
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Company */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Företagsinfo</h2>
            <input
              placeholder="Storlek (t.ex. 25 personer)"
              value={data.companySize}
              onChange={e => setData({...data, companySize: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              placeholder="Bransch (t.ex. B2B SaaS)"
              value={data.industry}
              onChange={e => setData({...data, industry: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              placeholder="Roll (t.ex. Senior Dev)"
              value={data.role}
              onChange={e => setData({...data, role: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              placeholder="Budget (t.ex. 700-850k)"
              value={data.budget}
              onChange={e => setData({...data, budget: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <button
              onClick={() => setStep(3)}
              disabled={!data.companySize || !data.role}
              className="w-full py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Fortsätt
            </button>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Redo att börja!</h2>
            <div className="p-4 bg-gray-50 rounded space-y-2">
              <p><strong>Mål:</strong> {data.goal === 'jd' ? 'Jobbeskrivning' : data.goal}</p>
              <p><strong>Företag:</strong> {data.companySize}</p>
              <p><strong>Roll:</strong> {data.role}</p>
            </div>
            <button
              onClick={handleComplete}
              className="w-full py-3 bg-blue-600 text-white rounded-lg"
            >
              Starta analys →
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
