'use client';

import React from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  FolderKanban,
  BarChart3,
  LogOut,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';
import NextLink from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, isManager } = useAuth();

  const memberNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Reports', href: '/reports', icon: FileText },
    { label: 'Create Report', href: '/reports/new', icon: PlusCircle },
  ];

  const managerNavItems = [
    { label: 'Overview', href: '/manager/dashboard', icon: BarChart3 },
    { label: 'Team Reports', href: '/manager/reports', icon: Layers },
    { label: 'Team Members', href: '/manager/team', icon: Users },
    { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { label: 'User Directory', href: '/admin/users', icon: Shield },
  ];

  const navItems = isManager ? managerNavItems : memberNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-white leading-tight">WorkPulse</div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Team Analytics</div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            {isManager ? 'Management' : 'My Workspace'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <NextLink
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </NextLink>
            );
          })}
        </div>

        {/* User Info Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="overflow-hidden pr-2">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase shrink-0 ${
                isManager ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
              }`}
            >
              {user?.role}
            </span>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors border border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
