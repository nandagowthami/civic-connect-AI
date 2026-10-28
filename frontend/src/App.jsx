import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { DepartmentDashboard } from './pages/DepartmentDashboard';
import { IssueMapPage } from './pages/IssueMapPage';
import { AuthPages } from './pages/AuthPages';
import { AboutContactPage } from './pages/AboutContactPage';

function AppContent() {
  const [currentTab, setTab] = useState('home');
  const [trackedComplaintId, setTrackedComplaintId] = useState('CC-2026-1042');
  const { user } = useAuth();

  const handleSelectComplaint = (cid) => {
    setTrackedComplaintId(cid);
    setTab('track');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomePage setTab={setTab} onSelectComplaint={handleSelectComplaint} />;
      case 'report':
        return <ReportIssuePage setTab={setTab} onSelectComplaint={handleSelectComplaint} />;
      case 'track':
        return <TrackComplaintPage initialComplaintId={trackedComplaintId} />;
      case 'map':
        return <IssueMapPage setTab={setTab} onSelectComplaint={handleSelectComplaint} />;
      case 'citizen_dashboard':
        return <CitizenDashboard setTab={setTab} onSelectComplaint={handleSelectComplaint} />;
      case 'admin_dashboard':
        return <AdminDashboard setTab={setTab} onSelectComplaint={handleSelectComplaint} />;
      case 'department_dashboard':
        return <DepartmentDashboard setTab={setTab} onSelectComplaint={handleSelectComplaint} />;
      case 'about':
        return <AboutContactPage />;
      case 'login':
        return <AuthPages defaultMode="login" setTab={setTab} />;
      case 'register':
        return <AuthPages defaultMode="register" setTab={setTab} />;
      default:
        return <HomePage setTab={setTab} onSelectComplaint={handleSelectComplaint} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-smart-500 selection:text-white">
      <Navbar 
        currentTab={currentTab} 
        setTab={setTab} 
        onTrackComplaint={handleSelectComplaint}
      />
      <main className="flex-1">
        {renderContent()}
      </main>
      <Footer setTab={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
