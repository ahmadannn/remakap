import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi Database (Sesuaikan dengan setting XAMPP default)
const dbConfig = {
  host: 'localhost',
  user: 'root',      // Username default XAMPP
  password: '',      // Password default XAMPP biasanya kosong
  database: 'remakap_db',
};

// Cek Koneksi Database
async function testConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Berhasil terhubung ke database MySQL (remakap_db)');
    connection.end();
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error.message);
    console.log('Pastikan XAMPP (Apache & MySQL) sudah berjalan!');
  }
}
testConnection();

// ==========================================
// ENDPOINT API
// ==========================================

// 1. GET /api/stos -> Ambil semua daftar STO
app.get('/api/stos', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT kode_sto, nama_wilayah, witel FROM sto_mapping ORDER BY nama_wilayah ASC, kode_sto ASC');
    connection.end();
    
    // Return array of objects langsung agar frontend bisa membaca witel
    res.json(rows);
  } catch (error) {
    console.error('Error fetching STOs:', error);
    res.status(500).json({ error: 'Gagal mengambil data dari database' });
  }
});

// 2. POST /api/stos -> Tambah STO baru
app.post('/api/stos', async (req, res) => {
  const { kode_sto, nama_wilayah, witel } = req.body;

  if (!kode_sto || !nama_wilayah) {
    return res.status(400).json({ error: 'Kode STO dan Nama Wilayah wajib diisi' });
  }

  const finalWitel = witel ? witel.toUpperCase() : 'LAINNYA';

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Cek apakah kode STO sudah ada
    const [existing] = await connection.execute('SELECT id FROM sto_mapping WHERE kode_sto = ?', [kode_sto.toUpperCase()]);
    if (existing.length > 0) {
      connection.end();
      return res.status(409).json({ error: 'Kode STO sudah terdaftar' });
    }

    // Insert ke database
    await connection.execute('INSERT INTO sto_mapping (kode_sto, nama_wilayah, witel) VALUES (?, ?, ?)', [
      kode_sto.toUpperCase(),
      nama_wilayah.toUpperCase(),
      finalWitel
    ]);
    
    connection.end();
    res.status(201).json({ message: 'STO berhasil ditambahkan' });
  } catch (error) {
    console.error('Error inserting STO:', error);
    res.status(500).json({ error: 'Gagal menyimpan data ke database' });
  }
});

// 3. PUT /api/stos/:kode_sto -> Edit STO (edit nama wilayah & witel)
app.put('/api/stos/:kode_sto', async (req, res) => {
  const { kode_sto } = req.params;
  const { nama_wilayah, witel } = req.body;

  if (!nama_wilayah) {
    return res.status(400).json({ error: 'Nama Wilayah wajib diisi' });
  }

  const finalWitel = witel ? witel.toUpperCase() : 'LAINNYA';

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'UPDATE sto_mapping SET nama_wilayah = ?, witel = ? WHERE kode_sto = ?',
      [nama_wilayah.toUpperCase(), finalWitel, kode_sto.toUpperCase()]
    );
    
    connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kode STO tidak ditemukan' });
    }

    res.json({ message: 'STO berhasil diupdate' });
  } catch (error) {
    console.error('Error updating STO:', error);
    res.status(500).json({ error: 'Gagal mengupdate data di database' });
  }
});

// 4. DELETE /api/stos/:kode_sto -> Hapus STO
app.delete('/api/stos/:kode_sto', async (req, res) => {
  const { kode_sto } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'DELETE FROM sto_mapping WHERE kode_sto = ?',
      [kode_sto.toUpperCase()]
    );
    
    connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kode STO tidak ditemukan' });
    }

    res.json({ message: 'STO berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting STO:', error);
    res.status(500).json({ error: 'Gagal menghapus data dari database' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend Server berjalan di http://localhost:${PORT}`);
});
