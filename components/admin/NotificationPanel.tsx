"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Bell, ShoppingCart, UserPlus, X, CheckCheck } from "lucide-react";
import { useNotificationStore, Notification } from "@/store/useNotificationStore";
import { Alert, AlertContent, AlertIcon, AlertTitle, AlertDescription } from "@/components/ui/alert-1";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

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

  // Instant toast when new notifications arrive
  useEffect(() => {
    if (unreadCount > prevCountRef.current && prevCountRef.current >= 0) {
      const newest = notifications[0];
      if (newest && !newest.read) {
        const isOrder = newest.type === 'new_order';
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
                <div className={`flex items-center justify-center size-9 rounded-full ${
                  isOrder ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {isOrder
                    ? <ShoppingCart className="size-4 text-green-600" />
                    : <UserPlus className="size-4 text-blue-600" />
                  }
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">
                  {newest.title}
                </p>
                <p className={`text-xs font-semibold mt-0.5 ${
                  isOrder ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {newest.message}
                </p>
                {newest.detail && (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {newest.detail}
                  </p>
                )}
              </div>
            </div>
          ),
          {
            duration: 6000,
            position: "top-right",
            style: {
              background: "#fff",
              border: `1px solid ${isOrder ? '#bbf7d0' : '#bfdbfe'}`,
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
        <div className="absolute right-0 top-12 w-[380px] max-h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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

          <div className="overflow-y-auto max-h-[400px]">
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
  const isOrder = notification.type === 'new_order';

  return (
    <div
      className={`group relative px-3 py-2.5 border-b border-gray-50 transition-colors hover:bg-gray-50 cursor-pointer ${
        !notification.read ? (isOrder ? "bg-green-50/40" : "bg-blue-50/40") : ""
      }`}
      onClick={() => !notification.read && onRead(notification.id)}
    >
      <Alert
        variant={isOrder ? "success" : "info"}
        appearance="light"
        size="sm"
        className="pointer-events-none"
      >
        <AlertIcon>
          {isOrder
            ? <ShoppingCart className="size-4" />
            : <UserPlus className="size-4" />
          }
        </AlertIcon>
        <AlertContent className="flex-1 min-w-0">
          <AlertTitle className="text-sm leading-tight">
            {!notification.read && (
              <span className={`inline-block w-2 h-2 rounded-full mr-1.5 align-middle animate-pulse ${
                isOrder ? 'bg-green-500' : 'bg-blue-500'
              }`} />
            )}
            <span className="font-bold">{notification.title}</span>
          </AlertTitle>
          <AlertDescription className="text-xs text-gray-600 leading-snug">
            <p className={`font-semibold ${isOrder ? 'text-green-700' : 'text-blue-700'}`}>
              {notification.message}
            </p>
            {notification.detail && (
              <p className="text-[11px] text-gray-400 mt-1">
                {notification.detail} &middot; {formatTime(notification.timestamp)}
              </p>
            )}
          </AlertDescription>
        </AlertContent>
      </Alert>
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

export default NotificationPanel;
