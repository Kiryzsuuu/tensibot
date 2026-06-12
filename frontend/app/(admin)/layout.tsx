'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-[#F4F8FC]">
      {/* Admin top bar */}
      <div className="bg-[#154360] text-white px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#2E86C1] rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
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
          <span className="font-bold text-sm">Tensi-Bot Admin</span>
        </div>
        <span className="text-[#AED6F1] text-xs">{user.role}</span>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
