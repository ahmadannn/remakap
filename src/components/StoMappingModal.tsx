import React, { useState, useMemo } from 'react';
import { X, Search, BookOpen, FileCode, Check, Copy } from 'lucide-react';
import { getAllRegisteredStos } from '../config/stoMapping';

interface StoMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoMappingModal: React.FC<StoMappingModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedFileGuide, setCopiedFileGuide] = useState(false);

  const registeredStos = useMemo(() => {
    return getAllRegisteredStos();
  }, []);

  const filteredStos = useMemo(() => {
    if (!searchTerm.trim()) return registeredStos;
    const term = searchTerm.toLowerCase();
    return registeredStos.filter(
      (item) =>
        item.code.toLowerCase().includes(term) ||
        item.region.toLowerCase().includes(term)
    );
  }, [registeredStos, searchTerm]);

  if (!isOpen) return null;

  const handleCopyGuide = () => {
    const guideText = `// Buka file: src/config/stoMapping.ts\n// Tambahkan baris seperti contoh berikut:\nexport const STO_MAPPING: Record<string, string> = {\n  "PWT": "PURWOKERTO",\n  // Tambahkan STO baru di sini:\n  "KODE_BARU": "NAMA_WILAYAH",\n};`;
    navigator.clipboard.writeText(guideText);
    setCopiedFileGuide(true);
    setTimeout(() => setCopiedFileGuide(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Daftar Mapping STO Terdaftar
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Total {registeredStos.length} kode STO terkonfigurasi di <code className="font-mono text-indigo-600 font-semibold">stoMapping.ts</code>
              </p>
            </div>
          </div>

          <button
            id="btn-close-sto-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body & Petunjuk */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Guide Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <span>Petunjuk Menambah / Mengubah STO:</span>
              </div>
              <button
                type="button"
                onClick={handleCopyGuide}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                {copiedFileGuide ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin Format
                  </>
                )}
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Buka file <code className="px-1.5 py-0.5 rounded bg-slate-200/80 font-mono text-[11px] font-semibold text-slate-800">src/config/stoMapping.ts</code> lalu tambahkan pasangan <code className="font-mono font-bold text-indigo-700">"KODE_STO": "NAMA_WILAYAH"</code>. Aplikasi akan langsung mengelompokkan STO baru tersebut secara otomatis.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode STO (misal PWT) atau nama wilayah (misal Purwokerto)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Table of STO */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 sticky top-0 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-mono">KODE STO</th>
                    <th className="py-2.5 px-4">WILAYAH / DAERAH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStos.length > 0 ? (
                    filteredStos.map((item) => (
                      <tr key={item.code} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">
                          {item.code}
                        </td>
                        <td className="py-2.5 px-4 text-slate-800 font-semibold">
                          {item.region}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-slate-400">
                        Tidak ada kode STO yang cocok dengan "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

