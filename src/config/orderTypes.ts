/**
 * ============================================================================
 * KONFIGURASI JENIS ORDER (ORDER TYPES)
 * ============================================================================
 * 
 * Urutan tetap jenis order yang didukung aplikasi:
 * 1. ORDER PSB
 * 2. ORDER DO
 * 3. ORDER MO
 * 4. ORDER IHLD ON GOING
 * 5. Pengajuan JT PWT & Magelang
 * 6. ORDER DIGITAL
 * 7. ORDER OBL
 * 8. ORDER WMS DENGAN AP BARU
 * 9. ORDER AREA LAIN (MILIK AM INTERNAL)
 */

export const ORDER_TYPES_LIST = [
  'ORDER PSB',
  'ORDER DO',
  'ORDER MO',
  'ORDER IHLD ON GOING',
  'Pengajuan JT PWT & Magelang',
  'ORDER DIGITAL',
  'ORDER OBL',
  'ORDER WMS DENGAN AP BARU',
  'ORDER AREA LAIN (MILIK AM INTERNAL)',
] as const;

export type OrderType = (typeof ORDER_TYPES_LIST)[number];

/**
 * Urutkan jenis order terpilih berdasarkan urutan standar aplikasi (bukan urutan klik pengguna).
 */
export function sortSelectedOrderTypes(selected: string[]): string[] {
  const selectedSet = new Set(selected.map(s => s.trim().toUpperCase()));
  const result: string[] = [];

  for (const standardType of ORDER_TYPES_LIST) {
    if (selectedSet.has(standardType.toUpperCase())) {
      result.push(standardType);
    }
  }

  // Jika ada custom type yang tidak ada di list standar
  for (const s of selected) {
    if (!result.includes(s) && !ORDER_TYPES_LIST.some(ot => ot.toUpperCase() === s.toUpperCase())) {
      result.push(s);
    }
  }

  return result.length > 0 ? result : [ORDER_TYPES_LIST[0]];
}

/**
 * Deteksi apakah sebuah baris teks merupakan penanda header jenis order,
 * misal: "(ORDER PSB)", "=ORDER DO=", "[ORDER MO]", "ORDER PSB", dsb.
 */
export function matchOrderTypeHeader(line: string): string | null {
  const clean = line.trim().replace(/^[\(\[\{=\-\*\#\s]+|[\)\]\}=\-\*\#\s]+$/g, '').trim().toUpperCase();

  for (const orderType of ORDER_TYPES_LIST) {
    const target = orderType.toUpperCase();
    if (clean === target) {
      return orderType;
    }
  }

  // Cek jika baris diawali kata kunci spesifik
  if (clean.includes('PENGAJUAN JT') || clean.includes('JT PWT')) {
    return 'Pengajuan JT PWT & Magelang';
  }
  if (clean.includes('IHLD')) {
    return 'ORDER IHLD ON GOING';
  }
  if (clean.includes('WMS') && (clean.includes('AP BARU') || clean.includes('AP'))) {
    return 'ORDER WMS DENGAN AP BARU';
  }
  if (clean.includes('AREA LAIN') || clean.includes('AM INTERNAL')) {
    return 'ORDER AREA LAIN (MILIK AM INTERNAL)';
  }
  if (clean === 'PSB' || clean.startsWith('ORDER PSB')) {
    return 'ORDER PSB';
  }
  if (clean === 'DO' || clean.startsWith('ORDER DO')) {
    return 'ORDER DO';
  }
  if (clean === 'MO' || clean.startsWith('ORDER MO')) {
    return 'ORDER MO';
  }
  if (clean === 'DIGITAL' || clean.startsWith('ORDER DIGITAL')) {
    return 'ORDER DIGITAL';
  }
  if (clean === 'OBL' || clean.startsWith('ORDER OBL')) {
    return 'ORDER OBL';
  }

  return null;
}
