"use client";
import React, { useState, useMemo } from 'react';
import UsersTable from '@/components/admin/UsersTable';
import PanelTitle from '@/components/admin/PanelTitle';
import Search from '@/components/admin/Search';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Users, ShieldCheck, UserPlus, UserCheck } from 'lucide-react';

const UsersPage = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const { users } = useAuthStore();
  const { notifications } = useNotificationStore();

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const regularUsers = total - admins;

    // New users in last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const newToday = notifications.filter(
      (n) => n.type === 'new_user' && n.timestamp >= oneDayAgo
    ).length;

    return { total, admins, regularUsers, newToday };
  }, [users, notifications]);

  const filteredSearch = useMemo(() => {
    if (roleFilter === 'all') return search;
    return search;
  }, [search, roleFilter]);

  return (
    <div>
      <PanelTitle title="Foydalanuvchilar" />

      {/* User Stats */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 px-4 pb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center size-7 rounded-lg bg-blue-100">
              <Users className="size-3.5 text-blue-600" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Jami</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center size-7 rounded-lg bg-purple-100">
              <ShieldCheck className="size-3.5 text-purple-600" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.admins}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Adminlar</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center size-7 rounded-lg bg-gray-100">
              <UserCheck className="size-3.5 text-gray-600" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.regularUsers}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Foydalanuvchilar</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center size-7 rounded-lg bg-green-100">
              <UserPlus className="size-3.5 text-green-600" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.newToday}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Yangi (24s)</p>
        </div>
      </div>

      {/* Role filter */}
      <div className="flex gap-2 px-4 pb-3">
        {([
          { key: 'all', label: 'Barchasi' },
          { key: 'admin', label: 'Adminlar' },
          { key: 'user', label: 'Foydalanuvchilar' },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setRoleFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              roleFilter === f.key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Search search={search} handleSearchChange={setSearch} placeholder="Ism yoki email bo'yicha qidirish" />
      <UsersTable search={filteredSearch} roleFilter={roleFilter} />
    </div>
  );
};

export default UsersPage;
