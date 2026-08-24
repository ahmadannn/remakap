import { ParsedOrderRow, RegionSummary, ReportModeInfo, SplitReports } from '../types';
import { formatReportHeaderTimestamp, FixedTimeSlot } from './timeDetector';
import { cleanQuotes } from './parser';
import { PURWOKERTO_REGIONS, MAGELANG_REGIONS, sortRegionsByHierarchy } from '../config/stoMapping';
import { sortSelectedOrderTypes } from '../config/orderTypes';

/**
 * ============================================================================
 * REPORT GENERATOR (GENERATOR TEKS LAPORAN SIAP COPY)
 * ============================================================================
 */

export interface GenerateReportOptions {
  timestamp: Date;
  modeInfo: ReportModeInfo;
  manualSlot?: FixedTimeSlot;
  selectedOrderTypes?: string[];
  groupedByRegion: Record<string, RegionSummary>;
  unmappedRows: ParsedOrderRow[];
  unmappedStos: string[];
  totalOrders: number;
}

export function generateSplitReports(options: GenerateReportOptions): SplitReports {
  const {
    timestamp,
    manualSlot,
    selectedOrderTypes = ['ORDER PSB'],
    groupedByRegion,
    unmappedRows,
    totalOrders,
  } = options;

  if (totalOrders === 0) {
    const emptyMsg = 'Belum ada data order yang diproses. Silakan pilih jenis order, paste data Excel, dan klik "Proses Data Sekarang".';
    return {
      purwokerto: emptyMsg,
      magelang: emptyMsg,
      areaLain: '',
      combined: emptyMsg,
      countPurwokerto: 0,
      countMagelang: 0,
      countAreaLain: 0,
    };
  }

  const sortedTypes = sortSelectedOrderTypes(selectedOrderTypes);
  const orderTypesHeaderSuffix = `(${sortedTypes.join(', ')})`;

  const allRegionNames = sortRegionsByHierarchy(Object.keys(groupedByRegion));
  const baseHeaderTime = formatReportHeaderTimestamp(timestamp, manualSlot);

  const pwtRegions = allRegionNames.filter(r => PURWOKERTO_REGIONS.has(r));
  const magRegions = allRegionNames.filter(r => MAGELANG_REGIONS.has(r));
  const otherMappedRegions = allRegionNames.filter(
    r => !PURWOKERTO_REGIONS.has(r) && !MAGELANG_REGIONS.has(r)
  );

  let pwtReportText = '';
  let magReportText = '';
  let otherReportText = '';
  let countPurwokerto = 0;
  let countMagelang = 0;
  let countAreaLain = unmappedRows.length;

  // ==========================================
  // BLOK 1: WITEL PURWOKERTO
  // ==========================================
  if (pwtRegions.length > 0) {
    const pwtLines: string[] = [];
    pwtLines.push(`[PURWOKERTO] ${baseHeaderTime}`);
    pwtLines.push(orderTypesHeaderSuffix);
    pwtLines.push('');

    const sortedPwtRegions = [...pwtRegions].sort((a, b) => {
      if (a === 'PURWOKERTO') return -1;
      if (b === 'PURWOKERTO') return 1;
      return a.localeCompare(b);
    });

    for (const orderType of sortedTypes) {
      const regionsWithOrdersForType: Array<{ region: string; orders: ParsedOrderRow[] }> = [];

      for (const region of sortedPwtRegions) {
        const regionOrders = (groupedByRegion[region]?.orders || []).filter(order => {
          const oType = order.assignedOrderType || sortedTypes[0];
          return oType === orderType;
        });

        if (regionOrders.length > 0) {
          countPurwokerto += regionOrders.length;
          regionsWithOrdersForType.push({ region, orders: regionOrders });
        }
      }

      if (regionsWithOrdersForType.length > 0) {
        pwtLines.push(`(${orderType})`);
        pwtLines.push('');

        for (const item of regionsWithOrdersForType) {
          pwtLines.push(`=${item.region}=`);
          item.orders.forEach((order, index) => {
            pwtLines.push(`${index + 1}. ${formatOrderLine(order)}`);
          });
          pwtLines.push('');
        }
      }
    }

    pwtReportText = pwtLines.join('\n').trimEnd();
  }

  // ==========================================
  // BLOK 2: WITEL MAGELANG
  // ==========================================
  if (magRegions.length > 0) {
    const magLines: string[] = [];
    magLines.push(`[MAGELANG] ${baseHeaderTime}`);
    magLines.push(orderTypesHeaderSuffix);
    magLines.push('');

    const sortedMagRegions = [...magRegions].sort((a, b) => {
      if (a === 'MAGELANG') return -1;
      if (b === 'MAGELANG') return 1;
      return a.localeCompare(b);
    });

    for (const orderType of sortedTypes) {
      const regionsWithOrdersForType: Array<{ region: string; orders: ParsedOrderRow[] }> = [];

      for (const region of sortedMagRegions) {
        const regionOrders = (groupedByRegion[region]?.orders || []).filter(order => {
          const oType = order.assignedOrderType || sortedTypes[0];
          return oType === orderType;
        });

        if (regionOrders.length > 0) {
          countMagelang += regionOrders.length;
          regionsWithOrdersForType.push({ region, orders: regionOrders });
        }
      }

      if (regionsWithOrdersForType.length > 0) {
        magLines.push(`(${orderType})`);
        magLines.push('');

        for (const item of regionsWithOrdersForType) {
          magLines.push(`=${item.region}=`);
          item.orders.forEach((order, index) => {
            magLines.push(`${index + 1}. ${formatOrderLine(order)}`);
          });
          magLines.push('');
        }
      }
    }

    magReportText = magLines.join('\n').trimEnd();
  }

  // ==========================================
  // BLOK 3: AREA LAIN (KOTA LUAR ATAU STO BELUM TERDAFTAR)
  // ==========================================
  if (otherMappedRegions.length > 0 || unmappedRows.length > 0) {
    const otherLines: string[] = [];
    otherLines.push(`[AREA LAIN] ${baseHeaderTime}`);
    otherLines.push(orderTypesHeaderSuffix);
    otherLines.push('');

    if (otherMappedRegions.length > 0) {
      for (const orderType of sortedTypes) {
        const regionsWithOrders: Array<{ region: string; orders: ParsedOrderRow[] }> = [];

        for (const region of otherMappedRegions) {
          const regionOrders = (groupedByRegion[region]?.orders || []).filter(order => {
            const oType = order.assignedOrderType || sortedTypes[0];
            return oType === orderType;
          });

          if (regionOrders.length > 0) {
            countAreaLain += regionOrders.length;
            regionsWithOrders.push({ region, orders: regionOrders });
          }
        }

        if (regionsWithOrders.length > 0) {
          otherLines.push(`(${orderType})`);
          otherLines.push('');
          for (const item of regionsWithOrders) {
            otherLines.push(`=${item.region}=`);
            item.orders.forEach((order, index) => {
              otherLines.push(`${index + 1}. ${formatOrderLine(order)}`);
            });
            otherLines.push('');
          }
        }
      }
    }

    if (unmappedRows.length > 0) {
      otherLines.push('=AREA LAIN / STO BELUM TERDAFTAR=');
      unmappedRows.forEach((order, index) => {
        const stoPrefix = order.stoCode && order.stoCode !== 'UNKNOWN' ? `[${order.stoCode}] ` : '';
        otherLines.push(`${index + 1}. ${stoPrefix}${formatUmurBold(cleanQuotes(order.rawLine))}`);
      });
      otherLines.push('');
    }

    otherReportText = otherLines.join('\n').trimEnd();
  }

  const combinedSections: string[] = [];
  if (pwtReportText) combinedSections.push(pwtReportText);
  if (magReportText) combinedSections.push(magReportText);
  if (otherReportText) combinedSections.push(otherReportText);

  const combined = combinedSections.length > 0
    ? combinedSections.join('\n\n')
    : `[LAPORAN] ${baseHeaderTime} ${orderTypesHeaderSuffix}\n\nTidak ada order yang ditemukan.`;

  return {
    purwokerto: pwtReportText,
    magelang: magReportText,
    areaLain: otherReportText,
    combined,
    countPurwokerto,
    countMagelang,
    countAreaLain,
  };
}

