'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Menu, Bell, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({ onMenuToggle, title, subtitle }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs">
            {user?.name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-slate-900 leading-none">{user?.name}</div>
            <div className="text-slate-400 text-[11px] mt-0.5">{user?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
