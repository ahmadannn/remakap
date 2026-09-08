import { createClient } from '@libsql/client';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('❌ Harap isi TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN di file .env terlebih dahulu!');
  process.exit(1);
}

const db = createClient({ url, authToken });

async function migrate() {
  try {
    console.log('🚀 Memulai migrasi data ke Turso Cloud Database...');
    const sql = fs.readFileSync('database.sql', 'utf8');
    
    // Split SQL statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      await db.execute(stmt);
    }

    console.log('✅ BERHASIL! Semua data & tabel dari database.sql sudah di-upload ke Turso Cloud!');
  } catch (error) {
    console.error('❌ Gagal melakukan migrasi:', error.message);
  }
}

migrate();
