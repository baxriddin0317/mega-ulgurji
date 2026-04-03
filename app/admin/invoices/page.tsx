"use client"
import React, { useEffect, useState, useMemo } from 'react';
import PanelTitle from '@/components/admin/PanelTitle';
import Search from '@/components/admin/Search';
import { useOrderStore } from '@/store/useOrderStore';
import { formatUZS } from '@/lib/formatPrice';
import { formatDateTimeShort } from "@/lib/formatDate";
import { getStatusInfo } from '@/lib/orderStatus';
import { FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';

const getStartDate = (p: string): number => {
  const now = new Date();
  if (p === 'today') { now.setHours(0,0,0,0); return now.getTime(); }
  if (p === 'week') { const d = now.getDay(); now.setDate(now.getDate() - d + (d===0?-6:1)); now.setHours(0,0,0,0); return now.getTime(); }
  if (p === 'month') { return new Date(now.getFullYear(), now.getMonth(), 1).getTime(); }
  return 0;
};

const InvoicesPage = () => {
  const { orders, fetchAllOrders, loadingOrders } = useOrderStore();
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const filteredOrders = useMemo(() => {
    const startMs = getStartDate(period);
    let result = orders.filter((o) => {
      const orderMs = o.date?.seconds ? o.date.seconds * 1000 : 0;
      if (orderMs < startMs) return false;
      if (search.length >= 2) {
        const q = search.toLowerCase();
        return o.clientName?.toLowerCase().includes(q) || o.clientPhone?.includes(q) || o.id?.toLowerCase().includes(q);
      }
      return true;
    });
    result.sort((a, b) => {
      if (sortBy === 'amount') return (b.totalPrice || 0) - (a.totalPrice || 0);
      return (b.date?.seconds || 0) - (a.date?.seconds || 0);
    });
    return result;
  }, [orders, period, search, sortBy]);

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
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { key: 'today', label: 'Bugun' },
            { key: 'week', label: 'Shu hafta' },
            { key: 'month', label: 'Shu oy' },
            { key: 'all', label: 'Barchasi' },
          ].map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === p.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setSortBy('date')} className={`px-3 py-1.5 rounded-full text-xs font-medium ${sortBy === 'date' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
            Sana bo&apos;yicha
          </button>
          <button onClick={() => setSortBy('amount')} className={`px-3 py-1.5 rounded-full text-xs font-medium ${sortBy === 'amount' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
            Summa bo&apos;yicha
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-3">{filteredOrders.length} ta faktura</p>

        {selectedInvoiceIds.size > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <Button onClick={() => {
              const ids = Array.from(selectedInvoiceIds).slice(0, 10);
              ids.forEach(id => window.open(`/admin/invoice/${id}`, '_blank'));
              toast.success(`${ids.length} ta faktura ochildi`);
            }} className="rounded-xl text-xs h-8 gap-1.5 bg-gray-900 text-white">
              <Printer className="size-3.5" /> {selectedInvoiceIds.size} ta chop etish
            </Button>
            <button onClick={() => setSelectedInvoiceIds(new Set())}
              className="text-xs text-gray-400 hover:text-gray-600">
              Bekor qilish
            </button>
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        {filteredOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Buyurtmalar topilmadi</p>
        ) : (
          <div className="space-y-2">
            {filteredOrders.map((order, idx) => {
              const statusInfo = getStatusInfo(order.status);
              const date = formatDateTimeShort(order.date);
              const invoiceNum = order.id.slice(-8).toUpperCase();

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 px-4 py-3 flex-wrap"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedInvoiceIds.has(order.id)}
                      onChange={() => {
                        const next = new Set(selectedInvoiceIds);
                        if (next.has(order.id)) next.delete(order.id); else next.add(order.id);
                        setSelectedInvoiceIds(next);
                      }}
                      className="size-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer mr-2"
                    />
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
