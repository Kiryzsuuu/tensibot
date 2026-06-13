'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, Users, FileText, Image, ScrollText, LayoutGrid } from 'lucide-react';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
  { href: '/admin/content', label: 'Konten', icon: FileText },
  { href: '/admin/hero', label: 'Hero', icon: Image },
  { href: '/admin/logs', label: 'Log', icon: ScrollText },
];

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user && !ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number])) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  if (!user || !ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number])) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#2E86C1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const visibleLinks = user.role === 'SUPER_ADMIN' ? adminLinks : adminLinks.filter(l => l.href !== '/admin/logs');

  return (
    <div className="min-h-screen bg-[#F4F8FC]">
      {/* Admin top bar */}
      <div className="bg-[#154360] text-white shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-[#2E86C1] rounded-lg flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                  <path d="M2 11 L5 5 L8 13 L11 8 L14 14 L17 9 L20 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <span className="font-bold text-sm">Tensi-Bot Admin</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#AED6F1] text-xs hidden sm:block">{user.email}</span>
              <Link href="/dashboard" className="text-xs text-[#AED6F1] hover:text-white border border-[#2E86C1]/40 hover:border-[#2E86C1] px-3 py-1.5 rounded-lg transition-colors">
                ← Kembali ke App
              </Link>
            </div>
          </div>
          {/* Sub-nav */}
          <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0">
            {visibleLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive ? 'border-[#2E86C1] text-white' : 'border-transparent text-[#5D8AA8] hover:text-[#AED6F1]'
                  }`}
                >
                  <link.icon size={13} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
