import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon,
  color = 'indigo',
  onClick,
}: StatCardProps) {
  const colorStyles = {
    indigo: {
      accent: 'from-brand-500 to-indigo-600',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      borderHover: 'hover:border-indigo-300',
    },
    emerald: {
      accent: 'from-emerald-400 to-teal-600',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      borderHover: 'hover:border-emerald-300',
    },
    amber: {
      accent: 'from-amber-400 to-orange-500',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      borderHover: 'hover:border-amber-300',
    },
    rose: {
      accent: 'from-rose-400 to-pink-600',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      borderHover: 'hover:border-rose-300',
    },
    blue: {
      accent: 'from-blue-400 to-cyan-600',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      borderHover: 'hover:border-blue-300',
    },
    purple: {
      accent: 'from-purple-400 to-fuchsia-600',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      borderHover: 'hover:border-purple-300',
    },
  };

  const style = colorStyles[color] || colorStyles.indigo;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      } ${style.borderHover}`}
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.accent} opacity-90 group-hover:h-1.5 transition-all duration-200`}
      />

      {/* Header with Title & Icon */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-xs sm:text-[13px] font-bold text-slate-700 leading-snug">
          {title}
        </h4>
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-2xs shrink-0 transition-transform group-hover:scale-105 duration-200 ${style.iconBg}`}
        >
          {icon}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-1">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 group-hover:text-brand-700 transition-colors">
          {value}
        </div>
      </div>
    </div>
  );
}
