"use client";
import React, { useEffect, useMemo } from 'react';
import PanelTitle from '@/components/admin/PanelTitle';
import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/authStore';
import type { UserData } from '@/store/authStore';
import { formatUZS } from '@/lib/formatPrice';
import { Crown, TrendingUp, ShoppingCart, Phone, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportCustomersToExcel } from '@/lib/importExcel';

const CustomersPage = () => {
  const { orders, fetchAllOrders, loadingOrders } = useOrderStore();
  const { users, fetchAllUsers } = useAuthStore();

  useEffect(() => { fetchAllOrders(); }, [fetchAllOrders]);
  useEffect(() => {
    const unsub = fetchAllUsers() as (() => void) | undefined;
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [fetchAllUsers]);

  const customerStats = useMemo(() => {
    const statsMap: Record<string, {
      user: UserData | null;
      name: string;
      phone: string;
      totalOrders: number;
      deliveredOrders: number;
      totalSpent: number;
      totalProfit: number;
      lastOrderDate: number;
    }> = {};

    for (const order of orders) {
      const key = order.userUid || order.clientPhone;
      if (!statsMap[key]) {
        const user = users.find((u: UserData) => u.uid === order.userUid) || null;
        statsMap[key] = {
          user,
          name: user?.name || order.clientName,
          phone: user?.phone || order.clientPhone,
          totalOrders: 0,
          deliveredOrders: 0,
          totalSpent: 0,
          totalProfit: 0,
          lastOrderDate: 0,
        };
      }
      const s = statsMap[key];
      s.totalOrders++;
      const orderDate = order.date?.seconds ? order.date.seconds * 1000 : 0;
      if (orderDate > s.lastOrderDate) s.lastOrderDate = orderDate;

      if (order.status === 'yetkazildi') {
        s.deliveredOrders++;
        s.totalSpent += order.totalPrice || 0;
        let cost = 0;
        for (const item of (order.basketItems || [])) {
          cost += (item.costPrice || 0) * item.quantity;
        }
        s.totalProfit += (order.totalPrice || 0) - cost;
      }
    }

    return Object.values(statsMap)
      .filter((s) => s.totalOrders > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders, users]);

  if (loadingOrders) return <div className="flex items-center justify-center p-10">Yuklanmoqda...</div>;

  return (
    <div>
      <PanelTitle title="Mijozlar reytingi" />
      {customerStats.length > 0 && (
        <div className="px-4 pb-3">
          <Button
            variant="outline"
            className="rounded-xl cursor-pointer text-xs h-8 gap-1"
            onClick={() => exportCustomersToExcel(customerStats)}
          >
            <Download className="size-3.5" /> Mijozlarni Excel yuklab olish
          </Button>
        </div>
      )}
      <div className="px-4 py-3">
        {customerStats.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Mijozlar mavjud emas</p>
        ) : (
          <div className="space-y-3">
            {customerStats.map((customer, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const crownColor = rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : 'text-amber-700';
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-xl border p-4 ${isTop3 ? 'border-yellow-200 shadow-md' : 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center size-10 rounded-full font-bold text-sm ${
                        isTop3 ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        {isTop3 ? <Crown className={`size-5 ${crownColor}`} /> : rank}
                      </div>
                      <div>
                        <p className={`font-bold ${isTop3 ? 'text-lg' : 'text-sm'}`}>{customer.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="size-3" /> {customer.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 text-right">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Buyurtmalar</p>
                        <p className="font-bold flex items-center gap-1 justify-end">
                          <ShoppingCart className="size-3.5 text-gray-400" /> {customer.totalOrders}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Xaridlar</p>
                        <p className="font-bold text-green-600">{formatUZS(customer.totalSpent)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Foyda</p>
                        <p className="font-bold text-amber-600 flex items-center gap-1 justify-end">
                          <TrendingUp className="size-3.5" /> {formatUZS(customer.totalProfit)}
                        </p>
                      </div>
                      {customer.lastOrderDate > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">Oxirgi</p>
                          <p className="text-xs text-gray-600">{new Date(customer.lastOrderDate).toLocaleDateString('uz-UZ')}</p>
                        </div>
                      )}
                    </div>
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

export default CustomersPage;
