import React from 'react';
import { Building2, Shield, HeartHandshake, PhoneCall, Mail, ExternalLink } from 'lucide-react';

export const Footer = ({ setTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-smart-600 flex items-center justify-center text-white font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">CivicConnect AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Next-generation crowdsourced civic issue reporting system powered by computer vision, natural language processing, and automated priority routing for modern Smart Cities.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              City Municipal Operations Portal
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Citizen Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setTab('report')} className="hover:text-white transition">
                  Report Civic Problem
                </button>
              </li>
              <li>
                <button onClick={() => setTab('track')} className="hover:text-white transition">
                  Track Complaint Progress
                </button>
              </li>
              <li>
                <button onClick={() => setTab('map')} className="hover:text-white transition">
                  Public Geographic Issue Map
                </button>
              </li>
              <li>
                <button onClick={() => setTab('citizen_dashboard')} className="hover:text-white transition">
                  Citizen Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Integrated Departments</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Roads & Transportation Department</li>
              <li>• Solid Waste & Sanitation Department</li>
              <li>• Municipal Electricity & Lighting</li>
              <li>• Potable Water Supply Department</li>
              <li>• Municipal Engineering & Drainage</li>
              <li>• Emergency & Public Safety Agency</li>
            </ul>
          </div>

          {/* Helplines */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Emergency & Helpline</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-4 h-4 text-smart-400" />
                <span>Civic Helpline: <strong>1913</strong> (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-4 h-4 text-red-400" />
                <span>Emergency Hazards: <strong>112</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-smart-400" />
                <span>support@smartcity.gov</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-2">
                Available 24x7 for municipal infrastructure emergencies and citizen assistance.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 CivicConnect AI • Smart City Municipal Governance Portal</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Open Data Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
