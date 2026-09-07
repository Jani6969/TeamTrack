'use client';

import React, { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';
import { AIAssistantModal } from '@/components/ai/AIAssistantModal';

interface AppShellProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  title?: string;
  subtitle?: string;
}

export function AppShell({ children, allowedRoles, title, subtitle }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleGuard allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content column */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <Header
            onMenuToggle={() => setSidebarOpen((prev) => !prev)}
            title={title}
            subtitle={subtitle}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Floating AI Copilot assistant */}
        <AIAssistantModal />
      </div>
    </RoleGuard>
  );
}
