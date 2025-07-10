import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { BiTrash, BiUser } from 'react-icons/bi';
import { useAuthStore } from '@/store/authStore';
import type { UserData } from '@/store/authStore';
import toast from 'react-hot-toast';
import { updateDoc, doc } from 'firebase/firestore';
import { fireDB } from '@/firebase/config';

const roleOptions = ["admin", "user"];

interface UsersTableProps {
  search: string;
}

const Spinner = () => (
  <span className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
    <span className="inline-block w-6 h-6 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />
  </span>
);

const UsersTable = ({ search }: UsersTableProps) => {
  const { users, fetchAllUsers } = useAuthStore();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = fetchAllUsers() as (() => void) | undefined;
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [fetchAllUsers]);

  const filteredUsers = useMemo(() => {
    if (search.length < 2) {
      // Admin userlarni yuqoriga, qolganlarni time bo'yicha teskari tartibda
      const admins = users.filter((user: UserData) => user.role === 'admin');
      const others = users
        .filter((user: UserData) => user.role !== 'admin')
        .sort((a: UserData, b: UserData) => {
          // time mavjud bo'lsa, teskari tartibda
          if (a.time && b.time) {
            return b.time - a.time;
          }
          // time yo'q bo'lsa, tartib o'zgarmaydi
          return 0;
        });
      return [...admins, ...others];
    }
    // Search ishlatilsa, hozirgi filter logikasi
    return users.filter((user: UserData) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
    );
  }, [users, search]);

  const handleDelete = async (user: UserData) => {
    setLoadingUserId(user.uid);
    try {
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('User deleted successfully');
        if (fetchAllUsers) fetchAllUsers();
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error deleting user');
      } else {
        toast.error('Error deleting user');
      }
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleRoleChange = async (user: UserData, newRole: string) => {
    setLoadingUserId(user.uid);
    try {
      const userDoc = doc(fireDB, 'user', user.uid);
      await updateDoc(userDoc, { role: newRole });
      toast.success('User role updated');
      if (fetchAllUsers) fetchAllUsers();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Error updating role');
      } else {
        toast.error('Error updating role');
      }
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div className="w-full px-4 py-3">
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full w-full">
          <thead>
            <tr className="bg-white">
              <th className="px-4 py-3 text-left text-black text-sm font-medium">Ism</th>
              <th className="px-4 py-3 text-left text-black text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-black text-sm font-medium">Telifon</th>
              <th className="px-4 py-3 text-left text-black text-sm font-medium">Maqomi</th>
              <th className="px-4 py-3 text-black text-sm font-medium text-center">Maqomni o&apos;zgartirish</th>
              <th className="px-4 py-3 text-black text-sm font-medium text-center">O&apos;chirish</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-20 px-4 py-2 text-center text-gray-500">
                  {search.length >= 2 ? 'No user found' : 'No user available'}
                </td>
              </tr>
            ) : (filteredUsers.map((user: UserData) => (
              <tr key={user.uid} className="border-t border-gray-200">
                <td className="h-20 px-4 py-2 text-black text-sm font-normal">{user.name}</td>
                <td className="h-20 px-4 py-2 text-black text-sm font-normal">{user.email}</td>
                <td className="h-20 px-4 py-2 text-black text-sm font-normal">{user.phone}</td>
                <td className="h-20 px-4 py-2 text-black text-sm font-normal">{user.role}</td>
                <td className="w-44 h-20 px-4 py-2 text-gray-700 text-sm font-normal text-center">
                  <select
                    className="border rounded px-2 py-1"
                    value={user.role}
                    onChange={e => handleRoleChange(user, e.target.value)}
                  >
                    {roleOptions.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>
                <td className="w-20 h-20 px-4 py-2 text-sm font-normal text-center">
                  <Button
                    onClick={() => handleDelete(user)}
                    disabled={loadingUserId === user.uid}
                    variant="destructive"
                  >
                    <BiTrash size={24} />
                    {loadingUserId === user.uid && <Spinner />}
                  </Button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      {/* Mobile view - Card layout */}
      <div className="md:hidden space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center text-gray-500">
            {search.length >= 2 ? 'No user found' : 'No user available'}
          </div>
        ) : (filteredUsers.map((user: UserData, index: number) => (
          <div key={index} className="relative bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-black flex items-center gap-2"><BiUser />{user.name}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm text-black">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Telifon</span>
                <span className="text-sm text-black">{user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Maqomi</span>
                <span className="text-sm text-black">{user.role}</span>
              </div>
              <div className="flex flex-1 gap-3 flex-wrap pt-3 justify-end">
                <select
                  className="border rounded px-2 py-1"
                  value={user.role}
                  onChange={e => handleRoleChange(user, e.target.value)}
                >
                  {roleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <Button
                  onClick={() => handleDelete(user)}
                  disabled={loadingUserId === user.uid}
                  variant="destructive"
                  className='!cursor-pointer'
                >
                  <BiTrash size={24} />
                </Button>
              </div>
            </div>
            {loadingUserId === user.uid && <Spinner />}
          </div>
        )))}
      </div>
    </div>
  );
};

export default UsersTable; 