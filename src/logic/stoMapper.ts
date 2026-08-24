import { STO_MAPPING } from '../config/stoMapping';

export interface StoLookupResult {
  code: string;
  region: string | null;
  isRegistered: boolean;
}

/**
 * Mencari mapping wilayah berdasarkan kode STO.
 * PENTING: Jika STO tidak terdaftar, JANGAN menebak wilayah.
 * Kembalikan isRegistered = false dan region = null.
 */
export function lookupSto(rawStoCode: string): StoLookupResult {
  if (!rawStoCode) {
    return {
      code: '',
      region: null,
      isRegistered: false,
    };
  }

  // Normalisasi: trim whitespace, hilangkan simbol yang tidak perlu, ubah ke uppercase
  const cleanCode = rawStoCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (!cleanCode) {
    return {
      code: rawStoCode.trim().toUpperCase(),
      region: null,
      isRegistered: false,
    };
  }

  // Cek langsung pada STO_MAPPING
  if (Object.prototype.hasOwnProperty.call(STO_MAPPING, cleanCode)) {
    return {
      code: cleanCode,
      region: STO_MAPPING[cleanCode],
      isRegistered: true,
    };
  }

  // Cek case-insensitive fallback pada keys
  const matchedKey = Object.keys(STO_MAPPING).find(
    (key) => key.toUpperCase() === cleanCode
  );

  if (matchedKey) {
    return {
      code: matchedKey,
      region: STO_MAPPING[matchedKey],
      isRegistered: true,
    };
  }

  // Jika kode STO berupa singkatan STO umum luar area (misal JKT, BDG, SBY, dll),
  // atau STO lain yang tidak termasuk Purwokerto/Magelang:
  // Catatan: Jika ada di STO_MAPPING, akan dipakai mappingnya.
  // Jika tidak ditemukan di STO_MAPPING, tandai sebagai belum terdaftar.
  return {
    code: cleanCode,
    region: null,
    isRegistered: false,
  };
}
