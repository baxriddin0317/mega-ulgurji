import React, { ReactNode } from 'react'

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen h-screen bg-gray-100 px-4 py-8 md:p-8">
      {children}
    </div>
  )
}

export default AuthLayout