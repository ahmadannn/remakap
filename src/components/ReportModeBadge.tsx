import React from 'react';
import { ReportModeInfo } from '../types';
import { FixedTimeSlot } from '../logic/timeDetector';
import { Sun, Sunset, Clock } from 'lucide-react';

interface ReportModeBadgeProps {
  modeInfo: ReportModeInfo;
  activeSlot: FixedTimeSlot;
  onSelectSlot: (slot: FixedTimeSlot) => void;
}

export const ReportModeBadge: React.FC<ReportModeBadgeProps> = ({
  modeInfo,
  activeSlot,
  onSelectSlot,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
      {/* Mode Status Aktif */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Jadwal Laporan:
          </span>
          <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => onSelectSlot('08.30')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSlot === '08.30'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>08.30 WIB (PAGI)</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectSlot('15.30')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSlot === '15.30'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sunset className="w-3.5 h-3.5" />
              <span>15.30 WIB (SORE)</span>
            </button>
          </div>
        </div>

        <span className="hidden sm:inline text-xs text-slate-500 font-medium">
          • {modeInfo.description}
        </span>
      </div>

      {/* Indikator Jam Laporan Tetap */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Clock className="w-3.5 h-3.5 text-indigo-600" />
        <span>Jam Header Tetap: <strong className="text-slate-800 font-mono font-bold">{activeSlot} WIB</strong></span>
      </div>
    </div>
  );
};


