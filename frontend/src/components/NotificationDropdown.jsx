import React from 'react';
import { Bell, Check, ExternalLink, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotificationDropdown = ({ isOpen, onClose, onSelectComplaint }) => {
  const { notifications, unreadCount, markNotificationRead } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-smart-600" />
          <span className="font-semibold text-sm text-slate-800">Civic Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-smart-600 text-white rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            <Info className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            No notifications yet. You'll receive updates when your reports change status.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-3.5 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-xs text-slate-900">{n.title}</p>
                {!n.is_read && (
                  <button
                    onClick={() => markNotificationRead(n._id)}
                    className="text-slate-400 hover:text-smart-600 p-0.5"
                    title="Mark read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                <span>{n.created_at?.slice(0, 10) || 'Recent'}</span>
                {n.complaint_id && (
                  <button
                    onClick={() => {
                      onSelectComplaint(n.complaint_id);
                      onClose();
                    }}
                    className="text-smart-600 hover:text-smart-800 font-medium inline-flex items-center gap-1"
                  >
                    <span>Track {n.complaint_id}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
