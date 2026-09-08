import express from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi Database Turso (Cloud) / Local Fallback
const dbUrl = process.env.TURSO_DATABASE_URL || 'file:database.sqlite';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

const db = createClient({
  url: dbUrl,
  authToken: authToken,
});

// ==========================================
// ENDPOINT API
// ==========================================

// 1. GET /api/stos -> Ambil semua daftar STO
app.get('/api/stos', async (req, res) => {
  try {
    const result = await db.execute('SELECT kode_sto, nama_wilayah, witel FROM sto_mapping ORDER BY nama_wilayah ASC, kode_sto ASC');
    res.json(result.rows);
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
    // Cek apakah kode STO sudah ada
    const existing = await db.execute({
      sql: 'SELECT id FROM sto_mapping WHERE kode_sto = ?',
      args: [kode_sto.toUpperCase()]
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Kode STO sudah terdaftar' });
    }

    // Insert ke database
    await db.execute({
      sql: 'INSERT INTO sto_mapping (kode_sto, nama_wilayah, witel) VALUES (?, ?, ?)',
      args: [kode_sto.toUpperCase(), nama_wilayah.toUpperCase(), finalWitel]
    });

    res.status(201).json({ message: 'STO berhasil ditambahkan' });
  } catch (error) {
    console.error('Error inserting STO:', error);
    res.status(500).json({ error: 'Gagal menyimpan data ke database' });
  }
});

// 3. PUT /api/stos/:kode_sto -> Edit STO
app.put('/api/stos/:kode_sto', async (req, res) => {
  const { kode_sto } = req.params;
  const { nama_wilayah, witel } = req.body;

  if (!nama_wilayah) {
    return res.status(400).json({ error: 'Nama Wilayah wajib diisi' });
  }

  const finalWitel = witel ? witel.toUpperCase() : 'LAINNYA';

  try {
    const result = await db.execute({
      sql: 'UPDATE sto_mapping SET nama_wilayah = ?, witel = ? WHERE kode_sto = ?',
      args: [nama_wilayah.toUpperCase(), finalWitel, kode_sto.toUpperCase()]
    });

    if (result.rowsAffected === 0) {
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
    const result = await db.execute({
      sql: 'DELETE FROM sto_mapping WHERE kode_sto = ?',
      args: [kode_sto.toUpperCase()]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Kode STO tidak ditemukan' });
    }

    res.json({ message: 'STO berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting STO:', error);
    res.status(500).json({ error: 'Gagal menghapus data dari database' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend Server berjalan di http://localhost:${PORT}`);
  });
}

export default app;
