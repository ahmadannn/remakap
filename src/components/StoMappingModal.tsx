import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, BookOpen, Plus, Save, Pencil, Trash2, Check } from 'lucide-react';
import { getAllRegisteredStos, addStoMapping, updateStoMapping, deleteStoMapping } from '../config/stoMapping';

interface StoMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoMappingModal: React.FC<StoMappingModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for Add STO Form
  const [newKodeSto, setNewKodeSto] = useState('');
  const [newWilayah, setNewWilayah] = useState('');
  const [newWitel, setNewWitel] = useState(''); // kosong berarti LAINNYA
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // State for Edit STO
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editWilayahValue, setEditWilayahValue] = useState('');
  const [editWitelValue, setEditWitelValue] = useState('');

  // State for Delete STO Confirmation
  const [confirmDeleteCode, setConfirmDeleteCode] = useState<string | null>(null);

  // We need local state to trigger re-renders since STO_MAPPING is outside React
  const [registeredStos, setRegisteredStos] = useState(() => getAllRegisteredStos());

  // Update STO list whenever it changes
  useEffect(() => {
    if (isOpen) {
      setRegisteredStos(getAllRegisteredStos());
    }
  }, [isOpen]);

  const filteredStos = useMemo(() => {
    if (!searchTerm.trim()) return registeredStos;
    const term = searchTerm.toLowerCase();
    return registeredStos.filter(
      (item) =>
        item.code.toLowerCase().includes(term) ||
        item.region.toLowerCase().includes(term)
    );
  }, [registeredStos, searchTerm]);

  const handleAddSto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKodeSto.trim() || !newWilayah.trim()) return;
    
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const witelToSend = newWitel.trim() === '' ? 'LAINNYA' : newWitel;
      await addStoMapping(newKodeSto, newWilayah, witelToSend);
      setSuccessMsg(`STO ${newKodeSto.toUpperCase()} berhasil ditambahkan!`);
      setNewKodeSto('');
      setNewWilayah('');
      setNewWitel('');
      setRegisteredStos(getAllRegisteredStos());
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan STO');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (code: string, currentWilayah: string, currentWitel?: string) => {
    setEditingCode(code);
    setEditWilayahValue(currentWilayah);
    setEditWitelValue(currentWitel && currentWitel !== 'LAINNYA' ? currentWitel : '');
  };

  const handleSaveEdit = async (code: string) => {
    if (!editWilayahValue.trim()) return;
    try {
      const witelToSend = editWitelValue.trim() === '' ? 'LAINNYA' : editWitelValue;
      await updateStoMapping(code, editWilayahValue, witelToSend);
      setEditingCode(null);
      setRegisteredStos(getAllRegisteredStos());
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah STO');
    }
  };

  const handleDelete = async (code: string) => {
    try {
      await deleteStoMapping(code);
      setRegisteredStos(getAllRegisteredStos());
      setConfirmDeleteCode(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus STO');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Daftar Mapping STO Terdaftar
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Total {registeredStos.length} kode STO terkonfigurasi.
              </p>
            </div>
          </div>

          <button
            id="btn-close-sto-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Modal Body */}
      <div className="p-5 space-y-4 overflow-y-auto flex-1">
        {/* Form Tambah STO */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-3">
            <Plus className="w-4 h-4 text-cyan-600" />
            Tambah STO Baru
          </h4>
          <form onSubmit={handleAddSto} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Kode (misal: XYZ)"
              value={newKodeSto}
              onChange={(e) => setNewKodeSto(e.target.value)}
              className="w-full sm:w-24 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase"
              required
            />
            <input 
              type="text" 
              placeholder="Wilayah (misal: MAGELANG)"
              value={newWilayah}
              onChange={(e) => setNewWilayah(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase"
              required
            />
            <select
              value={newWitel}
              onChange={(e) => setNewWitel(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
            >
              <option value="">Witel Induk: Otomatis / Lainnya</option>
              <option value="PURWOKERTO">PURWOKERTO</option>
              <option value="MAGELANG">MAGELANG</option>
            </select>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </form>
          {errorMsg && <p className="text-xs text-red-600 mt-2 font-medium">{errorMsg}</p>}
          {successMsg && <p className="text-xs text-emerald-600 mt-2 font-medium">{successMsg}</p>}
        </div>
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode STO (misal PWT) atau nama wilayah (misal Purwokerto)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                  <th className="py-2.5 px-4">WITEL INDUK</th>
                  <th className="py-2.5 px-4 w-20 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStos.length > 0 ? (
                  filteredStos.map((item) => (
                    <tr key={item.code} className="hover:bg-cyan-50/50 transition-colors">
                      {editingCode === item.code ? (
                        <>
                          <td className="py-2.5 px-4 font-mono font-bold text-cyan-600">
                            {item.code}
                          </td>
                          <td className="py-2.5 px-4">
                            <input
                              type="text"
                              value={editWilayahValue}
                              onChange={(e) => setEditWilayahValue(e.target.value)}
                              className="px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 uppercase w-full"
                            />
                          </td>
                          <td className="py-2.5 px-4">
                            <select
                              value={editWitelValue}
                              onChange={(e) => setEditWitelValue(e.target.value)}
                              className="px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 bg-white w-full"
                            >
                              <option value="">Lainnya / Bawaan</option>
                              <option value="PURWOKERTO">PURWOKERTO</option>
                              <option value="MAGELANG">MAGELANG</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex gap-1.5 justify-center">
                              <button onClick={() => handleSaveEdit(item.code)} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition cursor-pointer">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setEditingCode(null)} className="p-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition cursor-pointer">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2.5 px-4 font-mono font-bold text-cyan-600">
                            {item.code}
                          </td>
                          <td className="py-2.5 px-4 text-slate-800 font-semibold">
                            {item.region}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">
                            {item.witel === 'PURWOKERTO' || item.witel === 'MAGELANG' ? (
                              <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium text-[10px]">
                                {item.witel}
                              </span>
                            ) : (
                              <span className="text-[10px] italic">Otomatis / Lainnya</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            {confirmDeleteCode === item.code ? (
                              <div className="flex items-center gap-1.5 justify-center bg-red-50 rounded px-2 py-1">
                                <span className="text-[10px] font-bold text-red-700 mr-1">Hapus?</span>
                                <button onClick={() => handleDelete(item.code)} className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 transition cursor-pointer">
                                  Ya
                                </button>
                                <button onClick={() => setConfirmDeleteCode(null)} className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-bold hover:bg-slate-300 transition cursor-pointer">
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1.5 justify-center">
                                <button onClick={() => handleEditClick(item.code, item.region, item.witel)} className="p-1 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded transition cursor-pointer" title="Edit">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setConfirmDeleteCode(item.code)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer" title="Hapus">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
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
          className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-white transition cursor-pointer"
        >
          Selesai & Tutup
        </button>
      </div>
    </div>
    </div >
  );
};
