"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import useCategoryStore from "@/store/useCategoryStore";
import useProductStore from "@/store/useProductStore";
import toast from "react-hot-toast";
import { writeBatch, doc } from "firebase/firestore";
import { fireDB } from "@/firebase/config";

interface BatchCategoryMoveModalProps {
  selectedIds: string[];
  onClose: () => void;
}

export default function BatchCategoryMoveModal({ selectedIds, onClose }: BatchCategoryMoveModalProps) {
  const { categories } = useCategoryStore();
  const { products } = useProductStore();
  const [targetCategory, setTargetCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // Show which categories the selected products are currently in
  const currentCategories = new Set(
    products.filter(p => selectedIds.includes(p.id)).map(p => p.category)
  );

  const handleMove = async () => {
    if (!targetCategory) { toast.error("Kategoriyani tanlang"); return; }
    const categoryExists = categories.some((c) => c.name === targetCategory);
    if (!categoryExists) { toast.error("Tanlangan kategoriya mavjud emas"); return; }
    setLoading(true);
    try {
      const batch = writeBatch(fireDB);
      for (const id of selectedIds) {
        batch.update(doc(fireDB, "products", id), { category: targetCategory, subcategory: '' });
      }
      await batch.commit();
      toast.success(`${selectedIds.length} ta mahsulot "${targetCategory}" ga ko'chirildi`);
      onClose();
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100">
          <X className="size-5 text-gray-400" />
        </button>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Kategoriyani o&apos;zgartirish</h2>
        <p className="text-sm text-gray-500 mb-2">{selectedIds.length} ta mahsulot tanlangan</p>
        <p className="text-xs text-gray-400 mb-4">
          Hozirgi: {Array.from(currentCategories).join(", ")}
        </p>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setTargetCategory(cat.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-left ${
                targetCategory === cat.name
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}>
              {cat.name}
              {cat.subcategory?.length > 0 && (
                <span className={`text-xs ${targetCategory === cat.name ? 'text-gray-300' : 'text-gray-400'}`}>
                  ({cat.subcategory.length} subkategoriya)
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-5">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Bekor qilish</Button>
          <Button onClick={handleMove} disabled={loading || !targetCategory}
            className="flex-1 rounded-xl bg-gray-900 hover:bg-gray-800 text-white">
            {loading ? "Ko'chirilmoqda..." : "Ko'chirish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
