import { ParsedOrderRow } from '../types';
import { lookupSto } from './stoMapper';
import { STO_MAPPING } from '../config/stoMapping';
import { matchOrderTypeHeader, sortSelectedOrderTypes } from '../config/orderTypes';

/**
 * Membersihkan semua jenis tanda kutip (kutip ganda, tunggal, curly quotes Excel, escaped quotes).
 */
export function cleanQuotes(text: string): string {
  if (!text) return '';
  return text
    // Hapus tanda kutip umum dan curly quotes dari Excel / Word
    .replace(/["“”‘’«»`]/g, '')
    // Hapus tanda kutip yang di-escape seperti \" atau \'
    .replace(/\\['"]/g, '')
    .trim();
}

/**
 * Parser untuk membaca dan mengekstrak data order dari output copy-paste Excel.
 * 
 * Mendukung:
 * 1. Multi-kolom Excel (Tab-separated `\t` atau baris ber-tanda kutip)
 * 2. Baris dengan STO di awal kalimat (misal: "BJR PT MANDIRI UTAMA FINANCE...")
 * 3. Baris hasil rumus Excel (pemisah `|`, `-`, `/`, koma, spasi)
 * 4. Otomatis membersihkan tanda kutip pembungkus dari Excel
 * 5. Deteksi pembagian section per jenis order (contoh: "(ORDER PSB)", "(ORDER DO)", dll)
 */
export function parseExcelOutput(
  rawInput: string,
  selectedOrderTypes: string[] = ['ORDER PSB']
): ParsedOrderRow[] {
  if (!rawInput || !rawInput.trim()) {
    return [];
  }

  const sortedTypes = sortSelectedOrderTypes(selectedOrderTypes);
  const defaultOrderType = sortedTypes[0] || 'ORDER PSB';
  let currentOrderType = defaultOrderType;

  const rawLines = rawInput.split(/\r?\n/);
  const parsedRows: ParsedOrderRow[] = [];
  const knownStoCodes = Object.keys(STO_MAPPING);

  let rowCounter = 1;

  for (const rawLine of rawLines) {
    // 1. Bersihkan tanda kutip dan whitespace di seluruh baris
    const trimmedLine = rawLine.trim();
    if (!trimmedLine) continue;

    // Bersihkan tanda kutip pada baris asli
    const cleanLine = cleanQuotes(trimmedLine);
    if (!cleanLine) continue;

    // 2. Cek apakah baris ini adalah penanda jenis order (misal "(ORDER PSB)", "(ORDER DO)", "(ORDER MO)")
    const matchedType = matchOrderTypeHeader(cleanLine);
    if (matchedType) {
      currentOrderType = matchedType;
      continue; // Lewati baris judul section jenis order
    }

    // Abaikan header tabel jika pengguna menyalin termasuk baris judul kolom Excel
    if (isHeaderRow(cleanLine)) {
      continue;
    }

    let detectedStoCode = '';
    let orderNumber = '';
    let status = '';
    let orderType = '';
    let keterangan = '';
    const extraColumns: string[] = [];

    // Pisahkan kolom berdasarkan Tab jika ada
    const hasTab = trimmedLine.includes('\t');
    const columns = hasTab
      ? trimmedLine.split('\t').map(c => cleanQuotes(c)).filter(c => c.length > 0)
      : [cleanLine];

    // Hapus nomor urut di awal baris jika ada (contoh: "1. PWT..." atau "2. BJR...")
    if (columns.length > 0) {
      columns[0] = columns[0].replace(/^\d+[\.\)]\s*/, '');
    }

    // =========================================================================
    // TAHAP 1: DETEKSI KODE STO (DENGAN PRIORITAS KODE TERDAFTAR DI stoMapping.ts)
    // =========================================================================

    // 1a. Cek apakah ada kolom yang isinya PERSIS kode STO terdaftar
    for (let i = 0; i < columns.length; i++) {
      const colClean = columns[i].toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (knownStoCodes.includes(colClean)) {
        detectedStoCode = colClean;
        break;
      }
    }

    // 1b. Cek kata pertama di setiap kolom (misal: "BJR PT MANDIRI..." -> kata pertama adalah "BJR")
    if (!detectedStoCode) {
      for (const col of columns) {
        const firstWordMatch = col.trim().match(/^([A-Za-z0-9]{2,5})\b/);
        if (firstWordMatch) {
          const firstWord = firstWordMatch[1].toUpperCase();
          if (knownStoCodes.includes(firstWord)) {
            detectedStoCode = firstWord;
            break;
          }
        }
      }
    }

    // 1c. Cek kata pertama di awal seluruh baris (misal: "BJR ..." atau "[BJR] ...")
    if (!detectedStoCode) {
      const lineStartMatch = cleanLine.replace(/^\d+[\.\)]\s*/, '').match(/^\[?([A-Za-z0-9]{2,5})\]?[\s\-:]/);
      if (lineStartMatch) {
        const candidate = lineStartMatch[1].toUpperCase();
        if (knownStoCodes.includes(candidate)) {
          detectedStoCode = candidate;
        }
      }
    }

    // 1d. Cari kemunculan kode STO terdaftar di mana saja dalam baris (word boundary)
    if (!detectedStoCode) {
      const words = cleanLine.split(/[\s,;|/()[\]{}=>:\t-]+/).filter(w => w.length >= 2 && w.length <= 5);
      for (const w of words) {
        const upperWord = w.toUpperCase();
        if (knownStoCodes.includes(upperWord)) {
          detectedStoCode = upperWord;
          break;
        }
      }
    }

    // 1e. Jika belum cocok dengan STO terdaftar, cari kandidat STO baru (untuk dilaporkan di STO Belum Terdaftar)
    if (!detectedStoCode) {
      // Prioritas 1: Kata pertama di kolom/baris jika berupa huruf kapital 2-5 huruf dan bukan kata umum
      const firstWordMatch = cleanLine.replace(/^\d+[\.\)]\s*/, '').match(/^([A-Za-z]{2,5})\b/);
      if (firstWordMatch && !isCommonStatusWord(firstWordMatch[1])) {
        detectedStoCode = firstWordMatch[1].toUpperCase();
      }

      // Prioritas 2: Kolom mandiri yang pendek (2-5 huruf)
      if (!detectedStoCode && columns.length > 1) {
        for (const col of columns) {
          const colClean = col.toUpperCase().replace(/[^A-Z0-9]/g, '');
          if (/^[A-Z]{2,5}$/.test(colClean) && !isCommonStatusWord(colClean)) {
            detectedStoCode = colClean;
            break;
          }
        }
      }

      // Prioritas 3: Kata dalam bracket [XYZ] atau (XYZ)
      if (!detectedStoCode) {
        const bracketMatch = cleanLine.match(/[\[\(]([A-Za-z]{2,5})[\]\)]/);
        if (bracketMatch && !isCommonStatusWord(bracketMatch[1])) {
          detectedStoCode = bracketMatch[1].toUpperCase();
        }
      }
    }

    // =========================================================================
    // TAHAP 2: EKSTRAKSI FIELD LAIN (NOMOR ORDER, STATUS, KETERANGAN)
    // =========================================================================
    if (columns.length > 1) {
      for (let i = 0; i < columns.length; i++) {
        const val = columns[i];
        const valClean = val.toUpperCase().replace(/[^A-Z0-9]/g, '');

        // Lewati jika kolom ini adalah STO yang sudah terdeteksi
        if (valClean === detectedStoCode) continue;

        if (!orderNumber && isLikelyOrderNumber(val)) {
          orderNumber = val;
        } else if (!status && isLikelyStatus(val)) {
          status = val;
        } else if (!orderType && isLikelyOrderType(val)) {
          orderType = val;
        } else if (!keterangan) {
          keterangan = val;
        } else {
          extraColumns.push(val);
        }
      }
    } else {
      // Dari teks tunggal, coba deteksi nomor order
      const numMatch = cleanLine.match(/\b(1\d{7,14}|[A-Z0-9-_]{6,20})\b/);
      if (numMatch) {
        orderNumber = numMatch[1];
      }
    }

    // Jika STO masih belum terdeteksi sama sekali, tandai UNKNOWN
    if (!detectedStoCode) {
      detectedStoCode = 'UNKNOWN';
    }

    const stoLookup = lookupSto(detectedStoCode);

    // Format rawLine yang bersih tanpa tab mentah atau tanda kutip
    const formattedCleanLine = columns.join(' - ');

    // Tentukan assignedOrderType untuk baris ini
    let rowOrderType = currentOrderType;
    // Jika ada lebih dari satu jenis order dipilih dan baris belum berada di bawah section spesifik,
    // cek apakah baris ini memuat kata kunci jenis order lain yang dipilih
    if (sortedTypes.length > 1) {
      for (const t of sortedTypes) {
        if (t === 'ORDER DO' && /\b(DO|DISMANTLE)\b/i.test(cleanLine)) {
          rowOrderType = 'ORDER DO';
          break;
        } else if (t === 'ORDER MO' && /\b(MO|MODIFY|MODIFIKASI)\b/i.test(cleanLine)) {
          rowOrderType = 'ORDER MO';
          break;
        } else if (t === 'ORDER IHLD ON GOING' && /\b(IHLD|HOLD)\b/i.test(cleanLine)) {
          rowOrderType = 'ORDER IHLD ON GOING';
          break;
        } else if (t === 'Pengajuan JT PWT & Magelang' && /\b(JT|OGP PEMBANGUNAN|BUTUH JT)\b/i.test(cleanLine)) {
          rowOrderType = 'Pengajuan JT PWT & Magelang';
          break;
        } else if (t === 'ORDER DIGITAL' && /\b(DIGITAL|NETMONK|OCA|Pijar)\b/i.test(cleanLine)) {
          rowOrderType = 'ORDER DIGITAL';
          break;
        } else if (t === 'ORDER OBL' && /\b(OBL)\b/i.test(cleanLine)) {
          rowOrderType = 'ORDER OBL';
          break;
        } else if (t === 'ORDER WMS DENGAN AP BARU' && /\b(AP BARU|WMS.*AP)\b/i.test(cleanLine)) {
          rowOrderType = 'ORDER WMS DENGAN AP BARU';
          break;
        }
      }
    }

    parsedRows.push({
      id: `row-${rowCounter++}-${Date.now()}`,
      rawLine: formattedCleanLine,
      stoCode: detectedStoCode,
      stoRegion: stoLookup.region,
      orderNumber: orderNumber || undefined,
      status: status || undefined,
      orderType: orderType || undefined,
      assignedOrderType: rowOrderType,
      keterangan: keterangan || undefined,
      extraColumns,
      isUnmapped: !stoLookup.isRegistered,
    });
  }

  return parsedRows;
}


/**
 * Cek apakah sebuah baris merupakan header tabel Excel (seperti "No\tOrder ID\tSTO")
 */
function isHeaderRow(line: string): boolean {
  const upper = line.toUpperCase();
  const headerKeywords = ['NOMOR ORDER', 'ORDER ID', 'NO ORDER', 'NO. ORDER', 'KODE STO', 'WILAYAH', 'NAMA STO'];
  
  if (headerKeywords.some(kw => upper.includes(kw))) {
    return true;
  }

  // Jika kolom pertama adalah "NO" atau "NO." dan memiliki tab / spasi pemisah
  if (/^(NO|NO\.|ID)\b/i.test(line) && (line.includes('\t') || line.includes('|'))) {
    return true;
  }

  return false;
}

/**
 * Deteksi apakah sebuah token berpotensi merupakan nomor order (misal 172938472 atau 1-72991992827 atau SC-91823)
 */
function isLikelyOrderNumber(val: string): boolean {
  const clean = val.trim();
  // Angka berurutan 6-16 digit, atau pola 1-72991992827, atau berawalan SC/MYIR/ORD/WO
  if (/^\d{6,16}$/.test(clean)) return true;
  if (/^1-\d{8,14}$/.test(clean)) return true;
  if (/^(SC|MYIR|ORD|WO|IN|AO)[\w-]+$/i.test(clean)) return true;
  return false;
}

/**
 * Deteksi kata status umum yang biasa muncul di laporan monitoring order
 */
function isLikelyStatus(val: string): boolean {
  const upper = val.toUpperCase().trim();
  const statusList = [
    'FALLOUT', 'PENDING', 'PROVISION_ISSUE', 'PROGRESS', 'COMPLETED',
    'CANCEL', 'CANCELLED', 'FAILED', 'WAITING', 'KENDALA', 'OGP', 'DONE',
    'SURVEY', 'INSTALASI', 'PROVISI', 'CLOSED', 'VALIDATE'
  ];
  return statusList.some(s => upper.includes(s));
}

/**
 * Deteksi jenis order (PSB, PDA, MIGRATION, 2P, 3P, INDIHOME, ASTINET, dll)
 */
function isLikelyOrderType(val: string): boolean {
  const upper = val.toUpperCase().trim();
  const types = ['PSB', 'PDA', 'MIGRASI', 'MIGRATION', '2P', '3P', '1P', 'DISMANTLE', 'MODIFY', 'INDIHOME', 'ASTINET'];
  return types.some(t => upper === t || upper.startsWith(t));
}

/**
 * Kata-kata umum dan akronim teknis yang tidak boleh salah diidentifikasi sebagai STO
 */
function isCommonStatusWord(word: string): boolean {
  const upper = word.toUpperCase().trim();
  const ignored = [
    'PT', 'CV', 'UD', 'TBK', 'NON', 'FBB', 'FFM', 'TIF', 'AN', 'DAN', 'DI', 'KE', 'DARI',
    'PSB', 'PDA', 'ODP', 'FAT', 'ONT', 'STP', 'STB', 'WO', 'SC', 'NO', 'WIB', 'WITA', 'WIT',
    'FO', 'KVA', 'ID', 'IN', 'OUT', 'UMUR', 'HARI', 'SEJAK', 'DATA', 'WORK', 'DISTRICT',
    'ASTINET', 'VALIDATE', 'CANCL', 'CANCLWORK', 'CANCLWORK'
  ];
  return ignored.includes(upper);
}
