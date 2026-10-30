import React, { useState } from 'react';
import axios from 'axios';
import { 
  Send, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Building2, 
  Layers, 
  Loader2, 
  ArrowRight,
  Info,
  Check,
  ShieldAlert,
  Users
} from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';
import { LocationPicker } from '../components/LocationPicker';
import { PriorityBadge } from '../components/PriorityBadge';

const CATEGORIES = [
  "Road Damage",
  "Pothole",
  "Garbage Problem",
  "Broken Streetlight",
  "Water Leakage",
  "Drainage Problem",
  "Damaged Public Property",
  "Traffic Problem",
  "Public Safety Issue",
  "Other"
];

export const ReportIssuePage = ({ setTab, onSelectComplaint }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Road Damage',
    description: '',
    address: 'Near Itukulapalli, near Anantha Lakshmi Engineering College, Anantapur',
    landmark: '',
    latitude: 14.5970078,
    longitude: 77.6557271,
    image_url: ''
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (loc) => {
    setFormData(prev => ({
      ...prev,
      latitude: loc.latitude,
      longitude: loc.longitude
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.address.trim()) {
      setError('Please provide issue title, detailed description, and address.');
      return;
    }

    setError('');
    setAnalyzing(true);

    try {
      const res = await axios.post('/api/issues', formData);
      setAiAnalysisResult(res.data);
    } catch (err) {
      console.error('Error submitting issue:', err);
      const detail = err.response?.data?.detail;
      const fallback = 'Failed to submit complaint. Please try again.';
      const message = Array.isArray(detail)
        ? detail.map(item => {
            const field = Array.isArray(item?.loc) ? item.loc.filter(part => part !== 'body').join('.') : '';
            const reason = typeof item?.msg === 'string' ? item.msg : 'Invalid value';
            return field ? `${field}: ${reason}` : reason;
          }).join(' ')
        : typeof detail === 'string' ? detail : fallback;
      setError(message || fallback);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-smart-50 text-smart-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-smart-600" />
          <span>Multimodal AI Ingestion Pipeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Report a Public Civic Issue
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Submit details and photograph of public infrastructure problems. Our AI will automatically verify, prioritize, and route it to the responsible department.
        </p>
      </div>

      {/* AI Success / Analysis Modal & Result Display */}
      {aiAnalysisResult && (
        <div className="mb-8 bg-white border-2 border-smart-500 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-smart-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Analysis & Auto-Routing Completed</h3>
                  <p className="text-xs text-smart-100">
                    Complaint ID: <strong className="text-white font-mono">{aiAnalysisResult.complaint_id}</strong>
                  </p>
                </div>
              </div>
              <PriorityBadge priority={aiAnalysisResult.priority} size="lg" />
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Grid of AI outputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Detected Category
                </span>
                <span className="font-bold text-slate-900 text-sm mt-1 block">
                  {aiAnalysisResult.category}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  AI Confidence
                </span>
                <span className="font-bold text-smart-600 text-sm mt-1 block">
                  {aiAnalysisResult.ai_analysis?.confidence_percentage}% Confidence
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Dispatched Department
                </span>
                <span className="font-bold text-slate-900 text-sm mt-1 block">
                  {aiAnalysisResult.department}
                </span>
              </div>
            </div>

            {/* AI Reasoning & Factor Breakdown */}
            <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-smart-800 font-semibold">
                <Info className="w-4 h-4 text-smart-600" />
                <span>AI Priority Determination Rationale:</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {aiAnalysisResult.ai_analysis?.ai_explanation}
              </p>

              {aiAnalysisResult.duplicate_of && (
                <div className="mt-2 pt-2 border-t border-blue-200 text-amber-800 font-medium flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>
                    Linked to ongoing neighborhood cluster (Parent #{aiAnalysisResult.duplicate_of}). Priority score elevated to accelerate dispatch!
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAiAnalysisResult(null);
                  setFormData({
                    title: '',
                    category: 'Road Damage',
                    description: '',
                    address: 'Near Itukulapalli, near Anantha Lakshmi Engineering College, Anantapur',
                    landmark: '',
                    latitude: 14.5970078,
                    longitude: 77.6557271,
                    image_url: ''
                  });
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition w-full sm:w-auto"
              >
                Submit Another Report
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectComplaint(aiAnalysisResult.complaint_id);
                  setTab('track');
                }}
                className="inline-flex items-center justify-center gap-2 bg-smart-600 hover:bg-smart-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow transition w-full sm:w-auto"
              >
                <span>Track Complaint Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Issue Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Issue Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            minLength={5}
            maxLength={140}
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g. Large pothole near main road / Broken streetlight at 8th cross"
            required
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-smart-500 focus:border-smart-500 transition"
          />
        </div>

        {/* Issue Category & Landmark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Issue Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-smart-500 focus:border-smart-500 bg-white transition"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Landmark (Optional)
            </label>
            <input
              type="text"
              name="landmark"
            maxLength={200}
              value={formData.landmark}
              onChange={handleInputChange}
              placeholder="e.g. Near Itukulapalli bus stop, Anantapur"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-smart-500 focus:border-smart-500 transition"
            />
          </div>
        </div>

        {/* Issue Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Issue Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            minLength={10}
            maxLength={5000}
            rows="4"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Provide details about the issue: size of damage, how long it has been there, any accidents or public safety risks..."
            required
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-smart-500 focus:border-smart-500 transition leading-relaxed"
          ></textarea>
        </div>

        {/* Upload Image Section */}
        <ImageUploader
          imageUrl={formData.image_url}
          onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
          onRemoveImage={() => setFormData(prev => ({ ...prev, image_url: '' }))}
          label="Upload Issue Photograph"
          hint="Upload clear photo showing damage. AI analyzes surface fracture, water pooling or hazardous wires."
        />

        {/* Address Entry */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Manual Street Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              name="address"
            minLength={3}
            maxLength={300}
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g. Near Itukulapalli, Anantha Lakshmi Engineering College, Anantapur"
              required
              className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-smart-500 focus:border-smart-500 transition"
            />
          </div>
        </div>

        {/* Interactive Map Picker & GPS */}
        <LocationPicker
          latitude={formData.latitude}
          longitude={formData.longitude}
          address={formData.address}
          onLocationSelect={handleLocationSelect}
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
          <button
            type="submit"
            disabled={analyzing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-smart-600 to-indigo-600 hover:from-smart-700 hover:to-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-smart-600/20 hover:scale-[1.01] transition duration-150 text-sm disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running Multimodal AI Vision & Priority Routing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Submit Issue for AI Analysis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
