"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useOrderStore } from "@/store/useOrderStore";
import { ORDER_STATUSES, getStatusInfo } from "@/lib/orderStatus";
import type { OrderStatus } from "@/lib/types";
import toast from "react-hot-toast";

interface BulkOrderStatusModalProps {
  selectedOrderIds: string[];
  onClose: () => void;
}

export default function BulkOrderStatusModal({ selectedOrderIds, onClose }: BulkOrderStatusModalProps) {
  const { bulkUpdateOrderStatus } = useOrderStore();
  const [status, setStatus] = useState<OrderStatus>("tasdiqlangan");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const results = await bulkUpdateOrderStatus(selectedOrderIds, status);
      toast.success(`${results.success} ta buyurtma yangilandi${results.failed > 0 ? `, ${results.failed} ta xatolik` : ""}`);
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
        <h2 className="text-lg font-bold text-gray-900 mb-1">Statusni ommaviy o&apos;zgartirish</h2>
        <p className="text-sm text-gray-500 mb-5">{selectedOrderIds.length} ta buyurtma tanlangan</p>
        <div className="space-y-2">
          {ORDER_STATUSES.map((s) => {
            const info = getStatusInfo(s.value);
            return (
              <button key={s.value} onClick={() => setStatus(s.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  status === s.value ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}>
                <span className={`inline-block w-3 h-3 rounded-full ${info.bg}`} />
                {s.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-3 mt-5">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Bekor qilish</Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 rounded-xl bg-gray-900 hover:bg-gray-800 text-white">
            {loading ? "Yangilanmoqda..." : `${selectedOrderIds.length} ta yangilash`}
          </Button>
        </div>
      </div>
    </div>
  );
}
