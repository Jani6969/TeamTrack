import React from 'react';
import { TaskPriority, TaskStatus } from '@/types';

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  switch (priority) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-rose-100 text-rose-800 border border-rose-200">
          Critical
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 border border-amber-200">
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase bg-blue-100 text-blue-800 border border-blue-200">
          Medium
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200">
          Low
        </span>
      );
  }
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-100/90 text-emerald-800 border border-emerald-200">
          Completed
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-100/90 text-blue-800 border border-blue-200">
          In Progress
        </span>
      );
    case 'BLOCKED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-100/90 text-rose-800 border border-rose-200">
          Blocked
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-slate-200 text-slate-700">
          Cancelled
        </span>
      );
    case 'NOT_STARTED':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200">
          Not Started
        </span>
      );
  }
}
