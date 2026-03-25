"use client";
import React from "react";
import { ShoppingCart, UserPlus, TrendingUp } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { formatUZS } from "@/lib/formatPrice";
import Link from "next/link";
import { ShineBorder } from "@/components/ui/shine-border";

const DashboardSummary = () => {
  const { notifications } = useNotificationStore();

  const unreadOrders = notifications.filter((n) => !n.read && n.type === "new_order");
  const unreadUsers = notifications.filter((n) => !n.read && n.type === "new_user");
  const newRevenue = unreadOrders.reduce((sum, n) => sum + (n.orderData?.totalPrice || 0), 0);
  const totalOrders = notifications.filter((n) => n.type === "new_order").length;
  const totalUsers = notifications.filter((n) => n.type === "new_user").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* New Orders Card */}
      <Link href="/admin/orders" className="group">
        <ShineBorder
          color={unreadOrders.length > 0 ? ["#22c55e", "#16a34a", "#4ade80"] : ["#d1d5db"]}
          borderWidth={unreadOrders.length > 0 ? 2 : 1}
          duration={unreadOrders.length > 0 ? 8 : 20}
          className="hover:shadow-md transition-shadow"
        >
          <div className="relative overflow-hidden w-full rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Yangi buyurtmalar</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{unreadOrders.length}</p>
                <p className="text-xs text-gray-500 mt-1">Jami: {totalOrders} ta</p>
              </div>
              <div className={`flex items-center justify-center size-11 rounded-xl ${unreadOrders.length > 0 ? "bg-green-100" : "bg-gray-100"}`}>
                <ShoppingCart className={`size-5 ${unreadOrders.length > 0 ? "text-green-600" : "text-gray-400"}`} />
              </div>
            </div>
            {unreadOrders.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />
            )}
          </div>
        </ShineBorder>
      </Link>

      {/* New Users Card */}
      <Link href="/admin" className="group">
        <ShineBorder
          color={unreadUsers.length > 0 ? ["#3b82f6", "#2563eb", "#60a5fa"] : ["#d1d5db"]}
          borderWidth={unreadUsers.length > 0 ? 2 : 1}
          duration={unreadUsers.length > 0 ? 8 : 20}
          className="hover:shadow-md transition-shadow"
        >
          <div className="relative overflow-hidden w-full rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Yangi foydalanuvchilar</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{unreadUsers.length}</p>
                <p className="text-xs text-gray-500 mt-1">Jami: {totalUsers} ta</p>
              </div>
              <div className={`flex items-center justify-center size-11 rounded-xl ${unreadUsers.length > 0 ? "bg-blue-100" : "bg-gray-100"}`}>
                <UserPlus className={`size-5 ${unreadUsers.length > 0 ? "text-blue-600" : "text-gray-400"}`} />
              </div>
            </div>
            {unreadUsers.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
            )}
          </div>
        </ShineBorder>
      </Link>

      {/* Revenue Card */}
      <ShineBorder
        color={newRevenue > 0 ? ["#10b981", "#059669", "#34d399"] : ["#d1d5db"]}
        borderWidth={newRevenue > 0 ? 2 : 1}
        duration={newRevenue > 0 ? 8 : 20}
        className="hover:shadow-md transition-shadow"
      >
        <div className="relative overflow-hidden w-full rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Yangi daromad</p>
              <p className={`text-2xl font-bold mt-1 ${newRevenue > 0 ? "text-green-600" : "text-gray-900"}`}>
                {newRevenue > 0 ? formatUZS(newRevenue) : "0 so'm"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Ko&apos;rib chiqilmagan buyurtmalardan</p>
            </div>
            <div className={`flex items-center justify-center size-11 rounded-xl ${newRevenue > 0 ? "bg-emerald-100" : "bg-gray-100"}`}>
              <TrendingUp className={`size-5 ${newRevenue > 0 ? "text-emerald-600" : "text-gray-400"}`} />
            </div>
          </div>
          {newRevenue > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
          )}
        </div>
      </ShineBorder>
    </div>
  );
};

export default DashboardSummary;
