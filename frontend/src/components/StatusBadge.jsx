import React from 'react';
import { Clock, Cpu, CheckCircle2, Wrench, XCircle, ArrowRight } from 'lucide-react';

export const StatusBadge = ({ status, size = "md" }) => {
  const s = status || 'Submitted';

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3 py-1.5 text-sm font-semibold"
  };

  switch (s) {
    case 'Submitted':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses[size]}`}>
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Submitted</span>
        </span>
      );
    case 'Under AI Review':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 ${sizeClasses[size]}`}>
          <Cpu className="w-3.5 h-3.5 text-purple-600 animate-spin" />
          <span>Under AI Review</span>
        </span>
      );
    case 'Assigned':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 ${sizeClasses[size]}`}>
          <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          <span>Assigned</span>
        </span>
      );
    case 'In Progress':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 ${sizeClasses[size]}`}>
          <Wrench className="w-3.5 h-3.5 text-amber-600" />
          <span>In Progress</span>
        </span>
      );
    case 'Resolved':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 ${sizeClasses[size]}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Resolved</span>
        </span>
      );
    case 'Rejected':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 ${sizeClasses[size]}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Rejected</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-700 ${sizeClasses[size]}`}>
          <span>{s}</span>
        </span>
      );
  }
};
