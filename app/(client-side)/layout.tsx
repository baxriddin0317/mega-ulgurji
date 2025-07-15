import Footer from '@/components/client/Footer';
import React from 'react'
import FixedCartButton from '@/components/client/FixedCartButton';

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <FixedCartButton />
      <Footer />
    </>
  )
}