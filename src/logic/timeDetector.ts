import { ReportMode, ReportModeInfo } from '../types';

export type FixedTimeSlot = '08.30' | '15.30';

/**
 * Mendeteksi mode laporan berdasarkan waktu lokal perangkat:
 * - Sebelum 13:00 (Pagi/Siang) -> LAPORAN PAGI (Jam Tetap: 08.30 WIB)
 * - 13:00 ke atas (Sore/Malam) -> LAPORAN SORE (Jam Tetap: 15.30 WIB)
 */
export function detectReportMode(date: Date = new Date(), manualSlot?: FixedTimeSlot): ReportModeInfo {
  const hours = date.getHours();
  const selectedSlot: FixedTimeSlot = manualSlot || (hours < 13 ? '08.30' : '15.30');

  if (selectedSlot === '08.30') {
    return {
      mode: 'PAGI',
      label: 'LAPORAN PAGI (08.30 WIB)',
      badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      dotColor: 'bg-emerald-500',
      description: 'Jam laporan ditetapkan ke 08.30 WIB',
    };
  }

  return {
    mode: 'SORE',
    label: 'LAPORAN SORE (15.30 WIB)',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    dotColor: 'bg-amber-500',
    description: 'Jam laporan ditetapkan ke 15.30 WIB',
  };
}

/**
 * Format tanggal dalam format standar Indonesia: DD/MM/YYYY
 */
export function formatReportDate(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format jam dalam format laporan yang telah ditetapkan:
 * - Pagi -> 08.30 WIB
 * - Sore -> 15.30 WIB
 */
export function formatReportTime(date: Date = new Date(), manualSlot?: FixedTimeSlot): string {
  if (manualSlot) {
    return `${manualSlot} WIB`;
  }
  const hours = date.getHours();
  return hours < 13 ? '08.30 WIB' : '15.30 WIB';
}

/**
 * Format waktu lengkap header: UPDATE per DD/MM/YYYY JAM 08.30 WIB / 15.30 WIB
 */
export function formatReportHeaderTimestamp(date: Date = new Date(), manualSlot?: FixedTimeSlot): string {
  return `UPDATE per ${formatReportDate(date)} JAM ${formatReportTime(date, manualSlot)}`;
}

/**
 * Format waktu tampilan realtime di header status bar
 */
export function formatLiveDateTime(date: Date = new Date()): {
  dayName: string;
  dateStr: string;
  timeStr: string;
} {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[date.getDay()];
  const dateStr = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}:${seconds} WIB`;

  return { dayName, dateStr, timeStr };
}

