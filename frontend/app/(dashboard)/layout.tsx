'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shared/Sidebar';
import { Topbar } from '@/components/shared/Topbar';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { token, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && !token) {
      router.replace('/');
    }
  }, [token, _hasHydrated, router]);

  if (!_hasHydrated || !token) {
    return (
      <div className="min-h-screen bg-[#EAF4FB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2E86C1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FC]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuToggle={() => setSidebarOpen((v) => !v)} />

      <main className="lg:ml-[248px] pt-16 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
