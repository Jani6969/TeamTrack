'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Activity } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 animate-pulse">
          <Activity className="w-6 h-6" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">TeamTrack</h2>
          <p className="text-xs text-slate-400 mt-1">Weekly Team Reporting & Analytics Platform</p>
        </div>
      </div>
    </div>
  );
}
