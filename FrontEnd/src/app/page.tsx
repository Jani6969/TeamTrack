'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function RootPage() {
  const { isAuthenticated, isManager, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (isManager) {
        router.replace('/manager/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, isManager, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 flex items-center justify-center animate-pulse">
          <Image
            src="/logo-icon.png"
            alt="TeamTrack Logo"
            width={80}
            height={80}
            className="w-full h-full object-contain drop-shadow-2xl"
            priority
          />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight">TeamTrack</h2>
          <p className="text-xs text-slate-400 mt-1">Weekly Team Reporting & Analytics Platform</p>
        </div>
      </div>
    </div>
  );
}
