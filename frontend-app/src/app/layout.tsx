import type { Metadata } from 'next';
import { inter } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gilam SaaS - Korxonalar Boshqaruvi',
  description: 'Gilam yuvish faolyatini zamonaviy boshqarish tizimi',
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className={`${inter.className} min-h-screen font-sans antialiased bg-slate-50`}>
        {children}
        <Toaster position="top-right" toastOptions={{ className: 'font-bold' }} />
      </body>
    </html>
  );
}
