import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  PlusCircle, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Users, 
  Cpu, 
  Building2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { assetUrl } from '../lib/runtime';

export const HomePage = ({ setTab, onSelectComplaint }) => {
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [trackQuery, setTrackQuery] = useState('');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [complaintsRes, analyticsRes] = await Promise.all([
          axios.get('/api/issues?limit=6'),
          axios.get('/api/analytics/overview')
        ]);
        setRecentComplaints(complaintsRes.data);
        setStats(analyticsRes.data.kpis);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      }
    };
    loadHomeData();
  }, []);

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (trackQuery.trim()) {
      onSelectComplaint(trackQuery.trim());
      setTab('track');
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-smart-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 rounded-b-3xl shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-smart-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-60 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-8">
          {/* Government Smart City Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-smart-300 backdrop-blur shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-white">Smart City AI Governance</span>
            <span className="text-slate-500">•</span>
            <span>Automated Priority Routing System</span>
          </div>

          {/* Headings */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Report Civic Issues. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-smart-400 via-sky-300 to-indigo-300">
                Build a Better Community.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Report public problems quickly and easily. Our AI-powered system automatically prioritizes your complaint and routes it to the right department.
            </p>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setTab('report')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-smart-600 to-smart-500 hover:from-smart-500 hover:to-smart-400 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-smart-600/30 hover:scale-[1.02] transition duration-150 text-sm"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report an Issue</span>
            </button>
            <button
              onClick={() => setTab('track')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-8 py-3.5 rounded-xl backdrop-blur transition duration-150 text-sm"
            >
              <Search className="w-5 h-5 text-smart-400" />
              <span>Track Complaint</span>
            </button>
          </div>

          {/* Quick Track Search Bar */}
          <div className="max-w-xl mx-auto pt-6">
            <form onSubmit={handleQuickTrack} className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl p-1.5 shadow-2xl backdrop-blur">
              <Search className="w-5 h-5 text-slate-400 ml-2.5" />
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Track instantly via Complaint ID (e.g. CC-2026-1042) or Phone..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none px-2"
              />
              <button
                type="submit"
                className="bg-smart-600 hover:bg-smart-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shrink-0"
              >
                Track
              </button>
            </form>
          </div>

          {/* Live Metrics Strip */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 backdrop-blur">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Reported</span>
                <Activity className="w-4 h-4 text-smart-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {stats?.total_complaints ?? '—'}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Across 8 City Wards</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 backdrop-blur">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Resolved Issues</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {stats?.resolved ?? '—'}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{stats ? `${stats.resolution_rate_percent}%` : '—'} Resolution Rate</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 backdrop-blur">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>High Priority</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-rose-400 mt-1">
                {stats?.high_priority ?? '—'}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Rapid Action Dispatched</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 backdrop-blur">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Citizen Voices</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold text-sky-400 mt-1">
                {stats?.total_citizen_voices ?? '—'}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Crowdsourced & Clustered</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-smart-600 uppercase tracking-widest">Intelligent Automation</h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            How CivicConnect AI Solves City Problems
          </p>
          <p className="text-slate-600 text-sm mt-2">
            A seamless 4-step pipeline that transforms citizen reports into verified municipal resolutions in record time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:shadow-md hover:border-smart-300 transition">
            <div className="w-12 h-12 rounded-xl bg-smart-50 text-smart-600 flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Report with Photo & GPS</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Citizens capture the problem photograph, add a description, and pinpoint coordinates using interactive map or GPS detection.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:shadow-md hover:border-smart-300 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Multimodal AI Inspection</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Computer vision assesses image surface damage, while NLP scans urgency markers and hazards to assign category with high confidence.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:shadow-md hover:border-smart-300 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Multi-Factor Priority Routing</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              AI evaluates severity, public safety hazard, and nearby duplicate reports to route instantly to the appropriate municipal department.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:shadow-md hover:border-smart-300 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Resolution with Photo Proof</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Assigned department officers repair the issue, upload after-repair photographic proof, and close the complaint with citizen verification.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Public Issues Ticker / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xs font-bold text-smart-600 uppercase tracking-widest">Live Transparency</h2>
            <p className="text-2xl font-bold text-slate-900 mt-1">Recent Civic Reports Across the City</p>
          </div>
          <button
            onClick={() => setTab('map')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-smart-600 hover:text-smart-700 bg-smart-50 px-3.5 py-2 rounded-lg border border-smart-200 transition"
          >
            <span>View All on Public Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentComplaints.map((issue) => (
            <div
              key={issue.complaint_id}
              onClick={() => {
                onSelectComplaint(issue.complaint_id);
                setTab('track');
              }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-smart-300 transition cursor-pointer overflow-hidden flex flex-col group"
            >
              {/* Photo Thumbnail */}
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                {issue.image_url ? (
                  <img
                    src={assetUrl(issue.image_url)}
                    alt={issue.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                    <Building2 className="w-10 h-10 opacity-40" />
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5">
                  <PriorityBadge priority={issue.priority} size="sm" />
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <StatusBadge status={issue.status} size="sm" />
                </div>
                {issue.report_count > 1 && (
                  <div className="absolute bottom-2 left-2.5 bg-slate-900/85 backdrop-blur text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Users className="w-3 h-3 text-sky-400" />
                    <span>Reported by {issue.report_count} citizens</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-1.5">
                    <span>{issue.complaint_id}</span>
                    <span>{issue.category}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-smart-600 transition">
                    {issue.title}
                  </h4>
                  <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{issue.location?.address}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700 truncate">{issue.department}</span>
                    <span className="text-smart-600 font-semibold group-hover:underline shrink-0">
                      Track Timeline →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-smart-700 via-smart-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold">See a problem in your neighborhood?</h3>
            <p className="text-sm text-smart-100 leading-relaxed">
              Take a photo and upload it now. The AI priority engine verifies hazardous conditions and dispatches the municipal team automatically.
            </p>
          </div>
          <button
            onClick={() => setTab('report')}
            className="bg-white text-smart-700 hover:bg-smart-50 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:scale-105 transition shrink-0 text-sm flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5 text-smart-600" />
            <span>Submit New Issue</span>
          </button>
        </div>
      </section>
    </div>
  );
};
