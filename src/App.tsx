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
import { Info, HelpCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

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
        const rows = parseExcelOutput(text, [orderType]);
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
    const sampleTypes = ['ORDER PSB', 'ORDER DO', 'ORDER MO'];
    setSelectedOrderTypes(sampleTypes);

    const sampleInputs = {
      'ORDER PSB': [
        'PWT HOTEL GRAND RUMAH INDAH 1002520202 HSI EBIS => COMPLETE COMPLETED sejak 08/20/2026 UMUR 4 HARI',
        'PWT HOTEL GRAND RUMAH INDAH 1002520263 HSI EBIS => OSS PROVISIONING ISSUED Provisioning Issued sejak 08/21/2026 UMUR 3 HARI',
        'MAN KEMENTERIAN SOSIAL 1-72918782498 ASTINET => Pickup NTE from SCM CANCLWORK TIF NON FBB FFM DISTRICT PURWOKERTO sejak 08/06/2026 UMUR 18 HARI | BUTUH JT OGP PEMBANGUNAN',
        'MAN KEMENTERIAN SOSIAL 1-72925914928 ASTINET => Review LME STARTWORK TIF ED REGIONAL JATENG DIY sejak 08/06/2026 UMUR 18 HARI | BUTUH JT OGP PEMBANGUNAN',
      ].join('\n'),
      'ORDER DO': [
        'KITA ANNORA GROUP 1002465009 => OSS PONR PONR sejak 07/09/2026 UMUR 46 HARI',
        'PWT WMSL RINA HERTIYANTI 1002462232 => COMPLETE Completed sejak 07/07/2026 UMUR 48 HARI',
        'AJB ROSITA VIA AMANDA 1002500954 => COMPLETE Completed sejak 07/30/2026 UMUR 25 HARI',
      ].join('\n'),
      'ORDER MO': [
        'PWT WMS BAMBANG WIYONO 1002316401 WMS => Service Testing Wifi CANCLWORK TIF PMDA sejak 03/27/2026 UMUR 150 HARI | => DORONG CANCEL TUNGGAKAN 2 BULAN',
        'BJR RATINI 1002175770 WMS => Approval E2E Testing Wifi COMPLETE TIF PMDA sejak 01/05/2026 UMUR 231 HARI | => DORONG CANCEL TUNGGAKAN 2 BULAN',
      ].join('\n'),
    };

    setOrderInputs(sampleInputs);

    let allParsedRows: ParsedOrderRow[] = [];
    for (const orderType of sampleTypes) {
      const text = sampleInputs[orderType as keyof typeof sampleInputs];
      if (text) {
        const rows = parseExcelOutput(text, [orderType]);
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
      <Header onOpenStoModal={() => setIsStoModalOpen(true)} />

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

            {/* Panduan Alur Kerja Magang Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800 uppercase tracking-wider">
                  <Info className="w-4 h-4 text-indigo-600" />
                  Alur Praktis Penggunaan
                </div>
                <button
                  type="button"
                  onClick={() => setIsStoModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 hover:text-slate-600 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Daftar STO
                </button>
              </div>

              <ol className="text-xs text-slate-600 space-y-2 leading-relaxed pl-1">
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
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="max-w-md space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">
                    Menunggu Input Data Output Excel
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pilih jenis order yang diinginkan di sebelah kiri, paste data hasil pengecekan Excel, atau coba langsung dengan data contoh.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLoadSampleFromEmptyState}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-md shadow-cyan-200 transition active:scale-95 cursor-pointer"
                >
                  <span>Coba dengan Data Contoh (PSB, DO, MO)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-3 bg-white border-t border-slate-200 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 font-medium">
        <div>
          Order Report Generator • Sistem Otomatisasi Monitoring
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="text-emerald-600 font-bold">CLIENT-SIDE PRIVACY SECURE</span>
        </div>
      </footer>

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


