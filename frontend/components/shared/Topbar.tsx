'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Bell, Plus, ChevronRight } from 'lucide-react';
import { getTodayWIB } from '@/lib/utils';

interface TopbarProps {
  onMenuToggle: () => void;
  notificationCount?: number;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/chat': 'Chatbot AI',
  '/monitoring': 'Monitoring Tensi',
  '/obat': 'Pengingat Obat',
  '/edukasi': 'Edukasi Kesehatan',
  '/profil': 'Profil Saya',
};

export function Topbar({ onMenuToggle, notificationCount = 0 }: TopbarProps) {
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] ?? 'Tensi-Bot';
  const parentTitle = 'Beranda';

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[248px] h-16 bg-white border-b border-[#D6E8F5] z-20 flex items-center px-4 lg:px-6 gap-4 shadow-sm">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden text-[#1A5276] hover:text-[#2E86C1] transition-colors p-1 -ml-1"
        aria-label="Buka menu"
      >
        <Menu size={22} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        <span className="text-[#5D8AA8] hidden sm:block">{parentTitle}</span>
        <ChevronRight size={14} className="text-[#AED6F1] hidden sm:block shrink-0" />
        <span className="font-semibold text-[#1A2A3A] truncate">{pageTitle}</span>
      </div>

      {/* Right side: date + actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Date (hidden on very small screens) */}
        <span className="hidden md:block text-xs text-[#5D8AA8] bg-[#EAF4FB] px-3 py-1.5 rounded-full border border-[#AED6F1]">
          {getTodayWIB()}
        </span>

        {/* Notification bell */}
        <button
          className="relative text-[#1A5276] hover:text-[#2E86C1] transition-colors p-1.5 rounded-lg hover:bg-[#EAF4FB]"
          aria-label="Notifikasi"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C0392B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* Catat Tensi button */}
        <Link
          href="/monitoring"
          className="flex items-center gap-1.5 bg-[#2E86C1] hover:bg-[#2980B9] text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors duration-150 shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:block">Catat Tensi</span>
        </Link>
      </div>
    </header>
  );
}
