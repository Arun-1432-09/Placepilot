import React from 'react';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  category?: 'Placement Ready' | 'Developing' | 'Needs Preparation' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ category, size = 'md' }) => {
  if (!category) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        Unassessed
      </span>
    );
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  if (category === 'Placement Ready') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-mint-50 text-mint-700 border border-mint-200/80 shadow-sm ${sizeClasses[size]}`}
      >
        <CheckCircle2 className={`${iconSizes[size]} text-mint-600`} />
        Placement Ready
      </span>
    );
  }

  if (category === 'Developing') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-sm ${sizeClasses[size]}`}
      >
        <Clock className={`${iconSizes[size]} text-indigo-600`} />
        Developing
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-rose-50 text-rose-700 border border-rose-200/80 shadow-sm ${sizeClasses[size]}`}
    >
      <AlertTriangle className={`${iconSizes[size]} text-rose-600`} />
      Needs Preparation
    </span>
  );
};
