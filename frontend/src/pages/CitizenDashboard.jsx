import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardList, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Eye, 
  Filter, 
  Search,
  Building2,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';

export const CitizenDashboard = ({ setTab, onSelectComplaint }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/issues');
        setComplaints(res.data);
      } catch (err) {
        console.error('Error fetching complaints:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [user]);

  // Compute stats
  const total = complaints.length;
  const pending = complaints.filter(c => ['Submitted', 'Under AI Review', 'Assigned'].includes(c.status)).length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  const filtered = complaints.filter(c => {
    if (filterStatus !== 'All') {
      if (filterStatus === 'Pending' && !['Submitted', 'Under AI Review', 'Assigned'].includes(c.status)) return false;
      if (filterStatus === 'In Progress' && c.status !== 'In Progress') return false;
      if (filterStatus === 'Resolved' && c.status !== 'Resolved') return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.complaint_id.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.location?.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Citizen Civic Portal
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Welcome back, <strong className="text-slate-800">{user?.name || 'Citizen'}</strong>. Track your reports and monitor civic repair progress.
          </p>
        </div>

        <button
          onClick={() => setTab('report')}
          className="inline-flex items-center gap-2 bg-smart-600 hover:bg-smart-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Civic Issue</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Complaints
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block">
              {total}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Reported to City</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Pending Complaints
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1 block">
              {pending}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting Dispatch</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Issues In Progress
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-smart-600 mt-1 block">
              {inProgress}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Field Squad Working</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-smart-50 text-smart-600 flex items-center justify-center font-bold">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Resolved Complaints
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 block">
              {resolved}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">With Photographic Proof</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Pending', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === tab
                  ? 'bg-smart-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search my complaints..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-smart-500"
          />
        </div>
      </div>

      {/* Complaints Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            My Civic Complaints & Reports ({filtered.length})
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">No complaints found matching this filter.</p>
            <p className="text-xs text-slate-400 mt-1">Try switching tabs or report a new issue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((issue) => (
              <div
                key={issue.complaint_id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-smart-300 transition group"
              >
                {/* Photo & Badges */}
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  {issue.image_url ? (
                    <img
                      src={issue.image_url}
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Building2 className="w-8 h-8 opacity-40" />
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
                      <span>{issue.report_count} citizens reported</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-1">
                      <span className="font-bold text-smart-700">{issue.complaint_id}</span>
                      <span>{issue.category}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mt-1 group-hover:text-smart-600 transition">
                      {issue.title}
                    </h3>

                    <p className="text-slate-600 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{issue.location?.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-slate-700 font-medium">{issue.department}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectComplaint(issue.complaint_id);
                        setTab('track');
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-smart-50 hover:bg-smart-100 text-smart-700 font-semibold text-xs py-2 rounded-xl border border-smart-200 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details & Timeline</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
