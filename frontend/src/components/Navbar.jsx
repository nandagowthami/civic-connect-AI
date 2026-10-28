import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Search, 
  PlusCircle, 
  LayoutDashboard, 
  Bell, 
  User, 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  Layers,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar = ({ currentTab, setTab, onTrackComplaint }) => {
  const { user, logout, switchRole, unreadCount } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    if (user.role === 'admin') return 'Admin Portal';
    if (user.role === 'officer') return `${user.department?.split(' ')[0] || 'Officer'} Portal`;
    return 'Citizen Dashboard';
  };

  const getDashboardTabName = () => {
    if (!user) return 'citizen_dashboard';
    if (user.role === 'admin') return 'admin_dashboard';
    if (user.role === 'officer') return 'department_dashboard';
    return 'citizen_dashboard';
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'report', label: 'Report Issue', icon: PlusCircle, highlight: true },
    { id: 'track', label: 'Track Complaint', icon: Search },
    { id: 'map', label: 'Public Map', icon: MapPin },
    { id: getDashboardTabName(), label: getDashboardLabel(), icon: LayoutDashboard },
    { id: 'about', label: 'About & Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Smart City Hotline Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Smart City Operations: Active
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400">Civic Emergency Helpline: 1913 / 112</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-smart-300 px-2.5 py-0.5 rounded border border-slate-700 transition"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Role: <strong className="text-white capitalize">{user ? (user.role === 'officer' ? `${user.department?.split(' ')[0]} Officer` : user.role) : 'Guest'}</strong></span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-slate-200 text-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Persona
                </div>
                <div className="space-y-1 mt-1">
                  <button
                    onClick={() => { switchRole('citizen'); setShowRoleMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs hover:bg-smart-50 hover:text-smart-700 flex items-center justify-between"
                  >
                    <span>👤 Citizen (Arun Sharma)</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Citizen</span>
                  </button>
                  <button
                    onClick={() => { switchRole('admin'); setShowRoleMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs hover:bg-smart-50 hover:text-smart-700 flex items-center justify-between"
                  >
                    <span>🏛️ Municipal Admin</span>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Admin</span>
                  </button>
                  <button
                    onClick={() => { switchRole('roads_officer'); setShowRoleMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs hover:bg-smart-50 hover:text-smart-700 flex items-center justify-between"
                  >
                    <span>🚧 Roads Dept Officer</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Roads</span>
                  </button>
                  <button
                    onClick={() => { switchRole('sanitation_officer'); setShowRoleMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs hover:bg-smart-50 hover:text-smart-700 flex items-center justify-between"
                  >
                    <span>🧹 Sanitation Officer</span>
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Sanitation</span>
                  </button>
                  <button
                    onClick={() => { switchRole('electricity_officer'); setShowRoleMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs hover:bg-smart-50 hover:text-smart-700 flex items-center justify-between"
                  >
                    <span>⚡ Electricity Officer</span>
                    <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Electricity</span>
                  </button>
                  <button
                    onClick={() => { switchRole('water_officer'); setShowRoleMenu(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs hover:bg-smart-50 hover:text-smart-700 flex items-center justify-between"
                  >
                    <span>💧 Water Supply Officer</span>
                    <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded">Water</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => setTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-smart-700 via-smart-600 to-smart-500 flex items-center justify-center text-white shadow-md shadow-smart-500/20 group-hover:scale-105 transition">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">CivicConnect</span>
                <span className="text-xs font-extrabold uppercase px-1.5 py-0.5 bg-gradient-to-r from-smart-600 to-indigo-600 text-white rounded">AI</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Smart City Issue Reporting & AI Routing</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              if (item.highlight) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className="ml-2 inline-flex items-center gap-1.5 bg-smart-600 hover:bg-smart-700 text-white px-3.5 py-2 rounded-lg font-medium text-xs shadow-sm hover:shadow transition"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-smart-50 text-smart-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-slate-400" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Menu: Notifications + User Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                onSelectComplaint={(cid) => {
                  onTrackComplaint(cid);
                  setTab('track');
                }}
              />
            </div>

            {/* User Profile or Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden lg:block text-right leading-tight">
                  <div className="text-xs font-semibold text-slate-800">{user.name}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{user.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTab('login')}
                  className="text-xs font-medium text-slate-700 hover:text-smart-600 px-3 py-2 rounded-lg"
                >
                  Log In
                </button>
                <button
                  onClick={() => setTab('register')}
                  className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg shadow-sm"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                currentTab === item.id ? 'bg-smart-50 text-smart-700' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
