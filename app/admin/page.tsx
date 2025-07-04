"use client";
import UsersTable from '@/components/admin/UsersTable';
import PanelTitle from '@/components/admin/PanelTitle';
import Search from '@/components/admin/Search';
import React, { useState } from 'react';

const Users = () => {
  const [search, setSearch] = useState<string>('');
  const handleSearchChange = (e: string) => {
    setSearch(e);
  };
  return (
    <div>
      <PanelTitle title='Users' />
      <Search search={search} handleSearchChange={handleSearchChange} placeholder='Search for users' />
      <UsersTable search={search} />
    </div>
  );
};

export default Users; 