"use client"
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ParsedProduct, parseProductsFromFile } from '@/lib/importExcel';
import useCategoryStore from '@/store/useCategoryStore';
import useProductStore from '@/store/useProductStore';
import { Upload, AlertCircle, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImportProductsModalProps {
  onClose: () => void;
}

const ImportProductsModal = ({ onClose }: ImportProductsModalProps) => {
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { categories } = useCategoryStore();
  const { bulkAddProducts } = useProductStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    try {
      const products = await parseProductsFromFile(file, categories);
      setParsedProducts(products);
    } catch {
      toast.error("Faylni o'qishda xatolik");
    }
  };

  const validProducts = parsedProducts.filter((p) => p.errors.length === 0);
  const errorCount = parsedProducts.length - validProducts.length;

  const handleImport = async () => {
    if (validProducts.length === 0) return;
    setImporting(true);
    try {
      await bulkAddProducts(
        validProducts.map((p) => ({
          title: p.title,
          category: p.category,
          subcategory: p.subcategory,
          price: p.price,
          costPrice: p.costPrice,
          stock: p.stock,
          description: p.description,
        }))
      );
      toast.success(`${validProducts.length} ta mahsulot muvaffaqiyatli import qilindi`);
      onClose();
    } catch {
      toast.error("Import qilishda xatolik yuz berdi");
    } finally {
      setImporting(false);
    }
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
          /* File upload area */
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-black transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-10 mx-auto text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700">
              Excel yoki CSV faylni tanlang
            </p>
            <p className="text-xs text-gray-400 mt-1">
              .xlsx, .xls, .csv formatlar qo&apos;llab-quvvatlanadi
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
                    <th className="px-3 py-2 text-left font-medium">Narxi</th>
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
                      <td className="px-3 py-2">{p.price}</td>
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

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-xl cursor-pointer"
                onClick={() => {
                  setParsedProducts([]);
                  setFileName('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Boshqa fayl tanlash
              </Button>
              <Button
                className="flex-1 rounded-xl cursor-pointer bg-black text-white hover:bg-black/90"
                onClick={handleImport}
                disabled={importing || validProducts.length === 0}
              >
                {importing
                  ? "Import qilinmoqda..."
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
