"use client";
import React, { useEffect, useMemo } from "react";
import PanelTitle from "@/components/admin/PanelTitle";
import StockMovementTable from "@/components/admin/StockMovementTable";
import useStockMovementStore from "@/store/useStockMovementStore";
import { toDate } from "@/lib/formatDate";
import { PackagePlus, PackageMinus, Settings2 } from "lucide-react";

const OmborPage = () => {
  const { movements, fetchMovements, loading } = useStockMovementStore();

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayKirim = useMemo(() => {
    return movements
      .filter((m) => {
        if (m.type !== "kirim") return false;
        const d = toDate(m.timestamp);
        return d !== null && d >= todayStart;
      })
      .reduce((sum, m) => sum + (m.quantity > 0 ? m.quantity : 0), 0);
  }, [movements, todayStart]);

  const todayChiqim = useMemo(() => {
    return movements
      .filter((m) => {
        if (m.type !== "sotish") return false;
        const d = toDate(m.timestamp);
        return d !== null && d >= todayStart;
      })
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
  }, [movements, todayStart]);

  const todayTuzatish = useMemo(() => {
    return movements.filter((m) => {
      if (m.type !== "tuzatish") return false;
      const d = toDate(m.timestamp);
      return d !== null && d >= todayStart;
    }).length;
  }, [movements, todayStart]);

  if (loading) {
    return (
      <div>
        <PanelTitle title="Ombor" />
        <div className="px-4 py-3">
          <p className="text-gray-500 text-sm">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PanelTitle title="Ombor" />
      <p className="px-4 -mt-2 mb-4 text-sm text-gray-500">
        Ombordagi barcha harkatlar tarixi
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 px-4 mb-6">
        {/* Today's incoming */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Bugungi kirim
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {todayKirim}
              </p>
              <p className="text-xs text-gray-500 mt-1">dona qabul qilindi</p>
            </div>
            <div className="flex items-center justify-center size-11 rounded-xl bg-green-100">
              <PackagePlus className="size-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Today's outgoing */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Bugungi chiqim
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {todayChiqim}
              </p>
              <p className="text-xs text-gray-500 mt-1">dona sotildi</p>
            </div>
            <div className="flex items-center justify-center size-11 rounded-xl bg-blue-100">
              <PackageMinus className="size-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Today's adjustments */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Tuzatishlar
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {todayTuzatish}
              </p>
              <p className="text-xs text-gray-500 mt-1">bugun tuzatildi</p>
            </div>
            <div className="flex items-center justify-center size-11 rounded-xl bg-amber-100">
              <Settings2 className="size-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Movement history table */}
      <div className="mb-4">
        <h3 className="font-bold text-lg px-4 mb-2">Harakatlar tarixi</h3>
        <StockMovementTable movements={movements} />
      </div>
    </div>
  );
};

export default OmborPage;
