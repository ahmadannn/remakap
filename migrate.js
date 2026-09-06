import Database from 'better-sqlite3';
import path from 'path';

function migrateDatabase() {
  const dbPath = path.resolve('database.sqlite');
  try {
    const db = new Database(dbPath);
    console.log('Menjalankan ALTER TABLE...');
    
    try {
      db.exec('ALTER TABLE sto_mapping ADD COLUMN witel TEXT DEFAULT "LAINNYA"');
      console.log('✅ Kolom witel berhasil ditambahkan!');
    } catch (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('⚡ Kolom witel sudah ada, lanjut...');
      } else {
        throw err;
      }
    }
    
    db.close();
  } catch (error) {
    console.error('❌ Gagal mengubah schema database:', error.message);
  }
}

migrateDatabase();
