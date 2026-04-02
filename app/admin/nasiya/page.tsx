"use client";
import React, { useEffect, useState, useMemo } from 'react';
import PanelTitle from '@/components/admin/PanelTitle';
import { useNasiyaStore, NasiyaRecord } from '@/store/useNasiyaStore';
import { useOrderStore } from '@/store/useOrderStore';
import { formatUZS } from '@/lib/formatPrice';
import { formatDateTimeShort } from "@/lib/formatDate";
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { CreditCard, Plus, DollarSign, AlertTriangle, CheckCircle, X } from 'lucide-react';

const NasiyaPage = () => {
  const { records, fetchNasiya, createNasiya, recordPayment, loading } = useNasiyaStore();
  const { orders, fetchAllOrders } = useOrderStore();
  const [showCreate, setShowCreate] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('naqd');

  useEffect(() => { fetchNasiya(); }, [fetchNasiya]);
  useEffect(() => { fetchAllOrders(); }, [fetchAllOrders]);

  // Stats
  const activeRecords = useMemo(
    () => records.filter((r) => r.status === 'active'),
    [records]
  );
  const totalDue = useMemo(
    () => activeRecords.reduce((s, r) => s + r.remainingAmount, 0),
    [activeRecords]
  );
  const totalPaid = useMemo(
    () => records.reduce((s, r) => s + r.paidAmount, 0),
    [records]
  );

  // Delivered orders without nasiya (for creating new nasiya)
  const deliveredOrders = useMemo(
    () => orders.filter((o) => o.status === 'yetkazildi'),
    [orders]
  );
  const nasiyaOrderIds = useMemo(() => new Set(records.map(r => r.orderId)), [records]);
  const ordersWithoutNasiya = useMemo(
    () => deliveredOrders.filter((o) => !nasiyaOrderIds.has(o.id)),
    [deliveredOrders, nasiyaOrderIds]
  );

  const handleCreateNasiya = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    try {
      await createNasiya({
        userId: order.userUid,
        userName: order.clientName,
        userPhone: order.clientPhone,
        orderId: order.id,
        originalAmount: order.totalPrice,
        note: '',
      });
      toast.success("Nasiya yaratildi");
      setShowCreate(false);
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handlePayment = async (nasiyaId: string) => {
    if (payAmount <= 0) return toast.error("Summani kiriting");
    try {
      await recordPayment(nasiyaId, payAmount, payMethod);
      toast.success("To'lov qabul qilindi");
      setPayingId(null);
      setPayAmount(0);
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  if (loading) return <div className="flex items-center justify-center p-10">Yuklanmoqda...</div>;

  return (
    <div>
      <PanelTitle title="Nasiya (Qarzlar)" />
      <div className="px-4 py-3">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-red-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="size-4 text-red-600" />
              <p className="text-xs text-gray-500 uppercase font-semibold">Umumiy qarz</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatUZS(totalDue)}</p>
            <p className="text-xs text-gray-500">{activeRecords.length} ta faol nasiya</p>
          </div>
          <div className="bg-white rounded-xl border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="size-4 text-green-600" />
              <p className="text-xs text-gray-500 uppercase font-semibold">Jami to&apos;langan</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatUZS(totalPaid)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="size-4 text-gray-600" />
              <p className="text-xs text-gray-500 uppercase font-semibold">Jami nasiyalar</p>
            </div>
            <p className="text-2xl font-bold">{records.length}</p>
          </div>
        </div>

        {/* Create button */}
        <div className="mb-4">
          <Button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-black text-white rounded-xl cursor-pointer gap-1"
          >
            <Plus className="size-4" /> Nasiya yaratish
          </Button>
        </div>

        {/* Create form — select from delivered orders */}
        {showCreate && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
            <h3 className="font-bold text-sm mb-3">Buyurtmadan nasiya yaratish:</h3>
            {ordersWithoutNasiya.length === 0 ? (
              <p className="text-sm text-gray-500">Nasiya uchun buyurtma topilmadi</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {ordersWithoutNasiya.map((order) => (
                  <div key={order.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
                    <div>
                      <p className="font-semibold text-sm">{order.clientName}</p>
                      <p className="text-xs text-gray-500">{order.clientPhone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-green-700">{formatUZS(order.totalPrice)}</p>
                      <Button
                        size="sm"
                        onClick={() => handleCreateNasiya(order.id)}
                        className="bg-red-500 text-white rounded-lg cursor-pointer text-xs"
                      >
                        Nasiya qilish
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nasiya records list */}
        <div className="space-y-3">
          {records.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Nasiyalar mavjud emas</p>
          ) : (
            records.map((record) => (
              <NasiyaCard
                key={record.id}
                record={record}
                isPaying={payingId === record.id}
                payAmount={payAmount}
                payMethod={payMethod}
                onStartPay={() => { setPayingId(record.id); setPayAmount(0); }}
                onCancelPay={() => setPayingId(null)}
                onAmountChange={setPayAmount}
                onMethodChange={setPayMethod}
                onConfirmPay={() => handlePayment(record.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const NasiyaCard = ({
  record, isPaying, payAmount, payMethod,
  onStartPay, onCancelPay, onAmountChange, onMethodChange, onConfirmPay,
}: {
  record: NasiyaRecord;
  isPaying: boolean;
  payAmount: number;
  payMethod: string;
  onStartPay: () => void;
  onCancelPay: () => void;
  onAmountChange: (v: number) => void;
  onMethodChange: (v: string) => void;
  onConfirmPay: () => void;
}) => {
  const isPaid = record.status === 'paid_full';
  const progress = record.originalAmount > 0
    ? Math.min(100, (record.paidAmount / record.originalAmount) * 100)
    : 0;

  return (
    <div className={`bg-white rounded-xl border p-4 ${isPaid ? 'border-green-200 opacity-70' : 'border-red-200'}`}>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
        <div>
          <p className="font-bold">{record.userName}</p>
          <p className="text-xs text-gray-500">{record.userPhone}</p>
        </div>
        <div className="text-right">
          <p className={`text-xs uppercase font-bold ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
            {isPaid ? "To'langan" : "Faol"}
          </p>
          <p className="text-lg font-bold text-red-600">{formatUZS(record.remainingAmount)}</p>
          <p className="text-xs text-gray-500">/ {formatUZS(record.originalAmount)}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all ${isPaid ? 'bg-green-500' : 'bg-amber-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mb-3">
        {formatUZS(record.paidAmount)} to&apos;langan ({progress.toFixed(0)}%)
      </p>

      {/* Payment history */}
      {record.paymentHistory && record.paymentHistory.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">To&apos;lovlar tarixi:</p>
          <div className="space-y-1">
            {record.paymentHistory.map((p, idx) => (
              <div key={idx} className="flex justify-between text-xs bg-gray-50 rounded-lg px-3 py-1.5">
                <span className="text-gray-600">{formatDateTimeShort(new Date(p.date))} &middot; {p.method}</span>
                <span className="font-bold text-green-700">+{formatUZS(p.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment form */}
      {!isPaid && (
        isPaying ? (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="number"
              min="1"
              placeholder="Summa"
              className="flex-1 min-w-32 rounded-lg bg-gray-100 h-9 px-3 text-sm focus:outline-none"
              value={payAmount || ''}
              onChange={(e) => onAmountChange(parseInt(e.target.value) || 0)}
            />
            <select
              className="rounded-lg bg-gray-100 h-9 px-3 text-sm cursor-pointer"
              value={payMethod}
              onChange={(e) => onMethodChange(e.target.value)}
            >
              <option value="naqd">Naqd</option>
              <option value="karta">Karta</option>
              <option value="otkazma">O&apos;tkazma</option>
            </select>
            <Button size="sm" onClick={onConfirmPay} className="bg-green-600 text-white rounded-lg cursor-pointer text-xs">
              <DollarSign className="size-3.5" /> Qabul qilish
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelPay} className="cursor-pointer">
              <X className="size-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={onStartPay}
            className="bg-amber-500 text-white rounded-lg cursor-pointer text-xs gap-1"
          >
            <DollarSign className="size-3.5" /> To&apos;lov qabul qilish
          </Button>
        )
      )}
    </div>
  );
};

export default NasiyaPage;
