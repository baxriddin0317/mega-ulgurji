"use client";
import React from "react";
import { ShoppingCart, UserPlus, TrendingUp } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { formatUZS } from "@/lib/formatPrice";
import Link from "next/link";

const DashboardSummary = () => {
  const { notifications } = useNotificationStore();

  // Calculate stats from unread notifications
  const unreadOrders = notifications.filter((n) => !n.read && n.type === "new_order");
  const unreadUsers = notifications.filter((n) => !n.read && n.type === "new_user");

  // Total revenue from new orders
  const newRevenue = unreadOrders.reduce((sum, n) => sum + (n.orderData?.totalPrice || 0), 0);

  // Total counts (all time in notifications, read + unread)
  const totalOrders = notifications.filter((n) => n.type === "new_order").length;
  const totalUsers = notifications.filter((n) => n.type === "new_user").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* New Orders Card */}
      <Link href="/admin/orders" className="group">
        <div className="relative overflow-hidden bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Yangi buyurtmalar</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {unreadOrders.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Jami: {totalOrders} ta
              </p>
            </div>
            <div className={`flex items-center justify-center size-11 rounded-xl ${
              unreadOrders.length > 0 ? "bg-green-100" : "bg-gray-100"
            }`}>
              <ShoppingCart className={`size-5 ${
                unreadOrders.length > 0 ? "text-green-600" : "text-gray-400"
              }`} />
            </div>
          </div>
          {unreadOrders.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />
          )}
        </div>
      </Link>

      {/* New Users Card */}
      <Link href="/admin" className="group">
        <div className="relative overflow-hidden bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Yangi foydalanuvchilar</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {unreadUsers.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Jami: {totalUsers} ta
              </p>
            </div>
            <div className={`flex items-center justify-center size-11 rounded-xl ${
              unreadUsers.length > 0 ? "bg-blue-100" : "bg-gray-100"
            }`}>
              <UserPlus className={`size-5 ${
                unreadUsers.length > 0 ? "text-blue-600" : "text-gray-400"
              }`} />
            </div>
          </div>
          {unreadUsers.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
          )}
        </div>
      </Link>

      {/* Revenue Card */}
      <div className="relative overflow-hidden bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Yangi daromad</p>
            <p className={`text-2xl font-bold mt-1 ${
              newRevenue > 0 ? "text-green-600" : "text-gray-900"
            }`}>
              {newRevenue > 0 ? formatUZS(newRevenue) : "0 so'm"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Ko&apos;rib chiqilmagan buyurtmalardan
            </p>
          </div>
          <div className={`flex items-center justify-center size-11 rounded-xl ${
            newRevenue > 0 ? "bg-emerald-100" : "bg-gray-100"
          }`}>
            <TrendingUp className={`size-5 ${
              newRevenue > 0 ? "text-emerald-600" : "text-gray-400"
            }`} />
          </div>
        </div>
        {newRevenue > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        )}
      </div>
    </div>
  );
};

export default DashboardSummary;
