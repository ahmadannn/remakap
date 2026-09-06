import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

function setupDatabase() {
  const dbPath = path.resolve('database.sqlite');
  try {
    console.log(`Menghubungkan ke database SQLite (${dbPath})...`);
    const db = new Database(dbPath);
    
    // Enable WAL mode for better concurrency performance
    db.pragma('journal_mode = WAL');

    console.log('Membaca file database.sql...');
    const sqlScript = fs.readFileSync('database.sql', 'utf8');

    // Exec executes multi-statement SQL script
    db.exec(sqlScript);

    console.log('✅ Database SQLite berhasil dibuat dan data berhasil dimasukkan!');
    db.close();
  } catch (error) {
    console.error('❌ Gagal melakukan setup database:', error.message);
  }
}

setupDatabase();
