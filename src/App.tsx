import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ReportModeBadge } from './components/ReportModeBadge';
import { InputArea } from './components/InputArea';
import { ValidationWarning } from './components/ValidationWarning';
import { Summary } from './components/Summary';
import { ReportPreview } from './components/ReportPreview';
import { StoMappingModal } from './components/StoMappingModal';
import { detectReportMode, FixedTimeSlot } from './logic/timeDetector';
import { parseExcelOutput } from './logic/parser';
import { classifyOrdersByRegion } from './logic/classifier';
import { generateSplitReports } from './logic/reportGenerator';
import { ProcessedReportResult, ParsedOrderRow } from './types';
import { Info, HelpCircle, ArrowRight, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export default function App() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<FixedTimeSlot>(() => {
    return new Date().getHours() < 13 ? '08.30' : '15.30';
  });
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<string[]>([
    'ORDER PSB',
    'ORDER DO',
    'ORDER MO',
  ]);
  const [orderInputs, setOrderInputs] = useState<Record<string, string>>({
    'ORDER PSB': '',
    'ORDER DO': '',
    'ORDER MO': '',
  });
  const [processedResult, setProcessedResult] = useState<ProcessedReportResult | null>(null);
  const [isStoModalOpen, setIsStoModalOpen] = useState<boolean>(false);
  const [isFlowOpen, setIsFlowOpen] = useState<boolean>(false);

  // Update jam realtime setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch STO Mapping on mount
  useEffect(() => {
    import('./config/stoMapping').then(m => m.fetchStoMapping());
  }, []);

  // Mode laporan aktif berdasarkan slot yang dipilih
  const currentModeInfo = detectReportMode(currentTime, selectedSlot);

  // Fungsi ganti slot waktu (08.30 atau 15.30)
  const handleSelectSlot = (slot: FixedTimeSlot) => {
    setSelectedSlot(slot);
    if (processedResult) {
      const modeInfo = detectReportMode(new Date(), slot);
      const split = generateSplitReports({
        timestamp: new Date(),
        modeInfo,
        manualSlot: slot,
        selectedOrderTypes,
        groupedByRegion: processedResult.groupedByRegion,
        unmappedRows: processedResult.unmappedRows,
        unmappedStos: processedResult.unmappedStos,
        totalOrders: processedResult.totalOrders,
      });

      setProcessedResult({
        ...processedResult,
        modeInfo,
        generatedReportText: split.combined,
        splitReports: split,
      });
    }
  };

  // Fungsi proses data dari input multi-kotak
  const handleProcessData = useCallback(() => {
    let allParsedRows: ParsedOrderRow[] = [];

    // Parse data dari masing-masing kotak jenis order yang aktif
    for (const orderType of selectedOrderTypes) {
      const text = (orderInputs[orderType] || '').trim();
      if (text) {
        const { rows } = parseExcelOutput(text, [orderType]);
        allParsedRows = allParsedRows.concat(rows);
      }
    }

    if (allParsedRows.length === 0) return;

    const classification = classifyOrdersByRegion(allParsedRows);
    const modeInfo = detectReportMode(new Date(), selectedSlot);

    const split = generateSplitReports({
      timestamp: new Date(),
      modeInfo,
      manualSlot: selectedSlot,
      selectedOrderTypes,
      groupedByRegion: classification.groupedByRegion,
      unmappedRows: classification.unmappedRows,
      unmappedStos: classification.unmappedStos,
      totalOrders: classification.totalOrders,
    });

    setProcessedResult({
      timestamp: new Date(),
      modeInfo,
      selectedOrderTypes,
      totalOrders: classification.totalOrders,
      validOrdersCount: classification.validOrdersCount,
      unmappedOrdersCount: classification.unmappedOrdersCount,
      groupedByRegion: classification.groupedByRegion,
      unmappedStos: classification.unmappedStos,
      unmappedRows: classification.unmappedRows,
      generatedReportText: split.combined,
      splitReports: split,
      isAllStoValid: classification.isAllStoValid,
    });
  }, [orderInputs, selectedSlot, selectedOrderTypes]);

  const handleClear = () => {
    setOrderInputs({
      'ORDER PSB': '',
      'ORDER DO': '',
      'ORDER MO': '',
    });
    setProcessedResult(null);
  };

  const handleUpdateReportText = (newText: string) => {
    if (processedResult) {
      setProcessedResult({
        ...processedResult,
        generatedReportText: newText,
      });
    }
  };

  const handleLoadSampleFromEmptyState = () => {
    const sampleTypes = ['ORDER PSB'];
    setSelectedOrderTypes(sampleTypes);

    const sampleInputs = {
      'ORDER PSB': 'STO-NAMA CUSTOMER-NO ORDER-JENIS ORDER=>STATUS-KETERANGAN STATUS-LOKER-SEJAK MM/DD/YY- UMUR 0 HARI',
    };

    setOrderInputs(sampleInputs);

    let allParsedRows: ParsedOrderRow[] = [];
    for (const orderType of sampleTypes) {
      const text = sampleInputs[orderType as keyof typeof sampleInputs];
      if (text) {
        const { rows } = parseExcelOutput(text, [orderType]);
        allParsedRows = allParsedRows.concat(rows);
      }
    }

    const classification = classifyOrdersByRegion(allParsedRows);
    const modeInfo = detectReportMode(new Date(), selectedSlot);

    const split = generateSplitReports({
      timestamp: new Date(),
      modeInfo,
      manualSlot: selectedSlot,
      selectedOrderTypes: sampleTypes,
      groupedByRegion: classification.groupedByRegion,
      unmappedRows: classification.unmappedRows,
      unmappedStos: classification.unmappedStos,
      totalOrders: classification.totalOrders,
    });

    setProcessedResult({
      timestamp: new Date(),
      modeInfo,
      selectedOrderTypes: sampleTypes,
      totalOrders: classification.totalOrders,
      validOrdersCount: classification.validOrdersCount,
      unmappedOrdersCount: classification.unmappedOrdersCount,
      groupedByRegion: classification.groupedByRegion,
      unmappedStos: classification.unmappedStos,
      unmappedRows: classification.unmappedRows,
      generatedReportText: split.combined,
      splitReports: split,
      isAllStoValid: classification.isAllStoValid,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* 1. Header Aplikasi */}
      <Header />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex flex-col gap-6">
        {/* Mode Status Banner */}
        <ReportModeBadge
          modeInfo={currentModeInfo}
          activeSlot={selectedSlot}
          onSelectSlot={handleSelectSlot}
        />

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Input & Peringatan Validasi (5 Kolom di LG) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Input Data Excel Card (Multi-Kotak per Jenis Order) */}
            <InputArea
              orderInputs={orderInputs}
              setOrderInputs={setOrderInputs}
              selectedOrderTypes={selectedOrderTypes}
              setSelectedOrderTypes={setSelectedOrderTypes}
              onProcess={handleProcessData}
              onClear={handleClear}
            />

            {/* Peringatan Validasi STO jika ada data diproses */}
            {processedResult && (
              <ValidationWarning
                unmappedStos={processedResult.unmappedStos}
                isAllStoValid={processedResult.isAllStoValid}
                totalOrders={processedResult.totalOrders}
              />
            )}

            {/* Panduan Alur Kerja Card (Collapsible) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs flex flex-col transition-all">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsFlowOpen(!isFlowOpen)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-slate-600 cursor-pointer transition"
                >
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Alur Praktis Penggunaan</span>
                  {isFlowOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsStoModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 hover:text-slate-600 cursor-pointer shrink-0"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Daftar STO
                </button>
              </div>

              {isFlowOpen && (
                <ol className="text-xs text-slate-600 space-y-2 leading-relaxed pl-1 pt-3 mt-3 border-t border-slate-100 animate-fadeIn">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Centang <strong>Jenis Order</strong> yang ingin dilaporkan (misal: ORDER PSB, ORDER DO, ORDER MO).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>Paste data Excel ke dalam <strong>kotak masing-masing order</strong> (gunakan Mode Tab atau Buka Semua Kotak).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Klik <strong>"Proses Data"</strong>, lalu salin laporan khusus Purwokerto atau Magelang ke Telegram / WA.</span>
                  </li>
                </ol>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Metrik & Preview Laporan (7 Kolom di LG) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {processedResult ? (
              <>
                {/* Dark Terminal Preview & Tombol Salin */}
                <ReportPreview
                  reportText={processedResult.generatedReportText}
                  splitReports={processedResult.splitReports}
                  totalOrders={processedResult.totalOrders}
                  onUpdateReportText={handleUpdateReportText}
                />

                {/* 4 Kartu Metrik Ringkasan */}
                <Summary
                  totalOrders={processedResult.totalOrders}
                  groupedByRegion={processedResult.groupedByRegion}
                  unmappedStos={processedResult.unmappedStos}
                  unmappedOrdersCount={processedResult.unmappedOrdersCount}
                />
              </>
            ) : (
              /* Empty State Placeholder */
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col items-center justify-center text-center gap-4 min-h-[380px]">
                <div className="max-w-md space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">
                    Menunggu Input Data Output Excel
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pilih jenis order yang akan dimasukkan
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLoadSampleFromEmptyState}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-md shadow-cyan-200 transition active:scale-95 cursor-pointer"
                >
                  <span> Contoh Data</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Daftar Mapping STO */}
      <StoMappingModal
        isOpen={isStoModalOpen}
        onClose={() => {
          setIsStoModalOpen(false);
          // Otomatis proses ulang data untuk membaca STO yang baru ditambahkan
          handleProcessData();
        }}
      />
    </div>
  );
}


