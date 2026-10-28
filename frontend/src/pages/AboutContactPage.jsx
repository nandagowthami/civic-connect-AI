import React from 'react';
import { 
  Building2, 
  Cpu, 
  ShieldCheck, 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';

export const AboutContactPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* About Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-smart-50 text-smart-700 text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5 text-smart-600" />
          <span>Smart City Civic Infrastructure Mission</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          CivicConnect AI System
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Empowering citizens through artificial intelligence. We bridge the gap between community reports and rapid municipal action through automated priority routing.
        </p>
      </div>

      {/* AI Architecture Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-smart-600 text-white flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Four Pillars of the Civic AI Engine</h3>
            <p className="text-xs text-slate-500">Autonomous processing from pixel to work order</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-smart-600"></span>
              1. Computer Vision Image Analysis
            </h4>
            <p className="leading-relaxed">
              Examines uploaded photos for texture irregularity, surface fractures, specular reflections (water pooling), edge roughness (potholes), and refuse color entropy to confirm physical damage.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              2. Natural Language Processing & Urgency
            </h4>
            <p className="leading-relaxed">
              Analyzes citizen descriptions using domain ontologies and hazard triggers ("accident", "electric wire", "flooding", "school zone") to infer problem categories and risk levels.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              3. Multi-Factor Priority Scoring
            </h4>
            <p className="leading-relaxed">
              Combines Severity (0-40), Public Safety Risk (0-25), Location Criticality (0-15), and Citizen Density (0-20) into dynamic priority classifications: 🔴 High, 🟠 Medium, and 🟢 Low.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              4. Spatial Duplicate Clustering
            </h4>
            <p className="leading-relaxed">
              Identifies overlapping complaints within 150 meters using the Haversine formula and text similarity. Clustered reports elevate community weight instead of flooding department queues.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-lg">Civic Assistance & Contacts</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Need urgent assistance or want to follow up on a major infrastructure breakdown? Connect with our citizen helpline.
          </p>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <PhoneCall className="w-5 h-5 text-smart-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Civic Toll-Free Helpline</span>
                <span className="text-slate-600">Dial <strong>1913</strong> (Toll Free, 24x7)</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
              <PhoneCall className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-900 block">Emergency Public Hazards</span>
                <span className="text-red-700">Dial <strong>112</strong> (Police, Fire, Ambulance & Safety)</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Mail className="w-5 h-5 text-smart-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Grievance & Support Email</span>
                <span className="text-slate-600">support@smartcity.gov / complaints@smartcity.gov</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <MapPin className="w-5 h-5 text-smart-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Central Municipal Corporation</span>
                <span className="text-slate-600">Smart City Command Centre, Ward 1, Central Secretariat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback / Inquiry Quick Message Box */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Send Feedback to Municipal Council</h3>
          <form onSubmit={(e) => { e.preventDefault(); alert("Thank you! Your feedback has been forwarded to the Municipal Council."); }} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Your Name</label>
              <input
                type="text"
                required
                defaultValue="Citizen User"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-smart-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Email or Phone</label>
              <input
                type="text"
                required
                defaultValue="citizen@smartcity.gov"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-smart-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Message / Suggestion</label>
              <textarea
                rows="4"
                required
                placeholder="Share your suggestion for smart city improvements..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-smart-500"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-smart-600 hover:bg-smart-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Submit Feedback
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
