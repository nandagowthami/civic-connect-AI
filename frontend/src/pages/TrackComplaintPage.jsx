import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Sparkles, 
  Users, 
  ArrowRight, 
  ShieldAlert, 
  ThumbsUp, 
  Image as ImageIcon,
  Loader2,
  Calendar
} from 'lucide-react';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { assetUrl } from '../lib/runtime';
import { useAuth } from '../context/AuthContext';

export const TrackComplaintPage = ({ initialComplaintId }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState(initialComplaintId || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [supported, setSupported] = useState(false);
  const [supporting, setSupporting] = useState(false);

  const fetchComplaint = async (searchQ) => {
    if (!searchQ || !searchQ.trim()) return;
    setError('');
    setLoading(true);
    setSupported(false);

    try {
      const res = await axios.get(`/api/issues/track/${encodeURIComponent(searchQ.trim())}`);
      setComplaint(res.data);
    } catch (err) {
      console.error('Track error:', err);
      setComplaint(null);
      setError(err.response?.data?.detail || `No complaint found matching "${searchQ}".`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialComplaintId) {
      setQuery(initialComplaintId);
      fetchComplaint(initialComplaintId);
    }
  }, [initialComplaintId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComplaint(query);
  };

  const handleSupportIssue = async () => {
    if (!complaint || supported || user?.role !== 'citizen') return;
    setSupporting(true);
    try {
      const res = await axios.post(`/api/issues/${complaint.complaint_id}/support`, {
        notes: "Verified by citizen tracker"
      });
      setSupported(true);
      // Refresh complaint details to reflect elevated count & priority
      fetchComplaint(complaint.complaint_id);
    } catch (err) {
      console.error('Support error:', err);
    } finally {
      setSupporting(false);
    }
  };

  // Determine active step index in standard pipeline
  const getStepIndex = (status) => {
    switch (status) {
      case 'Submitted': return 1;
      case 'Under AI Review': return 2;
      case 'Assigned': return 3;
      case 'In Progress': return 4;
      case 'Resolved': return 5;
      case 'Rejected': return 0;
      default: return 3;
    }
  };

  const currentStep = complaint ? getStepIndex(complaint.status) : 1;

  const timelineSteps = [
    { step: 1, title: 'Submitted', desc: 'Complaint registered by citizen' },
    { step: 2, title: 'AI Verified', desc: 'Visual & NLP priority assessed' },
    { step: 3, title: 'Assigned', desc: 'Routed to municipal department' },
    { step: 4, title: 'In Progress', desc: 'Field engineering work active' },
    { step: 5, title: 'Resolved', desc: 'Verified with photographic proof' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-smart-50 text-smart-700 text-xs font-semibold mb-2">
          <Clock className="w-3.5 h-3.5 text-smart-600" />
          <span>Real-Time Citizen Audit Timeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Track Civic Complaint Status
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Search using your Complaint ID (e.g. <span className="font-mono font-semibold text-smart-600">CC-2026-1042</span>). No name, phone number, or email is needed.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        <Search className="w-5 h-5 text-slate-400 ml-2.5 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter complaint ID (CC-2026-XXXX)"
          className="w-full text-sm px-2 py-2 focus:outline-none text-slate-900 placeholder-slate-400"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-smart-600 hover:bg-smart-700 text-white font-semibold text-xs px-6 py-3 rounded-xl transition shadow shrink-0 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Track Status</span>
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Complaint Details and Timeline */}
      {complaint && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-smart-700 bg-smart-50 px-2.5 py-1 rounded-md border border-smart-200">
                    {complaint.complaint_id}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">• {complaint.category}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{complaint.title}</h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={complaint.priority} size="md" />
                <StatusBadge status={complaint.status} size="md" />
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Details */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Problem Description
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {complaint.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <span className="text-slate-400 font-medium block">📍 Location</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{complaint.location?.address}</span>
                    {complaint.location?.landmark && (
                      <span className="text-slate-500 text-[11px] block mt-0.5">Near {complaint.location.landmark}</span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <span className="text-slate-400 font-medium block">🏛️ Assigned Department</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{complaint.department}</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">Priority Score: {complaint.priority_score} / 100</span>
                  </div>
                </div>

                {/* Crowd Support Impact Box */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-smart-600 text-white flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Reported by {complaint.report_count || 1} Citizen{complaint.report_count > 1 ? 's' : ''}
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {complaint.report_count > 1 
                          ? 'Multiple reports clustered automatically. Priority elevated!'
                          : 'Are you also affected by this issue? Click to boost civic priority.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSupportIssue}
                    disabled={supporting || supported || user?.role !== 'citizen'}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                      supported 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-smart-600 hover:bg-smart-700 text-white shadow'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{supported ? '✓ Supported' : user?.role === 'citizen' ? 'I also face this' : 'Sign in as Citizen to support'}</span>
                  </button>
                </div>
              </div>

              {/* Right Images (Original & Resolution Proof) */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Submitted Photo
                  </h4>
                  {complaint.image_url ? (
                    <img 
                      src={assetUrl(complaint.image_url)}
                      alt="Civic Issue" 
                      className="w-full h-44 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-36 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                      No photograph attached
                    </div>
                  )}
                </div>

                {/* Resolution Proof Photo */}
                {complaint.resolution_proof_url && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        Resolution Proof Photo
                      </h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        VERIFIED
                      </span>
                    </div>
                    <img 
                      src={assetUrl(complaint.resolution_proof_url)}
                      alt="Resolution Proof" 
                      className="w-full h-44 object-cover rounded-xl border-2 border-emerald-500 shadow-sm"
                    />
                    {complaint.resolution_notes && (
                      <p className="text-[11px] text-slate-600 mt-1.5 italic bg-emerald-50/60 p-2 rounded border border-emerald-200">
                        "{complaint.resolution_notes}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visual Progress Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="font-bold text-slate-900 text-base mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-smart-600" />
              <span>Status Progress Workflow</span>
            </h3>

            {/* Step Bar */}
            <div className="relative">
              {/* Connecting line */}
              <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0">
                <div 
                  className="h-full bg-smart-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, (currentStep - 1) * 25))}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                {timelineSteps.map((s) => {
                  const isDone = currentStep >= s.step;
                  const isCurrent = currentStep === s.step;

                  return (
                    <div key={s.step} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition duration-300 shrink-0 ${
                        isDone
                          ? 'bg-smart-600 text-white ring-4 ring-smart-100 shadow'
                          : 'bg-slate-100 text-slate-400 border border-slate-300'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : s.step}
                      </div>

                      <div className="sm:text-center">
                        <div className={`text-xs font-bold ${isCurrent ? 'text-smart-700 font-extrabold' : isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                          {s.title}
                        </div>
                        <div className="text-[11px] text-slate-500 hidden sm:block mt-0.5">
                          {s.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audit History Log */}
            {complaint.status_history && complaint.status_history.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                  Official Audit Log & Action History
                </h4>
                <div className="space-y-3">
                  {complaint.status_history.map((hist, idx) => (
                    <div key={hist._id || idx} className="flex items-start gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-smart-500 mt-1.5 shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>{hist.title}</span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            {hist.timestamp ? hist.timestamp.replace('T', ' ').slice(0, 19) : ''}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{hist.description}</p>
                        <div className="text-[10px] text-slate-400 mt-1">Action by: {hist.updated_by}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
