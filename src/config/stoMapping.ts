/**
 * ============================================================================
 * KONFIGURASI MAPPING STO (SENTRAL TELEPON OTOMATIS) / WILAYAH
 * ============================================================================
 * 
 * PANDUAN PENGGUNAAN UNTUK PENGGUNA / INTERN:
 * 1. File ini adalah tempat pendaftaran kode STO ke nama Wilayah / Daerah.
 * 2. Format: "KODE_STO": "NAMA_WILAYAH" (Gunakan huruf KAPITAL untuk kode STO).
 * 3. Anda bebas menambah, mengubah, atau menghapus mapping di bawah ini.
 * 4. Aplikasi akan otomatis mendeteksi dan menggunakan mapping terbaru dari file ini.
 * 5. Jika sebuah STO belum terdaftar di sini, aplikasi TIDAK akan menebaknya
 *    dan akan menampilkannya sebagai "STO BELUM TERDAFTAR" pada halaman web.
 */

export const STO_MAPPING: Record<string, string> = {
  // --- WITEL PURWOKERTO & SEKITARNYA ---
  "PWT": "PURWOKERTO",
  "BYM": "PURWOKERTO", // BANYUMAS
  "CLO": "PURWOKERTO", // CILONGOK
  "KRY": "PURWOKERTO", // KROYA / PURWOKERTO
  "SDJ": "PURWOKERTO", // SIDAREJA / PURWOKERTO
  "SUK": "SOKARAJA",
  "AJB": "AJIBARANG",
  "BBL": "BUMIAYU",
  "BJR": "BANJARNEGARA",
  "BNA": "BANJARNEGARA",
  "PBG": "PURBALINGGA",
  "BBT": "PURBALINGGA",
  "CIL": "CILACAP",
  "CLC": "CILACAP",
  "MAN": "CILACAP",
  "MAO": "CILACAP",
  "KJA": "KROYA",
  "MJN": "MAJENANG",
  "SDA": "SIDAREJA",
  "WOS": "WONOSOBO", // WONOSOBO (AREA PURWOKERTO)
  "WNS": "WONOSOBO", // WONOSOBO (AREA PURWOKERTO)

  // --- WITEL MAGELANG & SEKITARNYA ---
  "MAG": "MAGELANG",
  "PRN": "MAGELANG", // PRINGSURAT / MAGELANG
  "KTW": "MAGELANG", // KUTOARJO / KUTOWINANGUN / MAGELANG
  "SWT": "MAGELANG", // SAWITAN
  "GOM": "MAGELANG", // GOMBONG
  "MTY": "MAGELANG", // MERTOYUDAN
  "TEM": "MAGELANG", // TEMANGGUNG
  "TMG": "TEMANGGUNG", // TEMANGGUNG
  "MUN": "MAGELANG", // MUNTILAN
  "MTP": "MUNTILAN", // MUNTILAN
  "KTA": "MAGELANG", // KUTOARJO
  "PWJ": "PURWOREJO", // PURWOREJO (AREA MAGELANG)
  "PWR": "PURWOREJO", // PURWOREJO (AREA MAGELANG)
  "KEB": "KEBUMEN",

  // --- WILAYAH JAWA TENGAH & LAINNYA ---
  "PKL": "PEKALONGAN",
  "BTG": "BATANG",
  "TGL": "TEGAL",
  "SLW": "SLAWI",
  "BRB": "BREBES",
  "BBS": "BREBES",
  "KTG": "KETANGGUNGAN",
  "PML": "PEMALANG",
  "SMG": "SEMARANG",
  "SLO": "SOLO",
  "KLT": "KLATEN",
  "BYL": "BOYOLALI",
  "SKH": "SUKOHARJO",
  "WNG": "WONOGIRI",
  "KRN": "KARANGANYAR",
  "SRG": "SRAGEN",
  "KDS": "KUDUS",
  "PTI": "PATI",
  "JPR": "JEPARA",
  "RBG": "REMBANG",
  "BLA": "BLORA",
  "CPT": "CEPU",
  "SLT": "SALATIGA",
  "UNG": "UNGARAN",
  "AMB": "AMBARAWA",
  "KDL": "KENDAL",
  "WLR": "WELERI",
  "PWD": "PURWODADI",
  
  // --- KOTA BESAR LAINNYA ---
  "JKT": "JAKARTA",
  "BDG": "BANDUNG",
  "SBY": "SURABAYA",
  "YGY": "YOGYAKARTA",
};

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
export function getAllRegisteredStos(): Array<{ code: string; region: string }> {
  return Object.entries(STO_MAPPING).map(([code, region]) => ({
    code,
    region,
  }));
}
