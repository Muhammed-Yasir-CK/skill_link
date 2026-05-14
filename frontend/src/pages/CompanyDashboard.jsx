import React, { useEffect,useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Overview from './company_sections/Overview';
import Jobs from './company_sections/Jobs';
import Candidates from './company_sections/Candidates';
// import Messages from './company_sections/Messages';
import CompanySettings from './company_sections/CompanySettings';

import { useAuth } from '../context/AuthContext';


import api from '../api/axios';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    MessageSquare,
    Settings,
    Plus,
    CheckCircle,
    Clock,
    XCircle,
    Search,
    Filter,
    MoreHorizontal,
    TrendingUp,
    UserPlus,
    CreditCard,
    Shield,
    Globe,
    Mail,
    Phone,
    Calendar,
    MapPin
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

// Mock Data
const stats = [
    { label: 'Active Jobs', value: '12', change: '+2', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Applications', value: '843', change: '+124', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Interviews Scheduled', value: '18', change: '+4', icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Shortlisted', value: '45', change: '+12', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
];

const activeJobs = [
    { id: 1, title: 'Senior Frontend Developer', location: 'Remote', applicants: 142, status: 'Active', posted: '2 days ago' },
    { id: 2, title: 'UX Designer', location: 'San Francisco, CA', applicants: 89, status: 'Active', posted: '5 days ago' },
    { id: 3, title: 'Product Manager', location: 'New York, NY', applicants: 215, status: 'Paused', posted: '2 weeks ago' },
];

const recentCandidates = [
    { id: 1, name: 'Alex Johnson', role: 'Senior Frontend Developer', exp: '5 Years', status: 'New', avatar: null },
    { id: 2, name: 'Sarah Wilson', role: 'UX Designer', exp: '3 Years', status: 'Reviewing', avatar: null },
    { id: 3, name: 'Mike Brown', role: 'Product Manager', exp: '7 Years', status: 'Interview', avatar: null },
];

const pipeline = [
    { stage: 'New Applied', count: 145, color: 'bg-blue-500' },
    { stage: 'Screening', count: 68, color: 'bg-indigo-500' },
    { stage: 'Interview', count: 24, color: 'bg-purple-500' },
    { stage: 'Offer Sent', count: 8, color: 'bg-pink-500' },
    { stage: 'Hired', count: 3, color: 'bg-green-500' },
];



const CompanyDashboard = () => {
  const { user: company ,loading} = useAuth();
  // 1. URL tab handling
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';


  if (loading) return <div>Loading dashboard...</div>; // wait until context is ready
  if (!company) return <div>Unauthorized. Please log in as a company.</div>; // fallback


  // 5. Page content
  const renderContent = () => {
  switch (activeTab) {
    case 'overview':
      return <Overview company={company} />;

    case 'jobs':
      return <Jobs />;

    case 'candidates':
      return <Candidates />;

    // case 'messages':
    //   return <Messages />;

    case 'settings':
      return <CompanySettings />;

    default:
      return (
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Settings className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Work in Progress
          </h2>
          <p className="text-slate-500">
            This section ({activeTab}) is coming soon.
          </p>
        </div>
      );
  }
};


 
  // 6. Final render
return (
  <div className="min-h-screen bg-slate-50/50 font-sans flex flex-col">
    <Header />


    <div className="bg-brand-navy pb-32 pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Company Dashboard
          </h1>
          <p className="text-slate-400">
            Manage your jobs, pipeline, and team all in one place.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="hidden md:flex bg-white/10 rounded-xl p-1 backdrop-blur-sm border border-white/5">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'jobs', label: 'Jobs', icon: Briefcase },
            { id: 'candidates', label: 'Candidates', icon: Users },
            // { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <Link
              key={tab.id}
              to={`/company/dashboard?tab=${tab.id}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-accent text-brand-navy shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </div>

    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-32 flex-1 w-full min-h-[90vh]">
      {renderContent()}
    </main>

    <Footer />
  </div>
);

};

export default CompanyDashboard;
