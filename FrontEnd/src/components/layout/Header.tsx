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
  Sparkles,
  Activity,
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
    <header className="h-16 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-3.5">
        <button
          onClick={onMenuToggle}
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors border border-transparent hover:border-slate-200"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {title}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 hidden sm:block mt-0.5 truncate max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* User profile dropdown trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl transition-all border ${
              dropdownOpen
                ? 'bg-slate-100/90 border-slate-300 shadow-sm ring-2 ring-brand-500/10'
                : 'border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {user?.name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden md:block text-left text-xs">
              <div className="font-bold text-slate-900 leading-none">{user?.name}</div>
              <div className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider mt-0.5">
                {user?.role}
              </div>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180 text-brand-600' : ''
              }`}
            />
          </button>

          {/* Floating Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/90 py-2.5 z-50 animate-slide-down">
              {/* Profile Card Header */}
              <div className="px-4 py-3 border-b border-slate-100/80">
                <div className="font-bold text-sm text-slate-900 truncate">{user?.name}</div>
                <div className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</div>
                <div className="mt-2.5 flex items-center gap-2">
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
              <div className="py-1.5 px-2 space-y-0.5">
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
              <div className="pt-1.5 px-2 border-t border-slate-100/80">
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
