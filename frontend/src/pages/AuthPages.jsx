import React, { useState } from 'react';
import { Building2, Sparkles, User, Lock, Mail, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPages = ({ defaultMode = 'login', setTab }) => {
  const { login, register, switchRole } = useAuth();
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  
  // Login state
  const [email, setEmail] = useState('citizen@smartcity.gov');
  const [password, setPassword] = useState('password123');

  // Register state
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('citizen');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setTab('home');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        name,
        email: regEmail,
        password: regPassword,
        phone,
        role
      });
      setTab('home');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (key) => {
    setLoading(true);
    try {
      await switchRole(key);
      setTab(key === 'admin' ? 'admin_dashboard' : key.includes('officer') ? 'department_dashboard' : 'citizen_dashboard');
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-smart-600 text-white mx-auto flex items-center justify-center font-bold shadow-lg shadow-smart-600/30">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {isLogin ? 'Sign in to CivicConnect AI' : 'Create Citizen Account'}
        </h2>
        <p className="text-xs text-slate-500">
          Smart City Portal • AI-Based Priority Routing System
        </p>
      </div>

      {/* 1-Click Demo Login Box */}
      <div className="bg-gradient-to-tr from-smart-50 to-indigo-50 border border-smart-200 rounded-2xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-smart-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick 1-Click Demo Personas (No Password Needed)</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleDemoLogin('citizen')}
            className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-left font-semibold text-slate-800 transition shadow-xs"
          >
            👤 Citizen
            <span className="block text-[10px] text-slate-400 font-normal">Arun Sharma</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-left font-semibold text-purple-800 transition shadow-xs"
          >
            🏛️ Municipal Admin
            <span className="block text-[10px] text-slate-400 font-normal">Commissioner</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('roads_officer')}
            className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-left font-semibold text-blue-800 transition shadow-xs"
          >
            🚧 Roads Officer
            <span className="block text-[10px] text-slate-400 font-normal">Suresh Kumar</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('sanitation_officer')}
            className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-left font-semibold text-green-800 transition shadow-xs"
          >
            🧹 Sanitation Officer
            <span className="block text-[10px] text-slate-400 font-normal">Meera Nair</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Tab switch */}
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${
              isLogin ? 'border-smart-600 text-smart-700 font-bold' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${
              !isLogin ? 'border-smart-600 text-smart-700 font-bold' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@smartcity.gov"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-smart-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-smart-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-smart-600 hover:bg-smart-700 text-white text-xs font-bold rounded-xl shadow transition mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Priya Sharma"
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-smart-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="priya@example.com"
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-smart-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-smart-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-smart-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-smart-600 hover:bg-smart-700 text-white text-xs font-bold rounded-xl shadow transition mt-2"
            >
              {loading ? 'Creating Account...' : 'Register Citizen Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
