import type { Metadata } from 'next';
import { inter } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gilam SaaS - Korxonalar Boshqaruvi',
  description: 'Gilam yuvish faolyatini zamonaviy boshqarish tizimi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className={`${inter.className} min-h-screen font-sans antialiased bg-slate-50`}>
        {children}
      </body>
    </html>
  );
}
