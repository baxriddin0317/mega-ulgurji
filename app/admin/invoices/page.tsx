"use client"
import React, { useEffect, useState, useMemo } from 'react';
import PanelTitle from '@/components/admin/PanelTitle';
import Search from '@/components/admin/Search';
import { useOrderStore } from '@/store/useOrderStore';
import { formatUZS } from '@/lib/formatPrice';
import { getStatusInfo } from '@/lib/orderStatus';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const InvoicesPage = () => {
  const { orders, fetchAllOrders, loadingOrders } = useOrderStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const filteredOrders = useMemo(() => {
    if (search.length < 2) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.clientName.toLowerCase().includes(q) ||
        o.clientPhone.includes(q) ||
        o.id.toLowerCase().includes(q)
    );
  }, [orders, search]);

  if (loadingOrders) {
    return (
      <div>
        <PanelTitle title="Schyot-fakturalar" />
        <div className="flex items-center justify-center p-10">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div>
      <PanelTitle title="Schyot-fakturalar" />
      <Search search={search} handleSearchChange={setSearch} placeholder="Mijoz nomi, telefon yoki ID bo'yicha qidirish" />

      <div className="px-4 py-3">
        {filteredOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Buyurtmalar topilmadi</p>
        ) : (
          <div className="space-y-2">
            {filteredOrders.map((order, idx) => {
              const statusInfo = getStatusInfo(order.status);
              const date = order.date?.seconds
                ? new Date(order.date.seconds * 1000).toLocaleDateString('uz-UZ')
                : '—';
              const invoiceNum = order.id.slice(-8).toUpperCase();

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 px-4 py-3 flex-wrap"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm text-gray-400 font-medium w-6 shrink-0">{idx + 1}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-900 capitalize truncate">
                        {order.clientName}
                      </p>
                      <p className="text-xs text-gray-500">{order.clientPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">#{invoiceNum}</p>
                      <p className="text-xs text-gray-500">{date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatUZS(order.totalPrice)}</p>
                      <p className="text-xs text-gray-500">{order.totalQuantity} ta</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusInfo.color} ${statusInfo.bg}`}
                    >
                      {statusInfo.label}
                    </span>
                    <Link href={`/admin/invoice/${order.id}`} target="_blank">
                      <Button
                        variant="outline"
                        className="rounded-xl cursor-pointer text-xs h-8 gap-1 border-teal-300 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800"
                      >
                        <FileText className="size-3.5" /> Faktura
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;
