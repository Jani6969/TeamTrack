'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  User as UserIcon,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  Shield,
} from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({ onMenuToggle, title, subtitle }: HeaderProps) {
  const { user, logout, isManager } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

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
        {/* User profile dropdown trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl transition-all border ${
              dropdownOpen
                ? 'bg-slate-100/90 border-slate-300 shadow-sm'
                : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs shadow-xs">
              {user?.name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden md:block text-left text-xs">
              <div className="font-semibold text-slate-900 leading-none">{user?.name}</div>
              <div className="text-slate-400 text-[11px] mt-0.5">{user?.role}</div>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180 text-slate-700' : ''
              }`}
            />
          </button>

          {/* Floating Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-slide-down">
              {/* Profile Card Header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="font-bold text-sm text-slate-900 truncate">{user?.name}</div>
                <div className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</div>
                <div className="mt-2.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      isManager
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-brand-50 text-brand-700 border border-brand-200'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    <span>{user?.role}</span>
                  </span>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="py-1.5 px-1.5 space-y-0.5">
                <Link
                  href={isManager ? '/manager/dashboard' : '/dashboard'}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-700 hover:bg-brand-50/70 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href={isManager ? '/manager/reports' : '/reports'}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-700 hover:bg-brand-50/70 transition-colors"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>{isManager ? 'Team Reports' : 'My Reports'}</span>
                </Link>

                {!isManager && (
                  <Link
                    href="/reports/new"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-700 hover:bg-brand-50/70 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-slate-400" />
                    <span>Create Weekly Report</span>
                  </Link>
                )}

                {isManager && (
                  <Link
                    href="/manager/team"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-700 hover:bg-brand-50/70 transition-colors"
                  >
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Team Directory</span>
                  </Link>
                )}
              </div>

              {/* Logout Action */}
              <div className="pt-1.5 px-1.5 border-t border-slate-100">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out / Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
