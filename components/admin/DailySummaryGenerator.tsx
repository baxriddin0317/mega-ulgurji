"use client"
import { useEffect } from 'react';
import { useOrderStore } from '@/store/useOrderStore';
import useProductStore from '@/store/useProductStore';
import { useNotificationStore } from '@/store/useNotificationStore';

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DailySummaryGenerator = () => {
  const { orders } = useOrderStore();
  const { products } = useProductStore();
  const { _lastSummaryDate, addDailySummary, notifications } = useNotificationStore();

  useEffect(() => {
    const today = getTodayString();
    if (_lastSummaryDate === today) return;
    // Wait for at least one store to have data
    if (orders.length === 0 && products.length === 0) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const startMs = todayStart.getTime();

    const todayOrders = orders.filter((o) => {
      if (!o.date?.seconds) return false;
      return o.date.seconds * 1000 >= startMs;
    });

    const delivered = todayOrders.filter((o) => o.status === 'yetkazildi');
    const cancelled = todayOrders.filter((o) => o.status === 'bekor_qilindi');
    const newOrd = todayOrders.filter((o) => o.status === 'yangi');

    const revenue = delivered.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const profit = delivered.reduce((s, o) => {
      const cost = (o.basketItems || []).reduce(
        (c, item) => c + (item.costPrice || 0) * item.quantity,
        0
      );
      return s + ((o.totalPrice || 0) - cost);
    }, 0);

    const lowStockCount = products.filter(
      (p) => p.stock !== undefined && p.stock !== null && (p.stock as number) <= 5
    ).length;

    const newUsers = notifications.filter(
      (n) => n.type === 'new_user' && n.timestamp >= startMs
    ).length;

    addDailySummary({
      totalOrders: todayOrders.length,
      newOrders: newOrd.length,
      deliveredOrders: delivered.length,
      cancelledOrders: cancelled.length,
      revenue,
      profit,
      lowStockCount,
      newUsers,
      date: today,
    });
  }, [orders, products, _lastSummaryDate, addDailySummary, notifications]);

  return null;
};

export default DailySummaryGenerator;
