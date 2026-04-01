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

      toast.success(`${validProducts.length} ta mahsulot muvaffaqiyatli import qilindi!`);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 mx-4 max-w-3xl w-full shadow-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black">Mahsulotlarni import qilish</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        {parsedProducts.length === 0 ? (
          /* File upload area with drag & drop */
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
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
                <FileUp className="size-12 mx-auto text-black mb-3 animate-bounce" />
              ) : (
                <Upload className="size-10 mx-auto text-gray-400 mb-3" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-700">
              {dragging ? 'Faylni shu yerga tashlang' : 'Faylni tanlang yoki shu yerga tashlang'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              .xlsx, .xls, .csv formatlar qo&apos;llab-quvvatlanadi
            </p>
            <p className="text-xs text-gray-400 mt-3">
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
          /* Preview */
          <>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{fileName}</span> — {parsedProducts.length} ta qator
              </p>
              {errorCount > 0 && (
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errorCount} ta xatolik
                </span>
              )}
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="size-3" /> {validProducts.length} ta tayyor
              </span>
            </div>

            <div className="overflow-auto flex-1 rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
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
                  {parsedProducts.map((p, i) => (
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

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-xl cursor-pointer"
                onClick={resetFile}
                disabled={importing}
              >
                Boshqa fayl tanlash
              </Button>
              <Button
                className="flex-1 rounded-xl cursor-pointer bg-black text-white hover:bg-black/90"
                onClick={handleImport}
                disabled={importing || validProducts.length === 0}
              >
                {importing
                  ? `Import qilinmoqda... ${progress}%`
                  : `${validProducts.length} ta mahsulotni import qilish`}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImportProductsModal;
