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

const router = express.Router();

// 1. GET /stos -> Ambil semua daftar STO
router.get('/stos', async (req, res) => {
  try {
    const result = await db.execute('SELECT kode_sto, nama_wilayah, witel FROM sto_mapping ORDER BY nama_wilayah ASC, kode_sto ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching STOs:', error);
    res.status(500).json({ error: 'Gagal mengambil data dari database', details: error.message });
  }
});

// 2. POST /stos -> Tambah STO baru
router.post('/stos', async (req, res) => {
  const { kode_sto, nama_wilayah, witel } = req.body;

  if (!kode_sto || !nama_wilayah) {
    return res.status(400).json({ error: 'Kode STO dan Nama Wilayah wajib diisi' });
  }

  const finalWitel = witel ? witel.toUpperCase() : 'LAINNYA';

  try {
    const existing = await db.execute({
      sql: 'SELECT id FROM sto_mapping WHERE kode_sto = ?',
      args: [kode_sto.toUpperCase()]
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Kode STO sudah terdaftar' });
    }

    await db.execute({
      sql: 'INSERT INTO sto_mapping (kode_sto, nama_wilayah, witel) VALUES (?, ?, ?)',
      args: [kode_sto.toUpperCase(), nama_wilayah.toUpperCase(), finalWitel]
    });

    res.status(201).json({ message: 'STO berhasil ditambahkan' });
  } catch (error) {
    console.error('Error inserting STO:', error);
    res.status(500).json({ error: 'Gagal menyimpan data ke database', details: error.message });
  }
});

// 3. PUT /stos/:kode_sto -> Edit STO
router.put('/stos/:kode_sto', async (req, res) => {
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
    res.status(500).json({ error: 'Gagal mengupdate data di database', details: error.message });
  }
});

// 4. DELETE /stos/:kode_sto -> Hapus STO
router.delete('/stos/:kode_sto', async (req, res) => {
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
    res.status(500).json({ error: 'Gagal menghapus data dari database', details: error.message });
  }
});

// Mounting router ke /api dan root agar kompatibel dengan semua Vercel rewrite
app.use('/api', router);
app.use('/', router);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend Server berjalan di http://localhost:${PORT}`);
  });
}

export default app;
