import React, { useState, useMemo, useEffect } from 'react';
import { ClipboardPaste, Trash2, Zap, Layers, Sparkles, Filter, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { ORDER_TYPES_LIST } from '../config/orderTypes';

interface InputAreaProps {
  orderInputs: Record<string, string>;
  setOrderInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedOrderTypes: string[];
  setSelectedOrderTypes: (types: string[]) => void;
  onProcess: () => void;
  onClear: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  orderInputs,
  setOrderInputs,
  selectedOrderTypes,
  setSelectedOrderTypes,
  onProcess,
  onClear,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>(() => selectedOrderTypes[0] || 'ORDER PSB');
  const [viewMode, setViewMode] = useState<'tabs' | 'stacked'>('tabs');

  // Pastikan activeTab selalu menunjuk ke salah satu selectedOrderTypes yang aktif
  useEffect(() => {
    if (!selectedOrderTypes.includes(activeTab)) {
      setActiveTab(selectedOrderTypes[0] || 'ORDER PSB');
    }
  }, [selectedOrderTypes, activeTab]);

  const linesPerType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const type of selectedOrderTypes) {
      const text = (orderInputs[type] || '').trim();
      counts[type] = text ? text.split(/\r?\n/).filter(line => line.trim().length > 0).length : 0;
    }
    return counts;
  }, [orderInputs, selectedOrderTypes]);

  // Total baris di seluruh kotak input yang terpilih
  const totalInputLines = useMemo(() => {
    return (Object.values(linesPerType) as number[]).reduce((sum: number, count: number) => sum + count, 0);
  }, [linesPerType]);

  const handleToggleOrderType = (type: string) => {
    if (selectedOrderTypes.includes(type)) {
      if (selectedOrderTypes.length === 1) return; // Cegah mengosongkan semua
      const nextTypes = selectedOrderTypes.filter(t => t !== type);
      setSelectedOrderTypes(nextTypes);
    } else {
      setSelectedOrderTypes([...selectedOrderTypes, type]);
    }
  };

  const handleSelectAllTypes = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrderTypes([...ORDER_TYPES_LIST]);
  };

  const handleResetToPsb = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrderTypes(['ORDER PSB']);
  };

  const handleInputChange = (orderType: string, value: string) => {
    setOrderInputs(prev => ({
      ...prev,
      [orderType]: value,
    }));
  };

  const handleClearSingleType = (orderType: string) => {
    setOrderInputs(prev => ({
      ...prev,
      [orderType]: '',
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onProcess();
    }
  };

  const handleLoadSample = () => {
    const sampleTypes = ['ORDER PSB', 'ORDER DO', 'ORDER MO'];
    setSelectedOrderTypes(sampleTypes);
    setActiveTab('ORDER PSB');

    setOrderInputs({
      'ORDER PSB': [
        'PWT HOTEL GRAND RUMAH INDAH 1002520202 HSI EBIS => COMPLETE COMPLETED sejak 08/20/2026 UMUR 4 HARI',
        'PWT HOTEL GRAND RUMAH INDAH 1002520263 HSI EBIS => OSS PROVISIONING ISSUED Provisioning Issued sejak 08/21/2026 UMUR 3 HARI',
        'MAN KEMENTERIAN SOSIAL 1-72918782498 ASTINET => Pickup NTE from SCM CANCLWORK TIF NON FBB FFM DISTRICT PURWOKERTO sejak 08/06/2026 UMUR 18 HARI | BUTUH JT OGP PEMBANGUNAN',
        'MAN KEMENTERIAN SOSIAL 1-72925914928 ASTINET => Review LME STARTWORK TIF ED REGIONAL JATENG DIY sejak 08/06/2026 UMUR 18 HARI | BUTUH JT OGP PEMBANGUNAN',
      ].join('\n'),
      'ORDER DO': [
        'PWT WMSL RINA HERTIYANTI 1002462232 => COMPLETE Completed sejak 07/07/2026 UMUR 48 HARI',
        'AJB ROSITA VIA AMANDA 1002500954 => COMPLETE Completed sejak 07/30/2026 UMUR 25 HARI',
      ].join('\n'),
      'ORDER MO': [
        'PWT WMS BAMBANG WIYONO 1002316401 WMS => Service Testing Wifi CANCLWORK TIF PMDA sejak 03/27/2026 UMUR 150 HARI | => DORONG CANCEL TUNGGAKAN 2 BULAN',
        'BJR RATINI 1002175770 WMS => Approval E2E Testing Wifi COMPLETE TIF PMDA sejak 01/05/2026 UMUR 231 HARI | => DORONG CANCEL TUNGGAKAN 2 BULAN',
      ].join('\n'),
    });
  };

  const isMultiType = selectedOrderTypes.length > 1;

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col gap-4">
      {/* 1. FILTER JENIS ORDER */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 overflow-hidden transition-all">
        {/* Toggle Filter Header Button */}
        <button
          type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-slate-100/70 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 tracking-wide">
                  Jenis Order
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-cyan-500 text-white">
                  {selectedOrderTypes.length} Terpilih
                </span>
              </div>
              <span className="text-[11px] text-slate-500 truncate font-sans">
                {selectedOrderTypes.join(', ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-cyan-600 font-semibold hidden sm:inline">
              {isFilterOpen ? 'Tutup Filter' : 'Ubah Jenis Order'}
            </span>
            <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs">
              {isFilterOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </button>

        {/* Expandable Filter Content */}
        {isFilterOpen && (
          <div className="p-3.5 pt-2 border-t border-slate-200/80 bg-white flex flex-col gap-2.5 animate-fadeIn">
            {/* Sub Action Buttons */}
            <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">
                Pilih jenis order yang akan dimasukkan ke laporan:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllTypes}
                  className="text-slate-900 hover:text-slate-600 font-semibold cursor-pointer px-1.5 py-0.5 hover:bg-slate-100 rounded"
                >
                  Pilih Semua
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleResetToPsb}
                  className="text-slate-900 hover:text-slate-600 font-medium cursor-pointer px-1.5 py-0.5 hover:bg-slate-100 rounded"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Checkbox Grid Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {ORDER_TYPES_LIST.map((orderType) => {
                const isChecked = selectedOrderTypes.includes(orderType);
                const lineCount = linesPerType[orderType] || 0;
                return (
                  <label
                    key={orderType}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${isChecked
                      ? 'bg-cyan-50/90 border-cyan-300 text-cyan-950 font-bold'
                      : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100/80'
                      }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleOrderType(orderType)}
                        className="w-3.5 h-3.5 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500 cursor-pointer"
                      />
                      <span className="truncate">{orderType}</span>
                    </div>
                    {isChecked && lineCount > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-cyan-200/70 text-cyan-900 font-bold shrink-0">
                        {lineCount} baris
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Tombol Selesai Tutup Filter */}
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition"
              >
                Terapkan & Tutup Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. AREA MULTI-INPUT DATA EXCEL */}
      <div className="flex flex-col gap-3">
        {/* Card Sub-Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <ClipboardPaste className="w-4 h-4 text-cyan-600" />
            Paste per Jenis Order
          </label>

          {isMultiType && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode('tabs')}
                className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${viewMode === 'tabs'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'bg-white text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Mode Tab
              </button>
              <button
                type="button"
                onClick={() => setViewMode('stacked')}
                className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${viewMode === 'stacked'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'bg-white text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Buka Semua Kotak
              </button>
            </div>
          )}
        </div>

        {/* Quick Helper Actions */}
        <div className="flex items-center justify-between gap-2">
          <button
            id="btn-load-sample"
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition cursor-pointer shadow-xs"
            title="Muat contoh data output Excel (PSB, DO, MO ke masing-masing kotak)"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-900" />
            Contoh Multi-Kotak
          </button>

          {totalInputLines > 0 && (
            <button
              id="btn-clear-all-inputs"
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-900 hover:bg-slate-50 bg-white border border-slate-200 transition cursor-pointer shadow-xs"
              title="Bersihkan semua kotak input"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Kosongkan Semua
            </button>
          )}
        </div>

        {/* KONDISI A: MODE TAB (Jika memilih Mode Tab) */}
        {viewMode === 'tabs' && isMultiType && (
          <div className="flex flex-col gap-2.5">
            {/* Tab Bar Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 font-sans text-xs">
              {selectedOrderTypes.map((type) => {
                const count = linesPerType[type] || 0;
                const isActive = activeTab === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveTab(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${isActive
                      ? 'bg-cyan-500 text-white shadow-xs'
                      : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <span>{type}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive
                        ? 'bg-slate-700 text-white'
                        : count > 0
                          ? 'bg-slate-200 text-slate-900 font-bold'
                          : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Kotak Input untuk Active Tab */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                <span className="font-semibold text-cyan-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                  Kotak Khusus: <strong>{activeTab}</strong>
                </span>
                {linesPerType[activeTab] > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500">
                      {linesPerType[activeTab]} baris
                    </span>
                    <button
                      type="button"
                      onClick={() => handleClearSingleType(activeTab)}
                      className="text-slate-900 hover:text-slate-600 underline font-medium cursor-pointer text-[11px]"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>

              <textarea
                id={`textarea-${activeTab.replace(/\s+/g, '-').toLowerCase()}`}
                value={orderInputs[activeTab] || ''}
                onChange={(e) => handleInputChange(activeTab, e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Letakkan data khusus (${activeTab}) di sini...`}
                rows={7}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition resize-y leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* KONDISI B: MODE SEMUA KOTAK DIBUKA (STACKED) ATAU HANYA 1 JENIS ORDER TERPILIH */}
        {(!isMultiType || viewMode === 'stacked') && (
          <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
            {selectedOrderTypes.map((type) => {
              const count = linesPerType[type] || 0;
              return (
                <div
                  key={type}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                      Data {type}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 font-semibold">
                        {count} baris
                      </span>
                      {count > 0 && (
                        <button
                          type="button"
                          onClick={() => handleClearSingleType(type)}
                          className="text-slate-900 hover:text-slate-600 underline font-medium cursor-pointer text-[11px]"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    id={`textarea-stack-${type.replace(/\s+/g, '-').toLowerCase()}`}
                    value={orderInputs[type] || ''}
                    onChange={(e) => handleInputChange(type, e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Paste data Excel khusus (${type}) di sini...`}
                    rows={isMultiType ? 4 : 8}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition resize-y leading-relaxed"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Primary Process Button */}
        <button
          id="btn-process-data"
          type="button"
          onClick={onProcess}
          disabled={totalInputLines === 0}
          className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${totalInputLines > 0
            ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-200'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
            }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>
            Proses {totalInputLines > 0 ? `${totalInputLines} Order Terpilih` : 'Data Sekarang'}
          </span>
        </button>
      </div>
    </div>
  );
};



