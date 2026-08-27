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

  // Header tidak mungkin sepanjang baris data order
  if (clean.length > 50) {
    return null;
  }

  for (const orderType of ORDER_TYPES_LIST) {
    const target = orderType.toUpperCase();
    if (clean === target) {
      return orderType;
    }
  }

  // Pencocokan ketat untuk kata kunci spesifik
  if (clean === 'PENGAJUAN JT' || clean === 'JT PWT') {
    return 'Pengajuan JT PWT & Magelang';
  }
  if (clean === 'IHLD' || clean === 'ORDER IHLD' || clean === 'IHLD ON GOING') {
    return 'ORDER IHLD ON GOING';
  }
  if (clean === 'WMS AP BARU' || clean === 'ORDER WMS AP BARU' || clean === 'WMS DENGAN AP BARU') {
    return 'ORDER WMS DENGAN AP BARU';
  }
  if (clean === 'AREA LAIN' || clean === 'AM INTERNAL') {
    return 'ORDER AREA LAIN (MILIK AM INTERNAL)';
  }
  if (clean === 'PSB' || clean === 'ORDER PSB') {
    return 'ORDER PSB';
  }
  if (clean === 'DO' || clean === 'ORDER DO') {
    return 'ORDER DO';
  }
  if (clean === 'MO' || clean === 'ORDER MO') {
    return 'ORDER MO';
  }
  if (clean === 'DIGITAL' || clean === 'ORDER DIGITAL') {
    return 'ORDER DIGITAL';
  }
  if (clean === 'OBL' || clean === 'ORDER OBL') {
    return 'ORDER OBL';
  }

  return null;
}
