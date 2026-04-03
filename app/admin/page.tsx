"use client";
import UsersTable from '@/components/admin/UsersTable';
import PanelTitle from '@/components/admin/PanelTitle';
import Search from '@/components/admin/Search';
import DashboardSummary from '@/components/admin/DashboardSummary';
import QuickActionsWidget from '@/components/admin/QuickActionsWidget';
import React, { useState } from 'react';

const Users = () => {
  const [search, setSearch] = useState<string>('');
  const handleSearchChange = (e: string) => {
    setSearch(e);
  };
  return (
    <div>
      <QuickActionsWidget />
      <DashboardSummary />
      <PanelTitle title='Foydalanuvchilar' />
      <Search search={search} handleSearchChange={handleSearchChange} placeholder='Foydalanuvchilarni qidirish' />
      <UsersTable search={search} />
    </div>
  );
};

export default Users; 