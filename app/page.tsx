import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Hero */}
      <section className="py-20 text-center">
        <h1 className="text-6xl font-bold mb-6">
          AI-powered organisationsdesign<br/>
          <span className="text-blue-600">på 20 minuter</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Få kompletta jobbeskrivningar, löneanalyser och handlingsplaner. 
          Konsulter tar 6 veckor och kostar €50k. Vi tar 20 minuter för €200/månad.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700">
            Starta gratis →
          </Link>
          <a href="#demo" className="px-8 py-4 border-2 border-gray-300 text-lg rounded-lg hover:border-gray-400">
            Se demo
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-500">Inget kreditkort behövs</p>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y">
        <p className="text-center text-gray-500 mb-6">Används av tillväxtbolag i hela Norden</p>
        <div className="flex justify-center gap-12 text-gray-400">
          <div className="text-2xl font-bold">50+ företag</div>
          <div className="text-2xl font-bold">200+ roller</div>
          <div className="text-2xl font-bold">€2M sparade</div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 grid md:grid-cols-3 gap-8">
        <div className="p-6">
          <div className="text-4xl mb-4">⚡️</div>
          <h3 className="text-xl font-bold mb-2">20 minuter istället för 6 veckor</h3>
          <p className="text-gray-600">AI-driven conversation guidar dig från problem till färdig plan.</p>
        </div>
        <div className="p-6">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-bold mb-2">95% billigare än konsulter</h3>
          <p className="text-gray-600">€200/månad vs €50k per projekt. Samma kvalitet, bråkdelen av priset.</p>
        </div>
        <div className="p-6">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">Data från 5000+ företag</h3>
          <p className="text-gray-600">Benchmarks, lönedata och best practices från liknande bolag.</p>
        </div>
      </section>

      {/* Demo Video */}
      <section id="demo" className="py-20 bg-gray-50 -mx-4 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Se hur det fungerar</h2>
          <p className="text-center text-gray-600 mb-8">Från noll till färdig jobbeskrivning på 2 minuter</p>
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-white text-xl">🎥 Demo video kommer här</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Så fungerar det</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
            <h3 className="font-bold mb-2">Berätta om företaget</h3>
            <p className="text-sm text-gray-600">Storlek, bransch, budget</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
            <h3 className="font-bold mb-2">Identifiera problemet</h3>
            <p className="text-sm text-gray-600">AI gräver djupare efter rotorsaken</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
            <h3 className="font-bold mb-2">Jämför lösningar</h3>
            <p className="text-sm text-gray-600">3 scenarios med kostnad & risk</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
            <h3 className="font-bold mb-2">Få deliverables</h3>
            <p className="text-sm text-gray-600">JD, löneanalys, intervjufrågor</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50 -mx-4 px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Priser</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-lg border">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <div className="text-4xl font-bold mb-4">€0</div>
            <ul className="space-y-3 mb-6 text-sm">
              <li>✓ 3 JD-generationer/månad</li>
              <li>✓ 1 org-analys/månad</li>
              <li>✓ Basic benchmarks</li>
            </ul>
            <Link href="/signup" className="block text-center px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400">
              Kom igång
            </Link>
          </div>

          <div className="bg-blue-600 text-white p-8 rounded-lg border-4 border-blue-700 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold">
              Populärast
            </div>
            <h3 className="text-2xl font-bold mb-2">Professional</h3>
            <div className="text-4xl font-bold mb-4">€200<span className="text-lg">/mån</span></div>
            <ul className="space-y-3 mb-6 text-sm">
              <li>✓ Unlimited allt</li>
              <li>✓ Full benchmarks</li>
              <li>✓ Komplett org-design</li>
              <li>✓ Email support</li>
            </ul>
            <Link href="/signup" className="block text-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-bold">
              Starta gratis trial
            </Link>
          </div>

          <div className="bg-white p-8 rounded-lg border">
            <h3 className="text-2xl font-bold mb-2">Business</h3>
            <div className="text-4xl font-bold mb-4">€800<span className="text-lg">/mån</span></div>
            <ul className="space-y-3 mb-6 text-sm">
              <li>✓ Allt i Pro</li>
              <li>✓ HRIS integration</li>
              <li>✓ Team collaboration</li>
              <li>✓ Priority support</li>
            </ul>
            <Link href="/signup" className="block text-center px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400">
              Kontakta oss
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Redo att börja?</h2>
        <p className="text-xl text-gray-600 mb-8">Första analysen på oss. Inget kreditkort behövs.</p>
        <Link href="/signup" className="inline-block px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700">
          Skapa gratis konto →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-600">
        <p>© 2025 Recta. AI-Powered Organizational Intelligence.</p>
      </footer>
    </div>
  );
}