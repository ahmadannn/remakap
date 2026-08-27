import mysql from 'mysql2/promise';

async function migrateDatabase() {
  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'remakap_db',
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Menjalankan ALTER TABLE...');
    
    // Gunakan try-catch di dalam agar jika kolom sudah ada, tidak throw error ke luar
    try {
      await connection.query('ALTER TABLE sto_mapping ADD COLUMN witel VARCHAR(20) DEFAULT "LAINNYA"');
      console.log('✅ Kolom witel berhasil ditambahkan!');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚡ Kolom witel sudah ada, lanjut...');
      } else {
        throw err;
      }
    }
    
    connection.end();
  } catch (error) {
    console.error('❌ Gagal mengubah schema database:', error.message);
  }
}

migrateDatabase();
