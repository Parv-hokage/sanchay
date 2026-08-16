import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { AIButton } from '../components/ai/AIButton';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { AuthProvider } from '../context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SANCHAY — Unified Government Digital Service Platform',
  description:
    'Single unified citizen access layer for government services, examinations, and healthcare benefits.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-sanchay-gold-100 selection:text-sanchay-navy-900">
        <ErrorBoundary>
          <AuthProvider>
            <Header />
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
              <Sidebar />
              <main className="flex-1 min-w-0">{children}</main>
            </div>
            <AIButton />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