export function generateReportText(options: GenerateReportOptions): string {
  const split = generateSplitReports(options);
  return split.combined;
}

/**
 * Format string "UMUR X HARI" menjadi format bold dengan dua bintang: **UMUR X HARI** / **umur 3 hari**
 */
export function formatUmurBold(text: string): string {
  if (!text) return '';
  // Bersihkan dahulu tanda bintang yang mungkin sudah ada sebelumnya
  const cleaned = text.replace(/\*+(UMUR\s+\d+(?:\s*(?:HARI|HR|JAM|BULAN|BLN))?)\*+/gi, '$1');
  return cleaned.replace(/\b(UMUR\s+\d+(?:\s*(?:HARI|HR|JAM|BULAN|BLN))?)\b/gi, '**$1**');
}

/**
 * Format baris per order.
 * Mempertahankan baris bersih dari Excel pengguna tanpa tanda kutip dan menebalkan tulisan UMUR X HARI (**UMUR X HARI**).
 */
export function formatOrderLine(order: ParsedOrderRow): string {
  if (order.rawLine) {
    return formatUmurBold(cleanQuotes(order.rawLine));
  }

  const parts: string[] = [];

  if (order.orderNumber) {
    parts.push(order.orderNumber);
  }

  if (order.stoCode && order.stoCode !== 'UNKNOWN') {
    parts.push(`[${order.stoCode}]`);
  }

  if (order.orderType) {
    parts.push(`(${order.orderType})`);
  }

  if (order.status) {
    parts.push(order.status);
  }

  if (order.keterangan) {
    parts.push(`- ${order.keterangan}`);
  }

  if (order.customerName) {
    parts.push(`- ${order.customerName}`);
  }

  if (order.umurOrder) {
    parts.push(order.umurOrder);
  }

  if (order.extraColumns && order.extraColumns.length > 0) {
    parts.push(`| ${order.extraColumns.join(' | ')}`);
  }

  return formatUmurBold(cleanQuotes(parts.join(' ')));
}
