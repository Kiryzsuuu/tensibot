'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageCircle,
  Activity,
  Heart,
  BookOpen,
  User,
  X,
  LogOut,
  Image,
  Users,
  FileText,
  ScrollText,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Panel Admin', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
  { href: '/admin/content', label: 'Konten Edukasi', icon: FileText },
  { href: '/admin/hero', label: 'Hero Banner', icon: Image },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
  { href: '/admin/logs', label: 'Log Aktivitas', icon: ScrollText },
];

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/chat',
    label: 'Chatbot AI',
    icon: MessageCircle,
  },
  {
    href: '/monitoring',
    label: 'Monitoring Tensi',
    icon: Activity,
  },
  {
    href: '/obat',
    label: 'Pengingat Obat',
    icon: Heart,
  },
  {
    href: '/edukasi',
    label: 'Edukasi',
    icon: BookOpen,
  },
  {
    href: '/profil',
    label: 'Profil Saya',
    icon: User,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[#1A5276]">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-9 h-9 bg-[#2E86C1] rounded-lg flex items-center justify-center shadow">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M2 11 L5 5 L8 13 L11 8 L14 14 L17 9 L20 11"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">Tensi-Bot</p>
            <p className="text-[#AED6F1] text-xs mt-0.5">Kendali Hipertensi</p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden text-[#AED6F1] hover:text-white transition-colors p-1"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[#5D8AA8] text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-[#2E86C1] text-white shadow-sm'
                  : 'text-[#AED6F1] hover:bg-[#1A5276] hover:text-white'
              )}
            >
              <item.icon
                size={18}
                className={cn(
                  'shrink-0 transition-colors',
                  active ? 'text-white' : 'text-[#5D8AA8] group-hover:text-[#AED6F1]'
                )}
              />
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-70" />
              )}
            </Link>
          );
        })}

        {/* Admin section — shown only to ADMIN / SUPER_ADMIN */}
        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <>
            <div className="pt-4 pb-1">
              <p className="text-[#5D8AA8] text-[10px] font-semibold uppercase tracking-widest px-3">
                Admin
              </p>
            </div>
            {adminNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                    active
                      ? 'bg-[#2E86C1] text-white shadow-sm'
                      : 'text-[#AED6F1] hover:bg-[#1A5276] hover:text-white'
                  )}
                >
                  <item.icon
                    size={18}
                    className={cn(
                      'shrink-0 transition-colors',
                      active ? 'text-white' : 'text-[#5D8AA8] group-hover:text-[#AED6F1]'
                    )}
                  />
                  <span>{item.label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-70" />
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User card */}
      <div className="px-3 py-4 border-t border-[#1A5276]">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#1A5276]">
          <div className="w-8 h-8 rounded-full bg-[#2E86C1] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {user?.fullName ?? 'Pengguna'}
            </p>
            <p className="text-[#AED6F1] text-xs truncate">{user?.email ?? ''}</p>
          </div>
          <button
            onClick={logout}
            className="text-[#5D8AA8] hover:text-white transition-colors shrink-0"
            title="Keluar"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-[248px] bg-[#154360] z-30">
        {sidebarContent}
      </aside>

      {/* Mobile: overlay + slide-in */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigasi"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="relative w-[248px] bg-[#154360] flex flex-col sidebar-transition">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
