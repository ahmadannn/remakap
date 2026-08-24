import { ParsedOrderRow, RegionSummary } from '../types';

export interface GroupedOrdersResult {
  totalOrders: number;
  validOrdersCount: number;
  unmappedOrdersCount: number;
  groupedByRegion: Record<string, RegionSummary>;
  unmappedStos: string[];
  unmappedRows: ParsedOrderRow[];
  isAllStoValid: boolean;
}

/**
 * Mengelompokkan baris order berdasarkan Wilayah / STO yang sudah dipetakan
 * dan memisahkan order dengan STO yang belum terdaftar.
 */
export function classifyOrdersByRegion(rows: ParsedOrderRow[]): GroupedOrdersResult {
  const groupedByRegion: Record<string, RegionSummary> = {};
  const unmappedStosSet = new Set<string>();
  const unmappedRows: ParsedOrderRow[] = [];

  let validCount = 0;

  for (const row of rows) {
    if (row.isUnmapped || !row.stoRegion) {
      unmappedRows.push(row);
      if (row.stoCode && row.stoCode !== 'UNKNOWN') {
        unmappedStosSet.add(row.stoCode);
      } else {
        unmappedStosSet.add('TIDAK TERDETEKSI');
      }
      continue;
    }

    validCount++;
    const regionName = row.stoRegion;

    if (!groupedByRegion[regionName]) {
      groupedByRegion[regionName] = {
        region: regionName,
        stoCodes: [],
        count: 0,
        orders: [],
      };
    }

    groupedByRegion[regionName].count += 1;
    groupedByRegion[regionName].orders.push(row);

    if (row.stoCode && !groupedByRegion[regionName].stoCodes.includes(row.stoCode)) {
      groupedByRegion[regionName].stoCodes.push(row.stoCode);
    }
  }

  const unmappedStos = Array.from(unmappedStosSet).sort();

  return {
    totalOrders: rows.length,
    validOrdersCount: validCount,
    unmappedOrdersCount: unmappedRows.length,
    groupedByRegion,
    unmappedStos,
    unmappedRows,
    isAllStoValid: unmappedStos.length === 0,
  };
}
