"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package, FileText, Menu, X, PackagePlus, Warehouse, BarChart3, Crown, CreditCard, Users, Settings } from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuthStore } from '@/store/authStore';

const BottomNav = () => {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const { notifications } = useNotificationStore();
  const { isAdmin } = useAuthStore();
  const admin = isAdmin();

  const newOrderCount = notifications.filter((n) => !n.read && n.type === 'new_order').length;

  const isActive = (path: string) => pathname === path;
  const isActiveGroup = (paths: string[]) => paths.some((p) => pathname.startsWith(p));

  // Main 4 tabs + "More" button
  const tabs = [
    { href: '/admin/', icon: LayoutDashboard, label: 'Bosh sahifa', active: isActive('/admin') },
    { href: '/admin/products', icon: Package, label: 'Mahsulotlar', active: isActive('/admin/products') },
    {
      href: '/admin/orders', icon: ShoppingCart, label: 'Buyurtmalar',
      active: isActive('/admin/orders'),
      badge: newOrderCount > 0 ? newOrderCount : null,
    },
    { href: '/admin/invoices', icon: FileText, label: 'Faktura', active: isActive('/admin/invoices') },
  ];

  // "More" menu items
  const moreItems = [
    ...(admin ? [{ href: '/admin/users', icon: Users, label: 'Foydalanuvchilar' }] : []),
    { href: '/admin/kirim', icon: PackagePlus, label: 'Kirim' },
    { href: '/admin/ombor', icon: Warehouse, label: 'Ombor' },
    ...(admin ? [
      { href: '/admin/reports', icon: BarChart3, label: 'Hisobotlar' },
      { href: '/admin/customers', icon: Crown, label: 'Mijozlar' },
      { href: '/admin/nasiya', icon: CreditCard, label: 'Nasiya' },
    ] : []),
    { href: '/admin/profile', icon: Settings, label: 'Profil' },
  ];

  const moreIsActive = isActiveGroup(moreItems.map((i) => i.href));

  return (
    <>
      {/* "More" overlay panel */}
      {showMore && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 pb-2 animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-900">Boshqa sahifalar</p>
              <button onClick={() => setShowMore(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="size-5 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {moreItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-colors ${
                      active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="size-5" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 print:hidden">
        <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                tab.active ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {tab.active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gray-900 rounded-full" />
              )}
              <tab.icon className={`size-5 ${tab.active ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] ${tab.active ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
              {tab.badge && (
                <span className="absolute top-1.5 left-1/2 ml-2 flex items-center justify-center min-w-4 h-4 px-1 text-[9px] font-bold text-white bg-green-500 rounded-full">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </Link>
          ))}

          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors cursor-pointer ${
              showMore || moreIsActive ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            {(showMore || moreIsActive) && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gray-900 rounded-full" />
            )}
            <Menu className={`size-5 ${showMore || moreIsActive ? 'stroke-[2.5]' : ''}`} />
            <span className={`text-[10px] ${showMore || moreIsActive ? 'font-bold' : 'font-medium'}`}>Yana</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
