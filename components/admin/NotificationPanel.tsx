"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Bell, ShoppingCart, UserPlus, X, CheckCheck, ChevronDown, Phone, Mail, User, Package } from "lucide-react";
import { useNotificationStore, Notification } from "@/store/useNotificationStore";
import { Button } from "@/components/ui/button";
import { formatUZS } from "@/lib/formatPrice";
import toast from "react-hot-toast";
import { playOrderSound, playUserSound } from "@/lib/notificationSound";
import { getStatusInfo } from "@/lib/orderStatus";

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    startListening,
    stopListening,
  } = useNotificationStore();

  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [startListening, stopListening]);

  // Instant toast + sound when new notifications arrive
  useEffect(() => {
    if (unreadCount > prevCountRef.current && prevCountRef.current >= 0) {
      const newest = notifications[0];
      if (newest && !newest.read) {
        const isOrder = newest.type === "new_order";
        const isUser = newest.type === "new_user";
        const isStatusChange = newest.type === "order_status_change";

        // Play sound based on type
        if (isOrder) playOrderSound();
        else if (isStatusChange) playOrderSound();
        else playUserSound();

        // Color scheme
        const bgClass = isOrder ? "bg-green-100" : isStatusChange ? "bg-amber-100" : "bg-blue-100";
        const iconClass = isOrder ? "text-green-600" : isStatusChange ? "text-amber-600" : "text-blue-600";
        const textClass = isOrder ? "text-green-600" : isStatusChange ? "text-amber-600" : "text-blue-600";
        const borderColor = isOrder ? "#bbf7d0" : isStatusChange ? "#fde68a" : "#bfdbfe";

        toast(
          (t) => (
            <div
              className="flex items-start gap-3 cursor-pointer max-w-sm"
              onClick={() => {
                toast.dismiss(t.id);
                setIsOpen(true);
              }}
            >
              <div className="shrink-0 mt-0.5">
                <div className={`flex items-center justify-center size-9 rounded-full ${bgClass}`}>
                  {isUser
                    ? <UserPlus className={`size-4 ${iconClass}`} />
                    : <ShoppingCart className={`size-4 ${iconClass}`} />
                  }
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{newest.title}</p>
                <p className={`text-xs font-semibold mt-0.5 ${textClass}`}>{newest.message}</p>
                {newest.detail && <p className="text-[11px] text-gray-400 mt-0.5">{newest.detail}</p>}
              </div>
            </div>
          ),
          {
            duration: 6000,
            position: "top-right",
            style: {
              background: "#fff",
              border: `1px solid ${borderColor}`,
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
              padding: "12px 16px",
              borderRadius: "12px",
              maxWidth: "400px",
            },
          }
        );
      }
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount, notifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = useCallback((timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Hozir";
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} soat oldin`;
    const days = Math.floor(hours / 24);
    return `${days} kun oldin`;
  }, []);

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label="Bildirishnomalar"
      >
        <Bell className="size-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-5 h-5 px-1 text-[11px] font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-[400px] max-h-[550px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-base text-gray-900">
              Bildirishnomalar
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium cursor-pointer"
              >
                <CheckCheck className="size-3.5" />
                Barchasini o&apos;qish
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[460px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell className="size-10 mb-3 opacity-30" />
                <p className="text-sm">Bildirishnomalar yo&apos;q</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onRead={markAsRead}
                  onRemove={removeNotification}
                  formatTime={formatTime}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Expandable Notification Item ---
const NotificationItem = ({
  notification,
  onRead,
  onRemove,
  formatTime,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
  formatTime: (ts: number) => string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const isOrder = notification.type === "new_order";
  const isStatusChange = notification.type === "order_status_change";
  const isUser = notification.type === "new_user";

  const handleClick = () => {
    if (!notification.read) onRead(notification.id);
    setExpanded((prev) => !prev);
  };

  return (
    <div
      className={`group relative border-b border-gray-100 transition-colors ${
        !notification.read
          ? isOrder ? "bg-green-50/40" : isStatusChange ? "bg-amber-50/40" : "bg-blue-50/40"
          : "hover:bg-gray-50"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start gap-2.5 px-3 py-2.5 cursor-pointer" onClick={handleClick}>
        <div className={`shrink-0 mt-0.5 flex items-center justify-center size-8 rounded-full ${
          isOrder ? "bg-green-100" : isStatusChange ? "bg-amber-100" : "bg-blue-100"
        }`}>
          {isUser
            ? <UserPlus className="size-4 text-blue-600" />
            : <ShoppingCart className={`size-4 ${isStatusChange ? "text-amber-600" : "text-green-600"}`} />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {!notification.read && (
              <span className={`inline-block w-2 h-2 rounded-full shrink-0 animate-pulse ${isOrder ? "bg-green-500" : isStatusChange ? "bg-amber-500" : "bg-blue-500"}`} />
            )}
            <span className="font-bold text-sm text-gray-900 truncate">{notification.title}</span>
          </div>
          <p className={`text-xs font-semibold mt-0.5 ${isOrder ? "text-green-700" : isStatusChange ? "text-amber-700" : "text-blue-700"}`}>
            {notification.message}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {notification.detail} &middot; {formatTime(notification.timestamp)}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <ChevronDown className={`size-4 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 animate-in fade-in slide-in-from-top-1 duration-150">
          {(isOrder || isStatusChange) && notification.orderData ? (
            <OrderDetails data={notification.orderData} />
          ) : notification.userData ? (
            <UserDetails data={notification.userData} />
          ) : (
            <p className="text-xs text-gray-400 px-2 py-2">Ma&apos;lumotlar mavjud emas</p>
          )}
        </div>
      )}

      {/* Remove button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(notification.id);
        }}
        className="absolute top-2 right-2 size-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="O'chirish"
      >
        <X className="size-3.5 text-gray-400" />
      </Button>
    </div>
  );
};

// --- Order Details Expanded View ---
const OrderDetails = ({ data }: { data: NonNullable<Notification["orderData"]> }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Customer info + status */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <User className="size-3.5 text-gray-500" />
          <span className="text-xs font-bold text-gray-800">{data.clientName}</span>
        </div>
        <div className="flex items-center gap-2">
          {(() => {
            const info = getStatusInfo(data.status);
            return (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${info.color} ${info.bg}`}>
                {info.label}
              </span>
            );
          })()}
          <Phone className="size-3 text-gray-400" />
          <span className="text-xs text-gray-600">{data.clientPhone}</span>
        </div>
      </div>

      {/* Items list */}
      <div className="divide-y divide-gray-50">
        {data.basketItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5 px-3 py-2">
            {item.productImageUrl && item.productImageUrl[0] ? (
              <img
                src={item.productImageUrl?.[0]?.url || ''}
                alt={item.title}
                className="size-9 rounded-md object-cover shrink-0"
              />
            ) : (
              <div className="size-9 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                <Package className="size-4 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
              <p className="text-[11px] text-gray-500">{item.category}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-bold text-gray-900">{formatUZS(item.price)}</p>
              <p className="text-[11px] text-gray-500">{item.quantity} ta</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="px-3 py-2 bg-green-50 border-t border-green-100 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-700">Jami: {data.totalQuantity} ta</span>
        <span className="text-sm font-bold text-green-700">{formatUZS(data.totalPrice)}</span>
      </div>
    </div>
  );
};

// --- User Details Expanded View ---
const UserDetails = ({ data }: { data: NonNullable<Notification["userData"]> }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-50">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="flex items-center justify-center size-9 rounded-full bg-blue-100 shrink-0">
            <User className="size-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{data.name}</p>
            <p className="text-[11px] text-gray-500 capitalize">{data.role === "admin" ? "Administrator" : "Foydalanuvchi"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2">
          <Mail className="size-3.5 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-700">{data.email || "Email ko'rsatilmagan"}</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2">
          <Phone className="size-3.5 text-gray-400 shrink-0" />
          <span className="text-xs font-semibold text-gray-700">{data.phone || "Telefon ko'rsatilmagan"}</span>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
