export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">Recta</div>
          <div className="flex gap-6 items-center">
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Priser</a>
            <a href="/signin" className="text-gray-600 hover:text-gray-900">Logga in</a>
            <a href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Prova gratis
            </a>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
