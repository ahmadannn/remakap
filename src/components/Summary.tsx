import React, { useState } from 'react';
import { RegionSummary } from '../types';
import { MapPin, AlertCircle, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { sortRegionsByHierarchy } from '../config/stoMapping';

interface SummaryProps {
  totalOrders: number;
  groupedByRegion: Record<string, RegionSummary>;
  unmappedStos: string[];
  unmappedOrdersCount: number;
}

export const Summary: React.FC<SummaryProps> = ({
  totalOrders,
  groupedByRegion,
  unmappedStos,
  unmappedOrdersCount,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (totalOrders === 0) {
    return null;
  }

  const regionKeys = sortRegionsByHierarchy(Object.keys(groupedByRegion));

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 transition-all">
      {/* Top compact bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Total Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-900 font-bold text-xs">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Total:</span>
            <span className="text-sm font-black text-indigo-700">{totalOrders}</span>
            <span className="text-[10px] text-indigo-600/80 font-normal">Order</span>
          </div>

          {/* Inline Compact Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {regionKeys.map((region) => {
              const regionData = groupedByRegion[region];
              const percent = Math.round((regionData.count / totalOrders) * 100);

              return (
                <div
                  key={region}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100/90 border border-slate-200/70 text-slate-700 text-[11px]"
                  title={`STO: ${regionData.stoCodes.join(', ')}`}
                >
                  <span className="font-semibold text-slate-800">{region}:</span>
                  <span className="font-bold text-indigo-600">{regionData.count}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({percent}%)</span>
                </div>
              );
            })}

            {/* Unmapped Warning Pill */}
            {unmappedOrdersCount > 0 && (
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-medium"
                title={`Belum terdaftar STO: ${unmappedStos.join(', ')}`}
              >
                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="font-bold">Belum Terdaftar:</span>
                <span className="font-extrabold text-amber-700">{unmappedOrdersCount}</span>
                <span className="text-[10px] text-amber-700 font-mono">({unmappedStos.join(', ')})</span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Detail STO */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition cursor-pointer font-medium"
        >
          <span>{isExpanded ? 'Sembunyikan STO' : 'Detail STO'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Expandable STO breakdown */}
      {isExpanded && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          {regionKeys.map((region) => {
            const regionData = groupedByRegion[region];
            return (
              <div
                key={region}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-col gap-0.5"
              >
                <div className="flex items-center justify-between text-slate-600 font-bold text-[11px]">
                  <span className="truncate">{region}</span>
                  <span className="text-indigo-600 font-black">{regionData.count}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  STO: {regionData.stoCodes.join(', ')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


