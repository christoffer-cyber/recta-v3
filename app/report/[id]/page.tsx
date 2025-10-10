import { sql } from '@vercel/postgres';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ReportPageClient } from './ReportPageClient';
import type { ReportData } from '@/components/report/RectaReportContent';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ReportPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const conversationId = parseInt(params.id);

  if (isNaN(conversationId)) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Ogiltig rapport-ID</h1>
          <p className="text-gray-600 mt-2">Kunde inte hitta rapporten.</p>
        </div>
      </div>
    );
  }

  try {
    // Fetch report from database
    const result = await sql`
      SELECT r.report_data, c.user_id
      FROM reports r
      JOIN conversations c ON r.conversation_id = c.id
      WHERE r.conversation_id = ${conversationId}
    `;

    if (result.rows.length === 0) {
      return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Rapport hittades inte</h1>
            <p className="text-gray-600 mt-2">Det finns ingen rapport för denna conversation.</p>
          </div>
        </div>
      );
    }

    const report = result.rows[0];

    // Verify ownership
    if (report.user_id !== session.user.id) {
      return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Ingen åtkomst</h1>
            <p className="text-gray-600 mt-2">Du har inte tillgång till denna rapport.</p>
          </div>
        </div>
      );
    }

    const reportData = report.report_data as ReportData;

    return <ReportPageClient reportData={reportData} conversationId={conversationId} />;

  } catch (error) {
    console.error('[Report Page] Error loading report:', error);
    
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Ett fel uppstod</h1>
          <p className="text-gray-600 mt-2">Kunde inte ladda rapporten.</p>
        </div>
      </div>
    );
  }
}

