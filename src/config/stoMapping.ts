
export let STO_MAPPING: Record<string, string> = {};
export let FULL_STO_DATA: Array<{ code: string; region: string; witel: string }> = [];

/**
 * Fetch data STO dari backend XAMPP (Express)
 */
export async function fetchStoMapping(): Promise<void> {
  try {
    const res = await fetch('http://localhost:5000/api/stos');
    if (!res.ok) throw new Error('Gagal mengambil data dari server');
    const rows = await res.json();
    
    const mapping: Record<string, string> = {};
    const fullData: Array<{ code: string; region: string; witel: string }> = [];
    // Bersihkan Set witel agar sepenuhnya dinamis berdasarkan data dari database
    PURWOKERTO_REGIONS.clear();
    MAGELANG_REGIONS.clear();
    
    rows.forEach((row: any) => {
      mapping[row.kode_sto] = row.nama_wilayah;
      fullData.push({ code: row.kode_sto, region: row.nama_wilayah, witel: row.witel });
      
      // Dinamis masukkan ke Set Witel jika witel didefinisikan
      if (row.witel === 'PURWOKERTO') {
        PURWOKERTO_REGIONS.add(row.nama_wilayah);
      } else if (row.witel === 'MAGELANG') {
        MAGELANG_REGIONS.add(row.nama_wilayah);
      }
    });

    STO_MAPPING = mapping;
    FULL_STO_DATA = fullData;
  } catch (error) {
    console.error('Error fetching STO Mapping:', error);
    // Fallback kosong atau bisa berikan notifikasi
  }
}

/**
 * Menambahkan STO baru ke backend XAMPP (Express)
 */
export async function addStoMapping(kodeSto: string, namaWilayah: string, witel?: string): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:5000/api/stos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kode_sto: kodeSto, nama_wilayah: namaWilayah, witel })
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menambahkan STO');
    }
    
    // Refresh data setelah berhasil nambah
    await fetchStoMapping();
    return true;
  } catch (error) {
    console.error('Error adding STO:', error);
    throw error;
  }
}

/**
 * Mengubah STO yang ada di backend XAMPP (Express)
 */
export async function updateStoMapping(kodeSto: string, namaWilayah: string, witel?: string): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:5000/api/stos/${kodeSto}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama_wilayah: namaWilayah, witel })
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal mengubah STO');
    }
    
    await fetchStoMapping();
    return true;
  } catch (error) {
    console.error('Error updating STO:', error);
    throw error;
  }
}

/**
 * Menghapus STO dari backend XAMPP (Express)
 */
export async function deleteStoMapping(kodeSto: string): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:5000/api/stos/${kodeSto}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menghapus STO');
    }
    
    await fetchStoMapping();
    return true;
  } catch (error) {
    console.error('Error deleting STO:', error);
    throw error;
  }
}

/**
 * Daftar region yang termasuk ke dalam Witel Purwokerto
 */
export const PURWOKERTO_REGIONS = new Set([
  "PURWOKERTO",
  "BANJARNEGARA",
  "PURBALINGGA",
  "CILACAP",
  "SOKARAJA",
  "AJIBARANG",
  "KROYA",
  "MAJENANG",
  "SIDAREJA",
  "BUMIAYU",
  "WONOSOBO"
]);

/**
 * Daftar region yang termasuk ke dalam Witel Magelang
 */
export const MAGELANG_REGIONS = new Set([
  "MAGELANG",
  "TEMANGGUNG",
  "KEBUMEN",
  "GOMBONG",
  "PURWOREJO",
  "KUTOARJO",
  "MUNTILAN"
]);

/**
 * Menentukan urutan prioritas wilayah di laporan:
 * 1. PURWOKERTO (paling atas)
 * 2. Daerah lain di bawah lingkup Purwokerto (Banjarnegara, Cilacap, Purbalingga, Sokaraja, Kroya, dll)
 * 3. MAGELANG
 * 4. Daerah lain di bawah lingkup Magelang (Kebumen, Temanggung, Wonosobo, Muntilan, Purworejo, dll)
 * 5. Wilayah luar / lainnya
 */
export function sortRegionsByHierarchy(regionNames: string[]): string[] {
  return [...regionNames].sort((a, b) => {
    const getPriority = (name: string): number => {
      if (name === 'PURWOKERTO') return 1;
      if (PURWOKERTO_REGIONS.has(name)) return 2;
      if (name === 'MAGELANG') return 3;
      if (MAGELANG_REGIONS.has(name)) return 4;
      return 5;
    };

    const pA = getPriority(a);
    const pB = getPriority(b);

    if (pA !== pB) {
      return pA - pB;
    }
    // Jika dalam kategori prioritas yang sama, urutkan alfabetis
    return a.localeCompare(b);
  });
}

/**
 * Menentukan nama Witel / Kategori Area Utama untuk Header Laporan:
 * - [PURWOKERTO] jika seluruh region ada di lingkup Purwokerto
 * - [MAGELANG] jika seluruh region ada di lingkup Magelang
 * - [AREA LAIN] jika di luar keduanya (misal Jakarta, Surabaya, dll atau STO tak dikenal)
 */
export function getHeaderAreaTitle(regionNames: string[], hasUnmapped: boolean): string {
  if (regionNames.length === 0 && hasUnmapped) {
    return "[AREA LAIN]";
  }
  if (regionNames.length === 0 && !hasUnmapped) {
    return "[LAPORAN]";
  }

  const isAllPurwokerto = regionNames.every(r => PURWOKERTO_REGIONS.has(r)) && !hasUnmapped;
  if (isAllPurwokerto) {
    return "[PURWOKERTO]";
  }

  const isAllMagelang = regionNames.every(r => MAGELANG_REGIONS.has(r)) && !hasUnmapped;
  if (isAllMagelang) {
    return "[MAGELANG]";
  }

  const hasPwt = regionNames.some(r => PURWOKERTO_REGIONS.has(r));
  const hasMag = regionNames.some(r => MAGELANG_REGIONS.has(r));
  const hasOther = regionNames.some(r => !PURWOKERTO_REGIONS.has(r) && !MAGELANG_REGIONS.has(r)) || hasUnmapped;

  if (hasPwt && !hasMag && !hasOther) return "[PURWOKERTO]";
  if (hasMag && !hasPwt && !hasOther) return "[MAGELANG]";
  if (!hasPwt && !hasMag && hasOther) return "[AREA LAIN]";
  if (hasPwt && hasMag && !hasOther) return "[PURWOKERTO & MAGELANG]";
  if (hasPwt && hasOther) return "[PURWOKERTO & AREA LAIN]";
  if (hasMag && hasOther) return "[MAGELANG & AREA LAIN]";

  return `[${regionNames.join(' & ')}]`;
}

/**
 * Helper untuk mendapatkan daftar seluruh STO yang terdaftar
 */
export function getAllRegisteredStos(): Array<{ code: string; region: string; witel?: string }> {
  if (FULL_STO_DATA && FULL_STO_DATA.length > 0) {
    return FULL_STO_DATA;
  }
  return Object.entries(STO_MAPPING).map(([code, region]) => ({
    code,
    region,
    witel: 'LAINNYA'
  }));
}
