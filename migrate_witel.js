import Database from 'better-sqlite3';
import path from 'path';

const PURWOKERTO_REGIONS = new Set([
  "PURWOKERTO", "BANJARNEGARA", "PURBALINGGA", "CILACAP", "SOKARAJA",
  "AJIBARANG", "KROYA", "MAJENANG", "SIDAREJA", "BUMIAYU", "WONOSOBO"
]);

const MAGELANG_REGIONS = new Set([
  "MAGELANG", "TEMANGGUNG", "KEBUMEN", "GOMBONG",
  "PURWOREJO", "KUTOARJO", "MUNTILAN"
]);

function migrateWitel() {
  const dbPath = path.resolve('database.sqlite');
  try {
    const db = new Database(dbPath);
    const rows = db.prepare('SELECT id, nama_wilayah, witel FROM sto_mapping').all();
    
    const updateStmt = db.prepare('UPDATE sto_mapping SET witel = ? WHERE id = ?');

    for (const row of rows) {
      if (!row.witel || row.witel === 'LAINNYA') {
        let newWitel = 'LAINNYA';
        if (PURWOKERTO_REGIONS.has(row.nama_wilayah)) {
          newWitel = 'PURWOKERTO';
        } else if (MAGELANG_REGIONS.has(row.nama_wilayah)) {
          newWitel = 'MAGELANG';
        }
        
        if (newWitel !== 'LAINNYA') {
          updateStmt.run(newWitel, row.id);
          console.log(`Updated ${row.nama_wilayah} to ${newWitel}`);
        }
      }
    }
    
    console.log('Migration complete.');
    db.close();
  } catch (err) {
    console.error(err);
  }
}
migrateWitel();
