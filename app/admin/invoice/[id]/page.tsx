"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { fireDB } from '@/firebase/config';
import { Order } from '@/lib/types';
import { formatUZS } from '@/lib/formatPrice';
import { getStatusInfo } from '@/lib/orderStatus';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InvoicePage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(fireDB, 'orders', id));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() } as Order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Buyurtma topilmadi</p>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const orderDate = order.date?.seconds
    ? new Date(order.date.seconds * 1000)
    : new Date();
  const invoiceNumber = order.id.slice(-8).toUpperCase();

  return (
    <div>
      {/* Print button — hidden during print */}
      <div className="print:hidden flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black">Schyot-faktura</h1>
        <Button
          onClick={() => window.print()}
          className="rounded-xl cursor-pointer gap-2 bg-black text-white hover:bg-black/90"
        >
          <Printer className="size-4" />
          Chop etish / PDF saqlash
        </Button>
      </div>

      {/* Invoice document */}
      <div className="bg-white border border-gray-200 rounded-2xl print:rounded-none print:border-0 print:shadow-none overflow-hidden max-w-[800px] mx-auto">

        {/* Header */}
        <div className="bg-gray-900 text-white px-8 py-6 print:bg-gray-900 print:text-white"
          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight">MEGAHOME ULGURJI</h2>
              <p className="text-gray-400 text-sm mt-0.5">Ulgurji savdo platformasi</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">SCHYOT-FAKTURA</p>
              <p className="text-xl font-bold mt-0.5">#{invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Date & Status bar */}
        <div className="flex items-center justify-between px-8 py-3 bg-gray-50 border-b border-gray-200"
          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Sana:</span>{' '}
            {orderDate.toLocaleDateString('uz-UZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {' '}&middot;{' '}
            {orderDate.toLocaleTimeString('uz-UZ', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${statusInfo.color} ${statusInfo.bg}`}
            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Customer info */}
        <div className="px-8 py-5 border-b border-gray-200">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Mijoz ma&apos;lumotlari</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Ism</p>
              <p className="font-bold text-gray-900 capitalize">{order.clientName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Telefon</p>
              <p className="font-bold text-gray-900">{order.clientPhone}</p>
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="px-8 py-5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Buyurtma tafsilotlari</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 font-semibold text-gray-600 w-8">#</th>
                <th className="text-left py-2 font-semibold text-gray-600">Mahsulot</th>
                <th className="text-left py-2 font-semibold text-gray-600">Kategoriya</th>
                <th className="text-right py-2 font-semibold text-gray-600">Narxi</th>
                <th className="text-center py-2 font-semibold text-gray-600 w-16">Soni</th>
                <th className="text-right py-2 font-semibold text-gray-600">Jami</th>
              </tr>
            </thead>
            <tbody>
              {(order.basketItems || []).map((item, idx) => {
                const unitPrice = Number(item.price);
                const subtotal = unitPrice * item.quantity;
                return (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 text-gray-500">{idx + 1}</td>
                    <td className="py-3 font-medium text-gray-900">{item.title}</td>
                    <td className="py-3 text-gray-500">{item.category}</td>
                    <td className="py-3 text-right text-gray-700">{formatUZS(unitPrice)}</td>
                    <td className="py-3 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">{formatUZS(subtotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-8 py-5 border-t-2 border-gray-200">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-8 text-sm">
              <span className="text-gray-500">Jami soni:</span>
              <span className="font-bold text-gray-900 w-36 text-right">{order.totalQuantity} ta</span>
            </div>
            <div className="flex items-center gap-8 text-lg mt-1">
              <span className="font-semibold text-gray-700">Jami summa:</span>
              <span className="font-black text-gray-900 w-36 text-right">{formatUZS(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 text-center"
          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          <p className="text-sm font-bold text-gray-700">MegaHome Ulgurji</p>
          <p className="text-xs text-gray-400 mt-0.5">Xaridingiz uchun rahmat!</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
