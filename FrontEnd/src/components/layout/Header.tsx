'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  User as UserIcon,
  ChevronDown,
  LogOut,
  Shield,
  Mail,
  Briefcase,
  Hash,
  Calendar,
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
            <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-slide-down">
              {/* Profile Card Header */}
              <div className="flex items-start gap-3.5 pb-3.5 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-brand-500/20 shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || <UserIcon className="w-6 h-6" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-sm text-slate-900 truncate">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                    {user?.email || 'user@example.com'}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        isManager
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : user?.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-brand-50 text-brand-700 border border-brand-200'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      <span>{user?.role?.replace('_', ' ') || 'Member'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* User Account Details Section */}
              <div className="my-3 space-y-2 bg-slate-50/80 border border-slate-100 rounded-2xl p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-0.5">
                  Account Details
                </div>

                <div className="flex items-center justify-between text-xs py-1 px-0.5">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Email</span>
                  </div>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[140px]" title={user?.email}>
                    {user?.email || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1 px-0.5 border-t border-slate-100/80">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Role</span>
                  </div>
                  <span className="font-semibold text-slate-800 text-right">
                    {isManager ? 'Engineering Manager' : user?.role === 'ADMIN' ? 'Administrator' : 'Team Member'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1 px-0.5 border-t border-slate-100/80">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>User ID</span>
                  </div>
                  <span className="font-mono text-[11px] font-medium text-slate-600 bg-slate-200/60 px-1.5 py-0.5 rounded">
                    {user?._id ? `#${user._id.slice(-6).toUpperCase()}` : 'USR-CURRENT'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1 px-0.5 border-t border-slate-100/80">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Member Since</span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : 'September 2026'}
                  </span>
                </div>
              </div>

              {/* Logout Action */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50/60 hover:bg-rose-100/80 border border-rose-200/60 transition-colors shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
