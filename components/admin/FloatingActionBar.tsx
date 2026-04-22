"use client";

import { Button } from "@/components/ui/button";
import { DollarSign, FolderInput, Package, Trash2, X } from "lucide-react";

interface FloatingActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkPriceUpdate: () => void;
  onBulkStockUpdate: () => void;
  onBatchCategoryMove?: () => void;
  onBulkDelete: () => void;
}

export default function FloatingActionBar({
  selectedCount, onClearSelection, onBulkPriceUpdate, onBulkStockUpdate, onBatchCategoryMove, onBulkDelete,
}: FloatingActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="fixed z-50 bottom-20 lg:bottom-6 left-2 right-2 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 flex items-center gap-1.5 sm:gap-3 bg-gray-900 text-white px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-2xl border border-gray-700 overflow-x-auto scrollbar-hide pb-[max(0.625rem,env(safe-area-inset-bottom))] lg:pb-3"
      style={{ maxWidth: "calc(100vw - 1rem)" }}
    >
      <span className="text-xs sm:text-sm font-medium mr-1 sm:mr-2 shrink-0">{selectedCount} ta</span>
      <Button size="sm" variant="ghost" onClick={onBulkPriceUpdate} className="h-9 text-amber-400 hover:text-amber-300 hover:bg-gray-800 gap-1.5 text-xs shrink-0">
        <DollarSign className="size-4" /> Narx
      </Button>
      <Button size="sm" variant="ghost" onClick={onBulkStockUpdate} className="h-9 text-blue-400 hover:text-blue-300 hover:bg-gray-800 gap-1.5 text-xs shrink-0">
        <Package className="size-4" /> Ombor
      </Button>
      {onBatchCategoryMove && (
        <Button size="sm" variant="ghost" onClick={onBatchCategoryMove}
          className="h-9 text-purple-400 hover:text-purple-300 hover:bg-gray-800 gap-1.5 text-xs shrink-0">
          <FolderInput className="size-4" /> <span className="hidden xs:inline">Kategoriya</span>
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={onBulkDelete} className="h-9 text-red-400 hover:text-red-300 hover:bg-gray-800 gap-1.5 text-xs shrink-0">
        <Trash2 className="size-4" /> <span className="hidden xs:inline">O&apos;chirish</span>
      </Button>
      <button
        onClick={onClearSelection}
        aria-label="Tanlashni bekor qilish"
        className="ml-auto sm:ml-2 p-2 -mr-1 rounded-lg hover:bg-gray-800 shrink-0"
      >
        <X className="size-4 text-gray-400" />
      </button>
    </div>
  );
}
