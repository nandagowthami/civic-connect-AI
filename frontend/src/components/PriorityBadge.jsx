import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PriorityBadge = ({ priority, showIcon = true, size = "md" }) => {
  const p = (priority || 'LOW').toUpperCase();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3.5 py-1.5 text-sm font-bold"
  };

  if (p.includes('HIGH')) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-100 text-red-700 border border-red-200 ${sizeClasses[size]}`}>
        {showIcon && <AlertCircle className="w-3.5 h-3.5 text-red-600 animate-pulse" />}
        <span>HIGH PRIORITY</span>
      </span>
    );
  }

  if (p.includes('MED')) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 ${sizeClasses[size]}`}>
        {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
        <span>MEDIUM PRIORITY</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 ${sizeClasses[size]}`}>
      {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
      <span>LOW PRIORITY</span>
    </span>
  );
};
