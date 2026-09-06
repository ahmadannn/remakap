import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi & Inisialisasi Database SQLite
const dbPath = path.resolve('database.sqlite');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Cek & Inisialisasi Skema Database secara Otomatis
function initDatabase() {
  try {
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sto_mapping'").get();
    if (!tableCheck && fs.existsSync('database.sql')) {
      console.log('📦 Menginisialisasi tabel database dari database.sql...');
      const sqlScript = fs.readFileSync('database.sql', 'utf8');
      db.exec(sqlScript);
      console.log('✅ Skema database & data awal berhasil dibuat di database.sqlite');
    } else {
      console.log('✅ Berhasil terhubung ke database SQLite (database.sqlite)');
    }
  } catch (error) {
    console.error('❌ Gagal menginisialisasi database SQLite:', error.message);
  }
}
initDatabase();

// ==========================================
// ENDPOINT API
// ==========================================

// 1. GET /api/stos -> Ambil semua daftar STO
app.get('/api/stos', (req, res) => {
  try {
    const rows = db.prepare('SELECT kode_sto, nama_wilayah, witel FROM sto_mapping ORDER BY nama_wilayah ASC, kode_sto ASC').all();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching STOs:', error);
    res.status(500).json({ error: 'Gagal mengambil data dari database' });
  }
});

// 2. POST /api/stos -> Tambah STO baru
app.post('/api/stos', (req, res) => {
  const { kode_sto, nama_wilayah, witel } = req.body;

  if (!kode_sto || !nama_wilayah) {
    return res.status(400).json({ error: 'Kode STO dan Nama Wilayah wajib diisi' });
  }

  const finalWitel = witel ? witel.toUpperCase() : 'LAINNYA';

  try {
    // Cek apakah kode STO sudah ada
    const existing = db.prepare('SELECT id FROM sto_mapping WHERE kode_sto = ?').get(kode_sto.toUpperCase());
    if (existing) {
      return res.status(409).json({ error: 'Kode STO sudah terdaftar' });
    }

    // Insert ke database
    db.prepare('INSERT INTO sto_mapping (kode_sto, nama_wilayah, witel) VALUES (?, ?, ?)').run(
      kode_sto.toUpperCase(),
      nama_wilayah.toUpperCase(),
      finalWitel
    );

    res.status(201).json({ message: 'STO berhasil ditambahkan' });
  } catch (error) {
    console.error('Error inserting STO:', error);
    res.status(500).json({ error: 'Gagal menyimpan data ke database' });
  }
});

// 3. PUT /api/stos/:kode_sto -> Edit STO (edit nama wilayah & witel)
app.put('/api/stos/:kode_sto', (req, res) => {
  const { kode_sto } = req.params;
  const { nama_wilayah, witel } = req.body;

  if (!nama_wilayah) {
    return res.status(400).json({ error: 'Nama Wilayah wajib diisi' });
  }

  const finalWitel = witel ? witel.toUpperCase() : 'LAINNYA';

  try {
    const result = db.prepare(
      'UPDATE sto_mapping SET nama_wilayah = ?, witel = ? WHERE kode_sto = ?'
    ).run(nama_wilayah.toUpperCase(), finalWitel, kode_sto.toUpperCase());

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Kode STO tidak ditemukan' });
    }

    res.json({ message: 'STO berhasil diupdate' });
  } catch (error) {
    console.error('Error updating STO:', error);
    res.status(500).json({ error: 'Gagal mengupdate data di database' });
  }
});

// 4. DELETE /api/stos/:kode_sto -> Hapus STO
app.delete('/api/stos/:kode_sto', (req, res) => {
  const { kode_sto } = req.params;

  try {
    const result = db.prepare(
      'DELETE FROM sto_mapping WHERE kode_sto = ?'
    ).run(kode_sto.toUpperCase());

    if (result.changes === 0) {
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
