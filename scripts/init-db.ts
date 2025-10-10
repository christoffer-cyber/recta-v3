import 'dotenv/config';

import 'dotenv/config';
import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

async function initDatabase() {
  try {
    const schemaPath = path.join(process.cwd(), 'lib/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    await sql.query(schema);
    
    console.log('✅ Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();

