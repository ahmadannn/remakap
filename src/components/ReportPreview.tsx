import React, { useState, useEffect } from 'react';
import { Terminal, Edit3, Eye, CheckCircle2, Copy, Check, Building2, MapPin } from 'lucide-react';
import { formatUmurBold } from '../logic/reportGenerator';
import { SplitReports } from '../types';

interface ReportPreviewProps {
  reportText?: string;
  splitReports?: SplitReports;
  totalOrders: number;
  onUpdateReportText?: (newText: string) => void;
}

type ActiveTab = 'purwokerto' | 'magelang' | 'areaLain';

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  splitReports,
  totalOrders,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (splitReports?.countPurwokerto && splitReports.countPurwokerto > 0) return 'purwokerto';
    if (splitReports?.countMagelang && splitReports.countMagelang > 0) return 'magelang';
    return 'purwokerto';
  });

  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Simpan state edit terpisah per tab agar perubahan tidak tertimpa
  const [tabTexts, setTabTexts] = useState<Record<ActiveTab, string>>({
    purwokerto: splitReports?.purwokerto || '',
    magelang: splitReports?.magelang || '',
    areaLain: splitReports?.areaLain || '',
  });

  useEffect(() => {
    setTabTexts({
      purwokerto: splitReports?.purwokerto || '',
      magelang: splitReports?.magelang || '',
      areaLain: splitReports?.areaLain || '',
    });

    // Otomatis pilih tab yang memiliki data jika tab saat ini kosong
    if (splitReports) {
      if (activeTab === 'purwokerto' && !splitReports.purwokerto && splitReports.magelang) {
        setActiveTab('magelang');
      } else if (activeTab === 'magelang' && !splitReports.magelang && splitReports.purwokerto) {
        setActiveTab('purwokerto');
      }
    }
  }, [splitReports]);

  if (totalOrders === 0) {
    return null;
  }

  const currentText = tabTexts[activeTab] || '';

  const handleCopySpecific = async (
    textToCopyRaw: string,
    sectionName: string
  ) => {
    try {
      if (!textToCopyRaw.trim()) return;
      const textToCopy = formatUmurBold(textToCopyRaw);
      await navigator.clipboard.writeText(textToCopy);
      setCopiedTarget(sectionName);
      setTimeout(() => setCopiedTarget(null), 3000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleCopyActiveTab = () => {
    const tabName =
      activeTab === 'purwokerto'
        ? 'PURWOKERTO'
        : activeTab === 'magelang'
        ? 'MAGELANG'
        : 'AREA LAIN';
    handleCopySpecific(currentText, tabName);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTabTexts((prev) => ({
      ...prev,
      [activeTab]: newText,
    }));
  };

  const hasPwt = Boolean(splitReports?.purwokerto && splitReports.purwokerto.trim());
  const hasMag = Boolean(splitReports?.magelang && splitReports.magelang.trim());
  const hasAreaLain = Boolean(splitReports?.areaLain && splitReports.areaLain.trim());

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-5 sm:p-6 text-slate-300 font-mono text-sm relative flex flex-col gap-4">
      {/* 1. Header Top */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-sans pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200 tracking-wide">
            LAPORAN SIAP COPY (PURWOKERTO & MAGELANG)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-edit-report"
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            title={isEditing ? 'Lihat Tampilan Preview' : 'Edit Teks Laporan Sebelum Copy'}
          >
            {isEditing ? (
              <>
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                Mode Preview
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                Edit Teks
              </>
            )}
          </button>
        </div>
      </div>


      {/* Copy Notification Toast */}
      {copiedTarget && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center justify-between font-sans animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Laporan <strong>{copiedTarget}</strong> berhasil disalin ke clipboard dengan format <strong>**UMUR X HARI**</strong>!
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-900/60 px-2 py-0.5 rounded">
            TERSALIN
          </span>
        </div>
      )}

      {/* 3. Tab Selector to Preview Each Area */}
      <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 font-sans text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('purwokerto')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'purwokerto'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Purwokerto</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-black/30 rounded font-mono">
            {splitReports?.countPurwokerto || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('magelang')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'magelang'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Magelang</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-black/30 rounded font-mono">
            {splitReports?.countMagelang || 0}
          </span>
        </button>

        {hasAreaLain && (
          <button
            type="button"
            onClick={() => setActiveTab('areaLain')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'areaLain'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Area Lain</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-black/30 rounded font-mono">
              {splitReports?.countAreaLain || 0}
            </span>
          </button>
        )}
      </div>

      {/* 4. Terminal Output Area */}
      <div className="relative">
        {isEditing ? (
          <textarea
            id="textarea-editable-report"
            value={currentText}
            onChange={handleTextChange}
            rows={12}
            className="w-full font-mono text-xs sm:text-sm p-4 rounded-xl border border-cyan-500/80 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 leading-relaxed"
          />
        ) : (
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/90 font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto select-text shadow-inner">
            {currentText || (
              <span className="text-slate-500 italic">
                Tidak ada data order untuk kategori ini.
              </span>
            )}
          </div>
        )}
      </div>

      {/* 5. Bottom Actions for currently selected active tab */}
      <div className="flex flex-col gap-2 font-sans pt-1">
        {/* Single Universal Copy Button */}
        <button
          id="btn-copy-active-report"
          type="button"
          onClick={handleCopyActiveTab}
          disabled={!currentText.trim()}
          className={`py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
            currentText.trim()
              ? copiedTarget === (activeTab === 'purwokerto' ? 'PURWOKERTO' : activeTab === 'magelang' ? 'MAGELANG' : 'AREA LAIN')
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-slate-100 hover:bg-white text-slate-900 shadow-sm'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {copiedTarget === (activeTab === 'purwokerto' ? 'PURWOKERTO' : activeTab === 'magelang' ? 'MAGELANG' : 'AREA LAIN') ? (
            <>
              <Check className="w-4 h-4" />
              <span>BERHASIL DISALIN KE CLIPBOARD!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>SALIN LAPORAN {activeTab.toUpperCase()}</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-1">
          <span>Karakter: {currentText.length}</span>
          <span>Baris: {currentText ? currentText.split('\n').length : 0}</span>
        </div>
      </div>
    </div>
  );
};

