import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import { 
  Building2, 
  AlertTriangle, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  Users, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  RefreshCw, 
  Check, 
  ShieldCheck,
  Edit3,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';

const PRIORITY_COLORS = {
  HIGH: '#ef4444',
  MEDIUM: '#f97316',
  LOW: '#10b981'
};

const CATEGORY_COLORS = [
  '#0284c7', '#16a34a', '#eab308', '#8b5cf6', '#dc2626', '#f97316', '#06b6d4', '#64748b'
];

export const AdminDashboard = ({ setTab, onSelectComplaint }) => {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal states for Reassign and Status Update
  const [modalComplaint, setModalComplaint] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'reassign' or 'status'
  const [newDepartment, setNewDepartment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [issuesRes, analyticsRes, deptsRes] = await Promise.all([
        axios.get('/api/issues?limit=100'),
        axios.get('/api/analytics/overview'),
        axios.get('/api/departments')
      ]);
      setComplaints(issuesRes.data);
      setAnalytics(analyticsRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApplyReassign = async () => {
    if (!modalComplaint || !newDepartment) return;
    setActionLoading(true);
    try {
      await axios.patch(`/api/issues/${modalComplaint.complaint_id}/assign`, {
        department: newDepartment,
        notes: actionNotes || "Department reassigned by Municipal Admin"
      });
      setModalMode(null);
      loadAdminData();
    } catch (err) {
      console.error('Reassign failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyStatusUpdate = async () => {
    if (!modalComplaint || !newStatus) return;
    setActionLoading(true);
    try {
      await axios.patch(`/api/issues/${modalComplaint.complaint_id}/status`, {
        status: newStatus,
        notes: actionNotes || `Status updated to ${newStatus} by Administrator`
      });
      setModalMode(null);
      loadAdminData();
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter complaints list
  const filteredComplaints = complaints.filter(c => {
    if (selectedDept !== 'All' && c.department !== selectedDept) return false;
    if (selectedPriority !== 'All' && c.priority !== selectedPriority) return false;
    if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.complaint_id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.location?.address?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const kpis = analytics?.kpis || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Smart City Municipal Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Government Authority & Administration Portal
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time civic intelligence, departmental dispatch automation, and city-wide resolution analytics.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Feed</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Total Reported</span>
            <Building2 className="w-4 h-4 text-smart-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {kpis.total_complaints || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across 8 departments</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-sm bg-red-50/20">
          <div className="flex items-center justify-between text-xs text-red-700 font-semibold uppercase">
            <span>High Priority</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-black text-red-600 mt-2">
            {kpis.high_priority || 0}
          </div>
          <div className="text-[11px] text-red-600/80 mt-1">Safety & road hazards</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm bg-amber-50/20">
          <div className="flex items-center justify-between text-xs text-amber-700 font-semibold uppercase">
            <span>Pending Issues</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">
            {kpis.pending || 0}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-1">Awaiting field start</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm bg-blue-50/20">
          <div className="flex items-center justify-between text-xs text-blue-700 font-semibold uppercase">
            <span>In Progress</span>
            <Wrench className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-600 mt-2">
            {kpis.in_progress || 0}
          </div>
          <div className="text-[11px] text-blue-600/80 mt-1">Work underway</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm bg-emerald-50/20">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold uppercase">
            <span>Resolved Issues</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {kpis.resolved || 0}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-semibold">
            {kpis.resolution_rate_percent || 0}% City Resolution
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (Donut) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Complaints by Category</h3>
            <p className="text-xs text-slate-500">Multimodal AI categorization distribution</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.by_category || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {(analytics?.by_category || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown (Bar) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Complaints by AI Priority Level</h3>
            <p className="text-xs text-slate-500">Calculated via multi-factor severity formula</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.by_priority || []}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(analytics?.by_priority || []).map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Complaint Trend (Area) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Monthly Complaint & Resolution Statistics</h3>
            <p className="text-xs text-slate-500">Reported vs. Resolved progress over 2026</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.monthly_trends || []}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="reported" stroke="#0284c7" fill="#e0f2fe" name="Reported" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#d1fae5" name="Resolved" />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Workloads Overview Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">
          Department Workload & Performance Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 truncate">{dept.code}</span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {dept.resolution_rate}% Resolved
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-900 mt-1 line-clamp-1">{dept.name}</p>
              <div className="mt-3 grid grid-cols-3 text-center border-t border-slate-200 pt-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">TOTAL</span>
                  <span className="font-bold text-slate-800">{dept.total_complaints}</span>
                </div>
                <div>
                  <span className="text-amber-500 text-[10px] block">ACTIVE</span>
                  <span className="font-bold text-amber-600">{dept.pending_count + dept.in_progress_count}</span>
                </div>
                <div>
                  <span className="text-red-500 text-[10px] block">HIGH PRI</span>
                  <span className="font-bold text-red-600">{dept.high_priority_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Complaints Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Civic Complaint Management Center</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review AI analysis, manually reassign departments, or update complaint lifecycle.
            </p>
          </div>

          {/* Search Table */}
          <div className="relative min-w-[260px] w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, title, address..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-smart-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
          >
            <option value="All">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
          >
            <option value="All">All Priorities</option>
            <option value="HIGH">High Priority 🔴</option>
            <option value="MEDIUM">Medium Priority 🟠</option>
            <option value="LOW">Low Priority 🟢</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <span className="text-xs text-slate-400 ml-auto">
            Showing {filteredComplaints.length} of {complaints.length} reports
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-3 text-left">Complaint ID</th>
                <th className="py-3 px-3 text-left">Issue</th>
                <th className="py-3 px-3 text-left">Category</th>
                <th className="py-3 px-3 text-left">Location</th>
                <th className="py-3 px-3 text-left">AI Priority</th>
                <th className="py-3 px-3 text-left">Department</th>
                <th className="py-3 px-3 text-left">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredComplaints.map((item) => (
                <tr key={item.complaint_id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-mono font-bold text-smart-700 whitespace-nowrap">
                    {item.complaint_id}
                    {item.report_count > 1 && (
                      <span className="block text-[10px] text-amber-600 font-normal">
                        ({item.report_count} clustered)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 max-w-[200px]">
                    <div className="font-semibold text-slate-900 truncate">{item.title}</div>
                    <div className="text-slate-400 text-[11px] truncate">{item.description}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                    {item.category}
                  </td>
                  <td className="py-3 px-3 max-w-[150px] truncate text-slate-600">
                    {item.location?.address}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <PriorityBadge priority={item.priority} size="sm" />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-800 font-medium">
                    {item.department}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          onSelectComplaint(item.complaint_id);
                          setTab('track');
                        }}
                        className="p-1.5 text-slate-500 hover:text-smart-600 hover:bg-smart-50 rounded"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setModalComplaint(item);
                          setNewDepartment(item.department);
                          setModalMode('reassign');
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                        title="Reassign Department"
                      >
                        Assign
                      </button>

                      <button
                        onClick={() => {
                          setModalComplaint(item);
                          setNewStatus(item.status);
                          setModalMode('status');
                        }}
                        className="px-2 py-1 bg-smart-50 hover:bg-smart-100 text-smart-700 rounded text-[11px] font-semibold"
                        title="Update Status"
                      >
                        Status
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal for Reassign & Status */}
      {modalMode && modalComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {modalMode === 'reassign' ? 'Reassign Department' : 'Update Complaint Status'}
              </h3>
              <span className="font-mono text-xs font-semibold text-smart-600 bg-smart-50 px-2 py-0.5 rounded">
                {modalComplaint.complaint_id}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Issue: {modalComplaint.title}
            </p>

            {modalMode === 'reassign' ? (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Select Department
                </label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-smart-500"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Update Workflow Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-smart-500"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Action Notes / Instructions
              </label>
              <textarea
                rows="2"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Add audit note or reason..."
                className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-smart-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={modalMode === 'reassign' ? handleApplyReassign : handleApplyStatusUpdate}
                className="px-5 py-2 text-xs font-bold bg-smart-600 hover:bg-smart-700 text-white rounded-xl shadow"
              >
                {actionLoading ? 'Saving...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
