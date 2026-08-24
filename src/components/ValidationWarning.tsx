import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, Check, Code2 } from 'lucide-react';

interface ValidationWarningProps {
  unmappedStos: string[];
  isAllStoValid: boolean;
  totalOrders: number;
}

export const ValidationWarning: React.FC<ValidationWarningProps> = ({
  unmappedStos,
  isAllStoValid,
  totalOrders,
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (totalOrders === 0) {
    return null;
  }

  const generateSnippet = () => {
    return unmappedStos
      .filter((sto) => sto !== 'TIDAK TERDETEKSI')
      .map((sto) => `  "${sto}": "NAMA_WILAYAH_${sto}",`)
      .join('\n');
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(generateSnippet());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // KONDISI 1: Ada STO yang belum terdaftar
  if (!isAllStoValid && unmappedStos.length > 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 shadow-xs">
        <h3 className="text-amber-800 text-xs font-bold flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          STO BELUM TERDAFTAR
        </h3>
        
        <p className="text-[11px] text-amber-700 leading-relaxed mb-2.5">
          Aplikasi tidak menebak wilayah. Tambahkan kode di bawah ke <code className="px-1 py-0.5 rounded bg-amber-100/80 font-mono font-semibold text-[10px]">src/config/stoMapping.ts</code>:
        </p>

        {/* Daftar STO Belum Terdaftar */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {unmappedStos.map((sto) => (
            <span
              key={sto}
              className="text-[10px] px-2.5 py-1 bg-white border border-amber-300 rounded-full text-amber-800 font-mono font-bold shadow-xs"
            >
              {sto}
            </span>
          ))}
        </div>

        {/* Action to Copy Snippet */}
        <div className="flex items-center justify-between pt-2 border-t border-amber-200/80">
          <span className="text-[10px] text-amber-600 italic flex items-center gap-1">
            <Code2 className="w-3 h-3" /> Siap ditambahkan ke config
          </span>
          <button
            id="btn-copy-sto-snippet"
            type="button"
            onClick={handleCopySnippet}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-200/80 hover:bg-amber-200 text-amber-900 transition cursor-pointer shadow-xs"
          >
            {copiedSnippet ? (
              <>
                <Check className="w-3 h-3 text-emerald-700" />
                Tersalin!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Salin Format Config
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // KONDISI 2: Semua STO Valid
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 flex items-center gap-2.5 shadow-xs">
      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
      <span className="text-xs font-semibold text-emerald-800">
        Status STO Valid: Seluruh kode STO terpetakan di <code className="font-mono text-[11px]">stoMapping.ts</code>.
      </span>
    </div>
  );
};

