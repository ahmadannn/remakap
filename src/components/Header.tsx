import React, { useState, useEffect } from 'react';
import { BookOpen, FileSpreadsheet } from 'lucide-react';
import { formatLiveDateTime, detectReportMode } from '../logic/timeDetector';

interface HeaderProps {
  onOpenStoModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenStoModal }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { dayName, dateStr, timeStr } = formatLiveDateTime(currentTime);
  const modeInfo = detectReportMode(currentTime);

  return (
    <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 sm:px-8 py-3.5 bg-white border-b border-slate-200 shrink-0 shadow-xs gap-3">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-md shadow-cyan-200 shrink-0">
          <FileSpreadsheet className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              Order Report Generator
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Monitoring Automation
          </p>
        </div>
      </div>

      {/* Realtime Clock & Status Mode */}
      <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end">
        <div className="text-left sm:text-right">
          <div className="text-xs sm:text-sm font-semibold text-slate-800 font-mono" id="realtime-clock">
            {dayName}, {dateStr} | <span className="font-bold text-cyan-600">{timeStr}</span>
          </div>
          <div className="flex items-center sm:justify-end gap-2 mt-0.5">
            <span className={`w-2 h-2 rounded-full animate-pulse ${modeInfo.dotColor}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">
              {modeInfo.label}
            </span>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

        {/* STO Mapping Config Button */}
        <button
          id="btn-open-sto-modal"
          onClick={onOpenStoModal}
          type="button"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-xs"
          title="Lihat dan kelola mapping kode STO"
        >
          <BookOpen className="w-4 h-4 text-slate-900" />
          <span className="hidden md:inline">Data</span> STO
        </button>
      </div>
    </header>
  );
};

