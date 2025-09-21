
'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons';
import { Footer } from '@/components/app/Footer';
import { OfflineIndicator } from '@/components/app/OfflineIndicator';


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen flex flex-col">
       <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="flex items-center gap-3">
            <Logo />
            <div className="flex flex-col">
              <h2 className="text-lg font-bold font-headline">AccuAI</h2>
              <p className="text-xs text-muted-foreground">
                AI Translator
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
        <Footer />
        <OfflineIndicator />
    </div>
  );
}
