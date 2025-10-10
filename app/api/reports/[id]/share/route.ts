import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { sql } from '@vercel/postgres';
import { generateShareToken, getShareUrl } from '@/lib/share-token';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const conversationId = parseInt(id);
    const userId = parseInt(session.user.id as string);

    // Verify user owns this conversation
    const convResult = await sql`
      SELECT id FROM conversations
      WHERE id = ${conversationId} AND user_id = ${userId}
    `;

    if (convResult.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Generate or get existing share token
    let shareToken = '';
    
    const existingShare = await sql`
      SELECT share_token FROM reports
      WHERE conversation_id = ${conversationId}
    `;

    if (existingShare.rows.length > 0 && existingShare.rows[0].share_token) {
      // Use existing token
      shareToken = existingShare.rows[0].share_token;
      
      // Re-enable sharing if it was disabled
      await sql`
        UPDATE reports
        SET 
          share_enabled = true,
          shared_at = CURRENT_TIMESTAMP
        WHERE conversation_id = ${conversationId}
      `;
    } else {
      // Generate new token
      shareToken = generateShareToken();
      
      await sql`
        UPDATE reports
        SET 
          share_token = ${shareToken},
          share_enabled = true,
          shared_at = CURRENT_TIMESTAMP
        WHERE conversation_id = ${conversationId}
      `;
    }

    const shareUrl = getShareUrl(shareToken);

    return NextResponse.json({
      success: true,
      shareUrl,
      token: shareToken,
    });

  } catch (error) {
    console.error('Error generating share link:', error);
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to disable sharing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const conversationId = parseInt(id);
    const userId = parseInt(session.user.id as string);

    // Verify ownership
    const convResult = await sql`
      SELECT id FROM conversations
      WHERE id = ${conversationId} AND user_id = ${userId}
    `;

    if (convResult.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Disable sharing
    await sql`
      UPDATE reports
      SET share_enabled = false
      WHERE conversation_id = ${conversationId}
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error disabling share:', error);
    return NextResponse.json(
      { error: 'Failed to disable sharing' },
      { status: 500 }
    );
  }
}

