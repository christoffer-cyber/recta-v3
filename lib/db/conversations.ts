import { sql } from '@vercel/postgres';

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  company_name: string | null;
  status: 'in_progress' | 'completed';
  current_phase: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface CanvasState {
  id: number;
  conversation_id: number;
  canvas_data: Record<string, unknown>;
  updated_at: Date;
}

// Create a new conversation
export async function createConversation(
  userId: number,
  title: string = 'Ny analys',
  companyName?: string
): Promise<Conversation> {
  const result = await sql`
    INSERT INTO conversations (user_id, title, company_name)
    VALUES (${userId}, ${title}, ${companyName || null})
    RETURNING *
  `;
  
  return result.rows[0] as Conversation;
}

// Get all conversations for a user
export async function getConversationsByUserId(userId: number): Promise<Conversation[]> {
  const result = await sql`
    SELECT * FROM conversations
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
  `;
  
  return result.rows as Conversation[];
}

// Get single conversation
export async function getConversationById(
  conversationId: number,
  userId: number
): Promise<Conversation | null> {
  const result = await sql`
    SELECT * FROM conversations
    WHERE id = ${conversationId} AND user_id = ${userId}
  `;
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0] as Conversation;
}

// Update conversation
export async function updateConversation(
  conversationId: number,
  userId: number,
  updates: {
    title?: string;
    company_name?: string;
    status?: 'in_progress' | 'completed';
    current_phase?: string;
  }
): Promise<Conversation | null> {
  const fields: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(updates.title);
  }
  if (updates.company_name !== undefined) {
    fields.push(`company_name = $${paramIndex++}`);
    values.push(updates.company_name);
  }
  if (updates.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.current_phase !== undefined) {
    fields.push(`current_phase = $${paramIndex++}`);
    values.push(updates.current_phase);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  
  values.push(conversationId, userId);

  const query = `
    UPDATE conversations
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
    RETURNING *
  `;

  const result = await sql.query(query, values);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0] as Conversation;
}

// Delete conversation
export async function deleteConversation(
  conversationId: number,
  userId: number
): Promise<boolean> {
  const result = await sql`
    DELETE FROM conversations
    WHERE id = ${conversationId} AND user_id = ${userId}
  `;
  
  return (result.rowCount ?? 0) > 0;
}

// Get messages for conversation
export async function getMessagesByConversationId(
  conversationId: number
): Promise<Message[]> {
  const result = await sql`
    SELECT * FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY timestamp ASC
  `;
  
  return result.rows as Message[];
}

// Add messages to conversation
export async function addMessages(
  conversationId: number,
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: string }>
): Promise<void> {
  if (messages.length === 0) return;

  for (const msg of messages) {
    if (msg.timestamp) {
      await sql`
        INSERT INTO messages (conversation_id, role, content, timestamp)
        VALUES (${conversationId}, ${msg.role}, ${msg.content}, ${msg.timestamp})
      `;
    } else {
      await sql`
        INSERT INTO messages (conversation_id, role, content)
        VALUES (${conversationId}, ${msg.role}, ${msg.content})
      `;
    }
  }
}

// Save canvas state
export async function saveCanvasState(
  conversationId: number,
  canvasData: Record<string, unknown>
): Promise<void> {
  // Check if canvas state exists
  const existing = await sql`
    SELECT id FROM canvas_states
    WHERE conversation_id = ${conversationId}
    LIMIT 1
  `;

  if (existing.rows.length > 0) {
    // Update existing
    await sql`
      UPDATE canvas_states
      SET canvas_data = ${JSON.stringify(canvasData)},
          updated_at = CURRENT_TIMESTAMP
      WHERE conversation_id = ${conversationId}
    `;
  } else {
    // Insert new
    await sql`
      INSERT INTO canvas_states (conversation_id, canvas_data)
      VALUES (${conversationId}, ${JSON.stringify(canvasData)})
    `;
  }
}

// Get canvas state
export async function getCanvasState(conversationId: number): Promise<Record<string, unknown> | null> {
  const result = await sql`
    SELECT canvas_data FROM canvas_states
    WHERE conversation_id = ${conversationId}
    ORDER BY updated_at DESC
    LIMIT 1
  `;

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0].canvas_data;
}

// Get message count for conversation
export async function getMessageCount(conversationId: number): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM messages
    WHERE conversation_id = ${conversationId}
  `;

  return parseInt(result.rows[0].count);
}

