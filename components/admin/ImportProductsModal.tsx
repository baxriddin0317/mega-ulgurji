"use client"
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ParsedProduct, parseProductsFromFile } from '@/lib/importExcel';
import useCategoryStore from '@/store/useCategoryStore';
import useProductStore from '@/store/useProductStore';
import { Upload, AlertCircle, CheckCircle2, X, FileUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImportProductsModalProps {
  onClose: () => void;
}

const ImportProductsModal = ({ onClose }: ImportProductsModalProps) => {
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { categories } = useCategoryStore();
  const { bulkAddProducts } = useProductStore();

  const processFile = useCallback(async (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
    ];
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
      toast.error("Faqat Excel (.xlsx, .xls) yoki CSV fayllar qo'llab-quvvatlanadi");
      return;
    }

    setFileName(file.name);
    try {
      const products = await parseProductsFromFile(file, categories);
      if (products.length === 0) {
        toast.error("Faylda mahsulotlar topilmadi. Ustun nomlarini tekshiring.");
        return;
      }
      setParsedProducts(products);
    } catch {
      toast.error("Faylni o'qishda xatolik yuz berdi");
    }
  }, [categories]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const validProducts = parsedProducts.filter((p) => p.errors.length === 0);
  const errorCount = parsedProducts.length - validProducts.length;
  const displayedProducts = showOnlyErrors
    ? parsedProducts.filter(p => p.errors.length > 0)
    : parsedProducts;

  const handleImport = async () => {
    if (validProducts.length === 0) return;
    setImporting(true);
    setProgress(0);

    try {
      const batchSize = 500;
      const mapped = validProducts.map((p) => ({
        title: p.title,
        category: p.category,
        subcategory: p.subcategory,
        price: p.price,
        costPrice: p.costPrice,
        stock: p.stock,
        description: p.description,
      }));

      const totalBatches = Math.ceil(mapped.length / batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const chunk = mapped.slice(i * batchSize, (i + 1) * batchSize);
        await bulkAddProducts(chunk);
        setProgress(Math.round(((i + 1) / totalBatches) * 100));
      }

      toast.success(`${validProducts.length} ta mahsulot import qilindi!`);
      onClose();
    } catch {
      toast.error("Import qilishda xatolik yuz berdi");
    } finally {
      setImporting(false);
    }
  };

  const resetFile = () => {
    setParsedProducts([]);
    setFileName('');
    setProgress(0);
    setShowOnlyErrors(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <div className="sm:hidden h-1 w-10 bg-gray-300 rounded-full absolute top-2 left-1/2 -translate-x-1/2" aria-hidden />
            <h3 className="text-base sm:text-lg font-bold text-black truncate">Mahsulotlarni import qilish</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="shrink-0 p-2 -mr-1 hover:bg-gray-100 rounded-lg cursor-pointer active:scale-95 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col px-4 sm:px-6 py-3 sm:py-4">
          {parsedProducts.length === 0 ? (
            <div
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-colors ${
                dragging
                  ? 'border-black bg-gray-50 scale-[1.01]'
                  : 'border-gray-300 hover:border-black'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className={`transition-transform ${dragging ? 'scale-110' : ''}`}>
                {dragging ? (
                  <FileUp className="size-10 sm:size-12 mx-auto text-black mb-3 animate-bounce" />
                ) : (
                  <Upload className="size-9 sm:size-10 mx-auto text-gray-400 mb-3" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-700">
                {dragging ? 'Faylni shu yerga tashlang' : 'Faylni tanlang yoki shu yerga tashlang'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                .xlsx, .xls, .csv formatlar qo&apos;llab-quvvatlanadi
              </p>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-3 px-4">
                Ustun nomlari: o&apos;zbekcha, inglizcha yoki ruscha bo&apos;lishi mumkin
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <p className="text-xs sm:text-sm text-gray-600 min-w-0 break-all">
                  <span className="font-medium">{fileName}</span>
                  <span className="text-gray-400"> — {parsedProducts.length} ta qator</span>
                </p>
              </div>
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1 flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> {validProducts.length} ta tayyor
                </span>
                {errorCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowOnlyErrors((v) => !v)}
                    className={`text-xs font-medium rounded-lg px-2.5 py-1 flex items-center gap-1 transition cursor-pointer ${
                      showOnlyErrors
                        ? 'bg-red-600 text-white border border-red-600'
                        : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    }`}
                  >
                    <AlertCircle className="size-3" /> {errorCount} ta xatolik
                    {showOnlyErrors && <span className="ml-1">· filtr yoqilgan</span>}
                  </button>
                )}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-auto flex-1 rounded-xl border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">#</th>
                      <th className="px-3 py-2 text-left font-medium">Nomi</th>
                      <th className="px-3 py-2 text-left font-medium">Kategoriya</th>
                      <th className="px-3 py-2 text-left font-medium">Subkategoriya</th>
                      <th className="px-3 py-2 text-left font-medium">Narxi</th>
                      <th className="px-3 py-2 text-left font-medium">Tan narxi</th>
                      <th className="px-3 py-2 text-left font-medium">Ombor</th>
                      <th className="px-3 py-2 text-left font-medium">Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedProducts.map((p, i) => (
                      <tr key={i} className={`border-t ${p.errors.length > 0 ? 'bg-red-50' : ''}`}>
                        <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                        <td className="px-3 py-2 font-medium">{p.title || '—'}</td>
                        <td className="px-3 py-2">{p.category || '—'}</td>
                        <td className="px-3 py-2">{p.subcategory || '—'}</td>
                        <td className="px-3 py-2">{p.price}</td>
                        <td className="px-3 py-2">{p.costPrice || '—'}</td>
                        <td className="px-3 py-2">{p.stock}</td>
                        <td className="px-3 py-2">
                          {p.errors.length > 0 ? (
                            <span className="text-xs text-red-600">{p.errors.join(', ')}</span>
                          ) : (
                            <CheckCircle2 className="size-4 text-green-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden overflow-y-auto flex-1 -mx-1 px-1 space-y-2">
                {displayedProducts.map((p, i) => {
                  const hasError = p.errors.length > 0;
                  return (
                    <div
                      key={i}
                      className={`rounded-xl border p-3 ${
                        hasError ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-gray-500">#{i + 1}</p>
                          <p className="font-semibold text-sm text-gray-900 break-words">
                            {p.title || '—'}
                          </p>
                        </div>
                        <div className="shrink-0">
                          {hasError ? (
                            <div className="flex items-center gap-1 bg-red-100 text-red-700 text-[11px] font-medium rounded-full px-2 py-0.5">
                              <AlertCircle className="size-3" />
                              <span>Xato</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-green-100 text-green-700 text-[11px] font-medium rounded-full px-2 py-0.5">
                              <CheckCircle2 className="size-3" />
                              <span>Tayyor</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                        <div>
                          <p className="text-gray-400 text-[10px] uppercase tracking-wide">Kategoriya</p>
                          <p className="font-medium break-words">{p.category || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[10px] uppercase tracking-wide">Subkategoriya</p>
                          <p className="font-medium break-words">{p.subcategory || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[10px] uppercase tracking-wide">Narx</p>
                          <p className="font-semibold">{p.price}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[10px] uppercase tracking-wide">Tan narx</p>
                          <p className="font-semibold">{p.costPrice || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[10px] uppercase tracking-wide">Ombor</p>
                          <p className="font-semibold">{p.stock}</p>
                        </div>
                      </div>

                      {hasError && (
                        <div className="mt-2 pt-2 border-t border-red-200">
                          <p className="text-[10px] uppercase tracking-wide text-red-500 mb-0.5">Xatoliklar</p>
                          <ul className="list-disc list-inside text-[11px] text-red-700 space-y-0.5">
                            {p.errors.map((err, ei) => (
                              <li key={ei}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              {importing && (
                <div className="mt-3">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">{progress}% yuklandi</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-3 pt-3 border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-xl cursor-pointer text-sm"
                  onClick={resetFile}
                  disabled={importing}
                >
                  Boshqa fayl
                </Button>
                <Button
                  className="flex-1 h-11 rounded-xl cursor-pointer bg-black text-white hover:bg-gray-900 text-sm"
                  onClick={handleImport}
                  disabled={importing || validProducts.length === 0}
                >
                  {importing
                    ? `Import qilinmoqda... ${progress}%`
                    : validProducts.length > 0
                      ? `${validProducts.length} ta import qilish`
                      : "Mavjud emas"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportProductsModal;
