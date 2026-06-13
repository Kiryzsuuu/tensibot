'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const;

export default function AdminGuardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && !ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number])) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  if (!user || !ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number])) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#2E86C1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
