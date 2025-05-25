import React, { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen h-screen bg-gray-100 px-4 py-8 md:p-8">
      {children}
      <Toaster />
    </div>
  )
}

export default AuthLayout