import mysql from 'mysql2/promise';
import fs from 'fs';

async function setupDatabase() {
  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
  };

  try {
    console.log('Menghubungkan ke MySQL...');
    // Connect without specifying database to create it
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Membuat database remakap_db...');
    await connection.query('CREATE DATABASE IF NOT EXISTS remakap_db');
    
    console.log('Beralih ke database remakap_db...');
    await connection.query('USE remakap_db');

    console.log('Membaca file database.sql...');
    const sqlScript = fs.readFileSync('database.sql', 'utf8');
    
    // Split by semicolons for multiple queries
    const queries = sqlScript.split(';').filter(q => q.trim().length > 0);
    
    for (let query of queries) {
      if (query.trim()) {
        await connection.query(query);
      }
    }
    
    console.log('✅ Database berhasil dibuat dan data berhasil dimasukkan!');
    connection.end();
  } catch (error) {
    console.error('❌ Gagal melakukan setup database:', error.message);
  }
}

setupDatabase();
