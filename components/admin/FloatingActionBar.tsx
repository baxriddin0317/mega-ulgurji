"use client";

import { Button } from "@/components/ui/button";
import { DollarSign, Package, Trash2, X } from "lucide-react";

interface FloatingActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkPriceUpdate: () => void;
  onBulkStockUpdate: () => void;
  onBulkDelete: () => void;
}

export default function FloatingActionBar({
  selectedCount, onClearSelection, onBulkPriceUpdate, onBulkStockUpdate, onBulkDelete,
}: FloatingActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-700">
      <span className="text-sm font-medium mr-2">{selectedCount} ta tanlangan</span>
      <Button size="sm" variant="ghost" onClick={onBulkPriceUpdate} className="text-amber-400 hover:text-amber-300 hover:bg-gray-800 gap-1.5 text-xs">
        <DollarSign className="size-3.5" /> Narx
      </Button>
      <Button size="sm" variant="ghost" onClick={onBulkStockUpdate} className="text-blue-400 hover:text-blue-300 hover:bg-gray-800 gap-1.5 text-xs">
        <Package className="size-3.5" /> Ombor
      </Button>
      <Button size="sm" variant="ghost" onClick={onBulkDelete} className="text-red-400 hover:text-red-300 hover:bg-gray-800 gap-1.5 text-xs">
        <Trash2 className="size-3.5" /> O&apos;chirish
      </Button>
      <button onClick={onClearSelection} className="ml-2 p-1 rounded-lg hover:bg-gray-800">
        <X className="size-4 text-gray-400" />
      </button>
    </div>
  );
}
