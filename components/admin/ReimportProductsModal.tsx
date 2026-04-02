"use client"
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import useProductStore from '@/store/useProductStore';
import { Upload, X, FileUp, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface ReimportProductsModalProps {
  onClose: () => void;
}

interface ChangeDetail {
  field: string;
  oldVal: string;
  newVal: string;
}

interface ParsedUpdate {
  id: string;
  title: string;
  changes: ChangeDetail[];
  status: 'updated' | 'unchanged' | 'not_found';
  updateData: Record<string, unknown>;
}

function findColumn(headers: string[], keywords: string[]): string | null {
  const lower = headers.map(h => h.toLowerCase().trim());
  for (const kw of keywords) {
    const idx = lower.findIndex(h => h.includes(kw));
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function formatValue(val: unknown): string {
  if (val === undefined || val === null || val === '') return '—';
  return String(val);
}

const ReimportProductsModal = ({ onClose }: ReimportProductsModalProps) => {
  const [parsedUpdates, setParsedUpdates] = useState<ParsedUpdate[]>([]);
  const [updating, setUpdating] = useState(false);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { products, bulkUpdateProducts } = useProductStore();

  const processFile = useCallback(async (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(ext)) {
      toast.error("Faqat Excel (.xlsx, .xls) yoki CSV fayllar qo'llab-quvvatlanadi");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

        if (rows.length === 0) {
          toast.error("Faylda ma'lumot topilmadi");
          return;
        }

        const headers = Object.keys(rows[0]);

        // Find ID column
        const idCol = findColumn(headers, ['id']);
        if (!idCol) {
          toast.error("ID ustuni topilmadi. Eksport qilingan faylni ishlating.");
          return;
        }

        // Find data columns
        const titleCol = findColumn(headers, ['nomi', 'name', 'title', 'mahsulot']);
        const priceCol = findColumn(headers, ['sotish', 'narxi', 'price']);
        const costCol = findColumn(headers, ['tan', 'cost', 'kelish']);
        const stockCol = findColumn(headers, ['ombor', 'stock', 'soni']);
        const categoryCol = findColumn(headers, ['kategoriya', 'category']);
        const subcategoryCol = findColumn(headers, ['subkategoriya', 'subcategory']);
        const descCol = findColumn(headers, ['tavsif', 'description']);

        const updates: ParsedUpdate[] = [];

        for (const row of rows) {
          const id = String(row[idCol] || '').trim();
          if (!id) continue;

          const product = products.find(p => p.id === id);

          if (!product) {
            updates.push({
              id,
              title: titleCol ? String(row[titleCol] || '') : id,
              changes: [],
              status: 'not_found',
              updateData: {},
            });
            continue;
          }

          const changes: ChangeDetail[] = [];
          const updateData: Record<string, unknown> = {};

          // Compare title
          if (titleCol && row[titleCol] !== undefined) {
            const newTitle = String(row[titleCol]).trim();
            if (newTitle && newTitle !== product.title) {
              changes.push({ field: 'Nomi', oldVal: product.title, newVal: newTitle });
              updateData.title = newTitle;
            }
          }

          // Compare price (stored as string)
          if (priceCol && row[priceCol] !== undefined) {
            const newPrice = String(row[priceCol]).trim();
            if (newPrice && newPrice !== product.price && newPrice !== '0') {
              changes.push({ field: 'Narx', oldVal: product.price, newVal: newPrice });
              updateData.price = newPrice;
            }
          }

          // Compare cost price
          if (costCol && row[costCol] !== undefined) {
            const newCost = Number(row[costCol]);
            if (!isNaN(newCost) && newCost !== (product.costPrice || 0)) {
              changes.push({ field: 'Tan narx', oldVal: String(product.costPrice || 0), newVal: String(newCost) });
              updateData.costPrice = newCost;
            }
          }

          // Compare stock
          if (stockCol && row[stockCol] !== undefined) {
            const newStock = Number(row[stockCol]);
            if (!isNaN(newStock) && newStock !== (product.stock || 0)) {
              changes.push({ field: 'Ombor', oldVal: String(product.stock || 0), newVal: String(newStock) });
              updateData.stock = newStock;
            }
          }

          // Compare category
          if (categoryCol && row[categoryCol] !== undefined) {
            const newCat = String(row[categoryCol]).trim();
            if (newCat && newCat !== product.category) {
              changes.push({ field: 'Kategoriya', oldVal: product.category, newVal: newCat });
              updateData.category = newCat;
            }
          }

          // Compare subcategory
          if (subcategoryCol && row[subcategoryCol] !== undefined) {
            const newSubcat = String(row[subcategoryCol]).trim();
            if (newSubcat !== (product.subcategory || '')) {
              changes.push({ field: 'Subkategoriya', oldVal: product.subcategory || '—', newVal: newSubcat || '—' });
              updateData.subcategory = newSubcat;
            }
          }

          // Compare description
          if (descCol && row[descCol] !== undefined) {
            const newDesc = String(row[descCol]).trim();
            if (newDesc !== (product.description || '')) {
              changes.push({ field: 'Tavsif', oldVal: (product.description || '').substring(0, 30) + (product.description && product.description.length > 30 ? '...' : ''), newVal: newDesc.substring(0, 30) + (newDesc.length > 30 ? '...' : '') });
              updateData.description = newDesc;
            }
          }

          updates.push({
            id,
            title: titleCol ? String(row[titleCol] || product.title) : product.title,
            changes,
            status: changes.length > 0 ? 'updated' : 'unchanged',
            updateData,
          });
        }

        if (updates.length === 0) {
          toast.error("Faylda yangilanadigan ma'lumot topilmadi");
          return;
        }

        setParsedUpdates(updates);
      } catch {
        toast.error("Faylni o'qishda xatolik yuz berdi");
      }
    };
    reader.onerror = () => toast.error("Faylni o'qishda xatolik yuz berdi");
    reader.readAsArrayBuffer(file);
  }, [products]);

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

  const updatedItems = parsedUpdates.filter(u => u.status === 'updated');
  const unchangedItems = parsedUpdates.filter(u => u.status === 'unchanged');
  const errorItems = parsedUpdates.filter(u => u.status === 'not_found');

  const handleUpdate = async () => {
    if (updatedItems.length === 0) return;
    setUpdating(true);

    try {
      const updates = updatedItems.map(u => ({
        id: u.id,
        ...u.updateData as { title?: string; price?: string; costPrice?: number; stock?: number; category?: string; subcategory?: string; description?: string },
      }));

      await bulkUpdateProducts(updates);
      toast.success(`${updatedItems.length} ta mahsulot muvaffaqiyatli yangilandi!`);
      onClose();
    } catch {
      toast.error("Yangilashda xatolik yuz berdi");
    } finally {
      setUpdating(false);
    }
  };

  const resetFile = () => {
    setParsedUpdates([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl p-6 mx-4 max-w-2xl w-full shadow-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black">Mahsulotlarni yangilash (reimport)</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        {parsedUpdates.length === 0 ? (
          /* File upload area with drag & drop */
          <>
            <p className="text-sm text-gray-500 mb-4">
              Avval &quot;Tahrirlash uchun eksport&quot; orqali yuklab olingan va tahrirlangan Excel faylni yuklang.
            </p>
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                dragging
                  ? 'border-orange-400 bg-orange-50 scale-[1.01]'
                  : 'border-gray-300 hover:border-orange-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className={`transition-transform ${dragging ? 'scale-110' : ''}`}>
                {dragging ? (
                  <FileUp className="size-12 mx-auto text-orange-500 mb-3 animate-bounce" />
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
              <p className="text-xs text-orange-500 mt-3 font-medium">
                Faylda ID ustuni bo&apos;lishi shart!
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </>
        ) : (
          /* Preview */
          <>
            {/* Summary */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{fileName}</span> — {parsedUpdates.length} ta qator
              </p>
            </div>
            <div className="flex gap-3 mb-3 flex-wrap">
              {updatedItems.length > 0 && (
                <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1 flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> {updatedItems.length} ta yangilanadi
                </span>
              )}
              {unchangedItems.length > 0 && (
                <span className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
                  {unchangedItems.length} ta o&apos;zgarishsiz
                </span>
              )}
              {errorItems.length > 0 && (
                <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1 flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errorItems.length} ta xatolik
                </span>
              )}
            </div>

            {/* Preview table */}
            <div className="overflow-auto flex-1 rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">Nomi</th>
                    <th className="px-3 py-2 text-left font-medium">O&apos;zgarishlar</th>
                    <th className="px-3 py-2 text-left font-medium">Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedUpdates.map((u, i) => (
                    <tr
                      key={u.id}
                      className={`border-t ${
                        u.status === 'updated'
                          ? 'bg-green-50'
                          : u.status === 'not_found'
                            ? 'bg-red-50'
                            : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                      <td className="px-3 py-2 font-medium max-w-[200px] truncate">
                        {u.title || '—'}
                      </td>
                      <td className="px-3 py-2">
                        {u.status === 'updated' ? (
                          <div className="flex flex-col gap-0.5">
                            {u.changes.map((c, ci) => (
                              <span key={ci} className="text-xs text-gray-700">
                                <span className="font-medium">{c.field}:</span>{' '}
                                <span className="text-red-500 line-through">{formatValue(c.oldVal)}</span>
                                {' '}
                                <ArrowRight className="inline size-3 text-gray-400" />
                                {' '}
                                <span className="text-green-600 font-medium">{formatValue(c.newVal)}</span>
                              </span>
                            ))}
                          </div>
                        ) : u.status === 'not_found' ? (
                          <span className="text-xs text-red-600">ID bazada topilmadi</span>
                        ) : (
                          <span className="text-xs text-gray-400">O&apos;zgarish yo&apos;q</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {u.status === 'updated' ? (
                          <CheckCircle2 className="size-4 text-green-500" />
                        ) : u.status === 'not_found' ? (
                          <AlertCircle className="size-4 text-red-500" />
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-xl cursor-pointer"
                onClick={resetFile}
                disabled={updating}
              >
                Boshqa fayl tanlash
              </Button>
              <Button
                className="flex-1 rounded-xl cursor-pointer bg-orange-600 text-white hover:bg-orange-700"
                onClick={handleUpdate}
                disabled={updating || updatedItems.length === 0}
              >
                {updating
                  ? 'Yangilanmoqda...'
                  : updatedItems.length > 0
                    ? `${updatedItems.length} ta mahsulotni yangilash`
                    : "O'zgarish topilmadi"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReimportProductsModal;
