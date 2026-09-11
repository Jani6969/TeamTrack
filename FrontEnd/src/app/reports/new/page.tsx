'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ReportForm } from '@/components/reports/ReportForm';

export default function NewReportPage() {
  return (
    <AppShell
      title="Create Weekly Report"
      subtitle="Complete your weekly tasks, deliverables, actual hours, and impediments"
    >
      <div className="max-w-4xl mx-auto">
        <ReportForm />
      </div>
    </AppShell>
  );
}
