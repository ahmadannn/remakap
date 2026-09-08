import express from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

let db = null;
let dbInitError = null;

function getDbClient() {
  if (db) return db;

  try {
    let dbUrl = process.env.TURSO_DATABASE_URL || 'file:database.sqlite';
    const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

    // Jika di Vercel/Cloud dan URL menggunakan libsql://, ubah ke https:// agar kompatibel penuh dengan HTTP Serverless
    if (dbUrl.startsWith('libsql://')) {
      dbUrl = dbUrl.replace('libsql://', 'https://');
    }

    db = createClient({
      url: dbUrl,
      authToken: authToken,
    });
    return db;
  } catch (err) {
    dbInitError = err.message || String(err);
    console.error('Failed to create LibSQL client:', err);
    return null;
  }
}

const router = express.Router();

// Test Endpoint untuk cek status Environment Variable Vercel
router.get('/test', (req, res) => {
  const client = getDbClient();
  res.json({
    status: 'ok',
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    tursoUrlPreview: process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.substring(0, 20) + '...' : 'NOT_SET',
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    dbClientCreated: !!client,
    dbInitError: dbInitError
  });
});

// 1. GET /stos -> Ambil semua daftar STO
router.get('/stos', async (req, res) => {
  try {
    const client = getDbClient();
    if (!client) {
      return res.status(500).json({ 
        error: 'Database client gagal terinisialisasi', 
        details: dbInitError,
        hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
        hasTursoToken: !!process.env.TURSO_AUTH_TOKEN
      });
    }

    const result = await client.execute('SELECT kode_sto, nama_wilayah, witel FROM sto_mapping ORDER BY nama_wilayah ASC, kode_sto ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching STOs:', error);
    res.status(500).json({ 
      error: 'Gagal mengambil data dari database', 
      message: error.message,
      stack: error.stack,
      hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
      hasTursoToken: !!process.env.TURSO_AUTH_TOKEN
    });
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
    const client = getDbClient();
    if (!client) throw new Error('Database client gagal terinisialisasi: ' + dbInitError);

    const existing = await client.execute({
      sql: 'SELECT id FROM sto_mapping WHERE kode_sto = ?',
      args: [kode_sto.toUpperCase()]
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Kode STO sudah terdaftar' });
    }

    await client.execute({
      sql: 'INSERT INTO sto_mapping (kode_sto, nama_wilayah, witel) VALUES (?, ?, ?)',
      args: [kode_sto.toUpperCase(), nama_wilayah.toUpperCase(), finalWitel]
    });

    res.status(201).json({ message: 'STO berhasil ditambahkan' });
  } catch (error) {
    console.error('Error inserting STO:', error);
    res.status(500).json({ error: 'Gagal menyimpan data ke database', message: error.message });
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
    const client = getDbClient();
    if (!client) throw new Error('Database client gagal terinisialisasi: ' + dbInitError);

    const result = await client.execute({
      sql: 'UPDATE sto_mapping SET nama_wilayah = ?, witel = ? WHERE kode_sto = ?',
      args: [nama_wilayah.toUpperCase(), finalWitel, kode_sto.toUpperCase()]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Kode STO tidak ditemukan' });
    }

    res.json({ message: 'STO berhasil diupdate' });
  } catch (error) {
    console.error('Error updating STO:', error);
    res.status(500).json({ error: 'Gagal mengupdate data di database', message: error.message });
  }
});

// 4. DELETE /stos/:kode_sto -> Hapus STO
router.delete('/stos/:kode_sto', async (req, res) => {
  const { kode_sto } = req.params;

  try {
    const client = getDbClient();
    if (!client) throw new Error('Database client gagal terinisialisasi: ' + dbInitError);

    const result = await client.execute({
      sql: 'DELETE FROM sto_mapping WHERE kode_sto = ?',
      args: [kode_sto.toUpperCase()]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Kode STO tidak ditemukan' });
    }

    res.json({ message: 'STO berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting STO:', error);
    res.status(500).json({ error: 'Gagal menghapus data dari database', message: error.message });
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
