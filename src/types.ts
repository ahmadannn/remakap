export type ReportMode = 'PAGI' | 'SORE' | 'OFF_HOURS';

export interface ReportModeInfo {
  mode: ReportMode;
  label: string;
  badgeClass: string;
  dotColor: string;
  description: string;
}

export interface ParsedOrderRow {
  id: string;
  rawLine: string;
  stoCode: string;
  stoRegion: string | null;
  orderNumber?: string;
  status?: string;
  orderType?: string;
  assignedOrderType?: string; // Menyimpan jenis order seperti "ORDER PSB", "ORDER DO", dll
  keterangan?: string;
  customerName?: string;
  umurOrder?: string;
  extraColumns: string[];
  isUnmapped: boolean;
}

export interface RegionSummary {
  region: string;
  stoCodes: string[];
  count: number;
  orders: ParsedOrderRow[];
}

export interface SplitReports {
  purwokerto: string;
  magelang: string;
  areaLain: string;
  combined: string;
  countPurwokerto: number;
  countMagelang: number;
  countAreaLain: number;
}

export interface ProcessedReportResult {
  timestamp: Date;
  modeInfo: ReportModeInfo;
  selectedOrderTypes: string[];
  totalOrders: number;
  validOrdersCount: number;
  unmappedOrdersCount: number;
  groupedByRegion: Record<string, RegionSummary>;
  unmappedStos: string[];
  unmappedRows: ParsedOrderRow[];
  generatedReportText: string;
  splitReports?: SplitReports;
  isAllStoValid: boolean;
}

