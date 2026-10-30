import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Filter, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Building2,
  Users
} from 'lucide-react';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { assetUrl } from '../lib/runtime';

// Function to generate Leaflet custom colored pin icons
const createPriorityIcon = (priority) => {
  let color = '#10b981'; // green default
  if ((priority || '').toUpperCase().includes('HIGH')) {
    color = '#ef4444'; // red
  } else if ((priority || '').toUpperCase().includes('MED')) {
    color = '#f97316'; // orange
  }

  return new L.DivIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35); border: 2.5px solid white;">
            <div style="background: white; width: 10px; height: 10px; border-radius: 50%;"></div>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

export const IssueMapPage = ({ setTab, onSelectComplaint }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    const loadMapIssues = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/issues?limit=150');
        setComplaints(res.data);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMapIssues();
  }, []);

  const filteredIssues = complaints.filter(issue => {
    if (priorityFilter !== 'All' && issue.priority !== priorityFilter) return false;
    if (statusFilter !== 'All' && issue.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && issue.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-smart-50 text-smart-700 text-xs font-semibold mb-2">
            <MapPin className="w-3.5 h-3.5 text-smart-600" />
            <span>Geospatial Civic Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            City Civic Issue Heatmap
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time interactive map of citizen-reported infrastructure issues color-coded by AI priority.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm"></span>
            <span>🔴 High Priority</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-sm"></span>
            <span>🟠 Medium</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm"></span>
            <span>🟢 Low</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold"
          >
            <option value="All">All Priorities</option>
            <option value="HIGH">🔴 High Priority</option>
            <option value="MEDIUM">🟠 Medium Priority</option>
            <option value="LOW">🟢 Low Priority</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold"
          >
            <option value="All">All Categories</option>
            <option value="Pothole">Potholes</option>
            <option value="Road Damage">Road Damage</option>
            <option value="Garbage Problem">Garbage Problems</option>
            <option value="Broken Streetlight">Broken Streetlights</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Drainage Problem">Drainage Problems</option>
            <option value="Public Safety Issue">Public Safety Issues</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredIssues.length}</strong> geocoded issues on map
        </span>
      </div>

      {/* Fullscreen Map Container */}
      <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md relative">
        <MapContainer
          center={[14.5970078, 77.6557271]}
          zoom={15}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredIssues.map((issue) => {
            const loc = issue.location || {};
            const lat = loc.latitude || (loc.coordinates ? loc.coordinates[1] : null);
            const lng = loc.longitude || (loc.coordinates ? loc.coordinates[0] : null);

            if (!lat || !lng) return null;

            return (
              <Marker
                key={issue.complaint_id}
                position={[lat, lng]}
                icon={createPriorityIcon(issue.priority)}
              >
                <Popup className="custom-popup" maxWidth={320}>
                  <div className="p-1 space-y-2.5 text-slate-800">
                    {/* Thumbnail */}
                    {issue.image_url ? (
                      <img 
                        src={assetUrl(issue.image_url)}
                        alt={issue.title} 
                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                      />
                    ) : (
                      <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                        No photo attached
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="font-mono font-bold text-smart-700">{issue.complaint_id}</span>
                      <span className="text-slate-500">{issue.category}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs line-clamp-2">
                      {issue.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <PriorityBadge priority={issue.priority} size="sm" />
                      <StatusBadge status={issue.status} size="sm" />
                    </div>

                    {issue.report_count > 1 && (
                      <div className="text-[11px] text-amber-700 font-semibold bg-amber-50 p-1 rounded border border-amber-200 flex items-center gap-1">
                        <Users className="w-3 h-3 text-amber-600" />
                        <span>{issue.report_count} citizens reported this issue</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{issue.created_at?.slice(0, 10)}</span>
                      <button
                        onClick={() => {
                          onSelectComplaint(issue.complaint_id);
                          setTab('track');
                        }}
                        className="text-smart-600 hover:text-smart-800 font-bold inline-flex items-center gap-1"
                      >
                        <span>Audit Timeline</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
