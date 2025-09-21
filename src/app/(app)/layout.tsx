
'use client';

import {
  Book,
  BotMessageSquare,
  Contact,
  Home,
  Info,
  Languages,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/icons';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/translate', label: 'Translate', icon: Languages },
    { href: '/blog', label: 'Blog', icon: Book },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Contact },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2">
            <Logo />
            <div className="flex flex-col">
              <h2 className="text-lg font-bold font-headline">AccuAI</h2>
              <p className="text-xs text-sidebar-foreground/80">
                AI Translator
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                <h1 className="text-lg font-semibold md:text-2xl capitalize">{pathname.split('/').pop() || 'Dashboard'}</h1>
            </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
    </SidebarProvider>
  );
}
