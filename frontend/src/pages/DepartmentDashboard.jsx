import React, { useState, useEffect } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Upload, 
  MapPin, 
  Calendar, 
  Building2, 
  Check, 
  ArrowRight, 
  Loader2, 
  Image as ImageIcon,
  MessageSquare,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { ImageUploader } from '../components/ImageUploader';

const DEPARTMENTS = [
  "Roads and Transportation Department",
  "Sanitation Department",
  "Electricity Department",
  "Water Supply Department",
  "Municipal Engineering Department",
  "Emergency / Public Safety Department",
  "Public Works Department",
  "Traffic Management Department"
];

export const DepartmentDashboard = ({ setTab, onSelectComplaint }) => {
  const { user } = useAuth();
  
  // Default to user's assigned department or Roads
  const [currentDept, setCurrentDept] = useState(
    user?.department || "Roads and Transportation Department"
  );
  
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'High Priority', 'Pending', 'In Progress', 'Resolved'
  const [loading, setLoading] = useState(true);

  // Resolution modal state
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [proofImage, setProofImage] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submittingResolution, setSubmittingResolution] = useState(false);

  // Quick progress notes modal
  const [progressModalComplaint, setProgressModalComplaint] = useState(null);
  const [progressNotes, setProgressNotes] = useState('');
  const [submittingProgress, setSubmittingProgress] = useState(false);

  const fetchDepartmentComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/issues?department=${encodeURIComponent(currentDept)}`);
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch department complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentComplaints();
  }, [currentDept]);

  // Status transitions
  const handleAcceptComplaint = async (complaintId) => {
    try {
      await axios.patch(`/api/issues/${complaintId}/status`, {
        status: 'Assigned',
        notes: `Accepted by ${user?.name || 'Department Officer'}. Queued for work crew dispatch.`
      });
      fetchDepartmentComplaints();
    } catch (err) {
      console.error('Accept error:', err);
    }
  };

  const handleStartWork = async (complaintId) => {
    try {
      await axios.patch(`/api/issues/${complaintId}/status`, {
        status: 'In Progress',
        notes: `Work started by ${user?.name || 'Field Officer'}. Equipment and materials deployed to site.`
      });
      fetchDepartmentComplaints();
    } catch (err) {
      console.error('Start work error:', err);
    }
  };

  const handleSaveProgressNotes = async () => {
    if (!progressModalComplaint) return;
    setSubmittingProgress(true);
    try {
      await axios.patch(`/api/issues/${progressModalComplaint.complaint_id}/status`, {
        status: progressModalComplaint.status,
        notes: progressNotes || "Progress updated by field officer."
      });
      setProgressModalComplaint(null);
      setProgressNotes('');
      fetchDepartmentComplaints();
    } catch (err) {
      console.error('Update progress error:', err);
    } finally {
      setSubmittingProgress(false);
    }
  };

  const handleConfirmResolution = async (e) => {
    e.preventDefault();
    if (!resolvingComplaint) return;

    setSubmittingResolution(true);
    try {
      await axios.patch(`/api/issues/${resolvingComplaint.complaint_id}/status`, {
        status: 'Resolved',
        notes: resolutionNotes || "Civic infrastructure issue successfully repaired and verified by department team.",
        resolution_proof_url: proofImage
      });

      // Confetti Celebration!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (_) {}

      setResolvingComplaint(null);
      setProofImage('');
      setResolutionNotes('');
      fetchDepartmentComplaints();
    } catch (err) {
      console.error('Resolution error:', err);
    } finally {
      setSubmittingResolution(false);
    }
  };

  // Tab Filtering
  const filtered = complaints.filter(c => {
    if (activeTab === 'High Priority') return c.priority === 'HIGH' && c.status !== 'Resolved';
    if (activeTab === 'Pending') return ['Submitted', 'Assigned', 'Under AI Review'].includes(c.status);
    if (activeTab === 'In Progress') return c.status === 'In Progress';
    if (activeTab === 'Resolved') return c.status === 'Resolved';
    return true;
  });

  const highPriorityCount = complaints.filter(c => c.priority === 'HIGH' && c.status !== 'Resolved').length;
  const pendingCount = complaints.filter(c => ['Submitted', 'Assigned', 'Under AI Review'].includes(c.status)).length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Department Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-smart-700 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5 text-smart-600" />
            <span>Department Operations Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {currentDept}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Officer on Duty: <strong className="text-slate-800">{user?.name || 'Department Officer'}</strong>
          </p>
        </div>

        {/* Department Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">View Department:</span>
          <select
            value={currentDept}
            onChange={(e) => setCurrentDept(e.target.value)}
            className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-smart-500"
          >
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Stat Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('All')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'All' 
              ? 'bg-smart-600 text-white border-smart-600 shadow-md' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-smart-300'
          }`}
        >
          <span className={`text-xs uppercase font-semibold block ${activeTab === 'All' ? 'text-smart-100' : 'text-slate-500'}`}>
            Assigned Complaints
          </span>
          <span className="text-2xl font-black mt-1 block">{complaints.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('High Priority')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'High Priority' 
              ? 'bg-rose-600 text-white border-rose-600 shadow-md' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-semibold block ${activeTab === 'High Priority' ? 'text-rose-100' : 'text-rose-600'}`}>
              High Priority
            </span>
            <AlertTriangle className={`w-4 h-4 ${activeTab === 'High Priority' ? 'text-white' : 'text-rose-600'}`} />
          </div>
          <span className="text-2xl font-black mt-1 block">{highPriorityCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('In Progress')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'In Progress' 
              ? 'bg-amber-600 text-white border-amber-600 shadow-md' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
          }`}
        >
          <span className={`text-xs uppercase font-semibold block ${activeTab === 'In Progress' ? 'text-amber-100' : 'text-amber-600'}`}>
            In Progress
          </span>
          <span className="text-2xl font-black mt-1 block">{inProgressCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('Resolved')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'Resolved' 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <span className={`text-xs uppercase font-semibold block ${activeTab === 'Resolved' ? 'text-emerald-100' : 'text-emerald-600'}`}>
            Resolved / Proofs
          </span>
          <span className="text-2xl font-black mt-1 block">{resolvedCount}</span>
        </button>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">
            Work Order Queue • {activeTab} ({filtered.length})
          </h3>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
            <p className="font-semibold text-sm">No complaints found in "{activeTab}" queue.</p>
            <p className="text-xs text-slate-400 mt-1">All issues in this category are up to date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((issue) => (
              <div
                key={issue.complaint_id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-smart-300 transition flex flex-col md:flex-row gap-6"
              >
                {/* Photo Thumbnail */}
                <div className="w-full md:w-56 h-40 rounded-xl overflow-hidden bg-slate-100 relative shrink-0">
                  {issue.image_url ? (
                    <img 
                      src={issue.image_url} 
                      alt={issue.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Photo
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <PriorityBadge priority={issue.priority} size="sm" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-smart-700 bg-smart-50 px-2 py-0.5 rounded">
                          {issue.complaint_id}
                        </span>
                        <span className="text-xs text-slate-500">• {issue.category}</span>
                      </div>
                      <StatusBadge status={issue.status} size="sm" />
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mt-2">
                      {issue.title}
                    </h4>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                      {issue.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{issue.location?.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{issue.created_at?.slice(0, 10)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Citizen: {issue.citizen?.name || 'Verified Resident'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resolution notes if resolved */}
                  {issue.status === 'Resolved' && issue.resolution_proof_url && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-bold block">✓ Issue Resolved & Inspected</span>
                        <span className="text-[11px] text-emerald-700">{issue.resolution_notes}</span>
                      </div>
                      <a 
                        href={issue.resolution_proof_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-800 underline shrink-0"
                      >
                        View Proof Photo
                      </a>
                    </div>
                  )}

                  {/* Department Officer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        onSelectComplaint(issue.complaint_id);
                        setTab('track');
                      }}
                      className="text-xs font-semibold text-smart-600 hover:text-smart-800"
                    >
                      Audit Full Timeline →
                    </button>

                    <div className="flex items-center gap-2">
                      {/* If Assigned -> Start Work */}
                      {['Assigned', 'Submitted', 'Under AI Review'].includes(issue.status) && (
                        <button
                          onClick={() => handleStartWork(issue.complaint_id)}
                          className="px-3.5 py-1.5 rounded-lg bg-smart-600 hover:bg-smart-700 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Start Field Work</span>
                        </button>
                      )}

                      {/* If In Progress -> Add Notes or Resolve */}
                      {issue.status === 'In Progress' && (
                        <>
                          <button
                            onClick={() => {
                              setProgressModalComplaint(issue);
                              setProgressNotes(issue.status_notes || '');
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                          >
                            Update Progress Notes
                          </button>

                          <button
                            onClick={() => {
                              setResolvingComplaint(issue);
                              setProofImage('');
                              setResolutionNotes('');
                            }}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Upload Proof & Resolve</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Upload Resolution Proof & Mark Resolved */}
      {resolvingComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleConfirmResolution} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Mark Complaint as Resolved
                </h3>
              </div>
              <span className="font-mono text-xs font-semibold text-smart-600 bg-smart-50 px-2 py-0.5 rounded">
                {resolvingComplaint.complaint_id}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Issue: {resolvingComplaint.title}
            </p>

            {/* Proof Image Upload */}
            <ImageUploader
              imageUrl={proofImage}
              onImageUploaded={(url) => setProofImage(url)}
              onRemoveImage={() => setProofImage('')}
              endpoint="/api/issues/upload-proof"
              label="Upload After-Repair Resolution Proof Photograph"
              hint="Take photo of completed asphalt resurfacing, cleared garbage or fixed light."
            />

            {/* Resolution Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Resolution Notes & Work Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="3"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Field team patched the road using asphalt mix under work order #882. Road reopened to traffic."
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResolvingComplaint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingResolution || !resolutionNotes.trim()}
                className="px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition flex items-center gap-2 disabled:opacity-50"
              >
                {submittingResolution ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying & Closing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Resolution & Close</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Quick Progress Notes */}
      {progressModalComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base">
              Add Field Progress Notes
            </h3>
            <textarea
              rows="3"
              value={progressNotes}
              onChange={(e) => setProgressNotes(e.target.value)}
              placeholder="e.g. Repair materials arriving at 2 PM. One lane closed for safety."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-smart-500"
            ></textarea>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setProgressModalComplaint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProgressNotes}
                disabled={submittingProgress}
                className="px-5 py-2 text-xs font-bold bg-smart-600 hover:bg-smart-700 text-white rounded-xl"
              >
                {submittingProgress ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
