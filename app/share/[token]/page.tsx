import { sql } from '@vercel/postgres';
import { notFound } from 'next/navigation';
import SharePageClient from './SharePageClient';
import type { ReportData } from '@/components/report/RectaReportContent';

interface SharePageProps {
  params: {
    token: string;
  };
}

async function getSharedReport(token: string) {
  try {
    const result = await sql`
      SELECT 
        r.report_data,
        r.created_at,
        c.company_name,
        c.title
      FROM reports r
      JOIN conversations c ON r.conversation_id = c.id
      WHERE r.share_token = ${token}
        AND r.share_enabled = true
    `;

    if (result.rows.length === 0) {
      return null;
    }

    return {
      reportData: result.rows[0].report_data as ReportData,
      createdAt: result.rows[0].created_at,
      companyName: result.rows[0].company_name,
      title: result.rows[0].title,
    };
  } catch (error) {
    console.error('Error fetching shared report:', error);
    return null;
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const report = await getSharedReport(params.token);

  if (!report) {
    notFound();
  }

  return (
    <SharePageClient
      reportData={report.reportData}
      companyName={report.companyName}
      title={report.title}
      createdAt={report.createdAt}
    />
  );
}

