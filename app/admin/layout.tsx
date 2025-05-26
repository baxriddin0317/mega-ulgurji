import AdminHeader from '@/components/admin/AdminHeader'
import Sidebar from '@/components/admin/Sidebar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import React, { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoute requireAuth={true} adminOnly={true}>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
          {/* Header */}
          <AdminHeader />
          
          {/* Page content */}
          <main className="flex-1 p-4 md:p-6">
            <div className='bg-white w-full h-full rounded-2xl sm:p-4 shadow-2xl'>
            {children}
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </ProtectedRoute>
  )
}

export default AdminLayout