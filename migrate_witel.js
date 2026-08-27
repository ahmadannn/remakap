import mysql from 'mysql2/promise';

const PURWOKERTO_REGIONS = new Set([
  "PURWOKERTO", "BANJARNEGARA", "PURBALINGGA", "CILACAP", "SOKARAJA",
  "AJIBARANG", "KROYA", "MAJENANG", "SIDAREJA", "BUMIAYU", "WONOSOBO"
]);

const MAGELANG_REGIONS = new Set([
  "MAGELANG", "TEMANGGUNG", "KEBUMEN", "GOMBONG",
  "PURWOREJO", "KUTOARJO", "MUNTILAN"
]);

async function migrateWitel() {
  const dbConfig = { host: 'localhost', user: 'root', password: '', database: 'remakap_db' };
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT id, nama_wilayah, witel FROM sto_mapping');
    
    for (const row of rows) {
      if (!row.witel || row.witel === 'LAINNYA') {
        let newWitel = 'LAINNYA';
        if (PURWOKERTO_REGIONS.has(row.nama_wilayah)) {
          newWitel = 'PURWOKERTO';
        } else if (MAGELANG_REGIONS.has(row.nama_wilayah)) {
          newWitel = 'MAGELANG';
        }
        
        if (newWitel !== 'LAINNYA') {
          await connection.execute('UPDATE sto_mapping SET witel = ? WHERE id = ?', [newWitel, row.id]);
          console.log(`Updated ${row.nama_wilayah} to ${newWitel}`);
        }
      }
    }
    
    console.log('Migration complete.');
    connection.end();
  } catch (err) {
    console.error(err);
  }
}
migrateWitel();
