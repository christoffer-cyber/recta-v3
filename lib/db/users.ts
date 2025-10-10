import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: Date;
}

export async function createUser(email: string, password: string, name?: string): Promise<User> {
  const passwordHash = await bcrypt.hash(password, 10);
  
  const result = await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${passwordHash}, ${name || null})
    RETURNING id, email, name, created_at
  `;
  
  return result.rows[0] as User;
}

export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const result = await sql`
    SELECT id, email, name, password_hash, created_at
    FROM users
    WHERE email = ${email}
  `;
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0] as User & { password_hash: string };
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await sql`
    SELECT id, email, name, created_at
    FROM users
    WHERE id = ${id}
  `;
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0] as User;
}

