// src/company/sections/Overview.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, Mail, Settings, Plus, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 

  Briefcase,
  Users,
  Calendar
} from 'lucide-react';


// Mock data removed, now following DB values


const Overview = ({ company }) => {
  const [logo, setLogo] = useState(null);
  const [dashboardStats, setDashboardStats] = useState([
    { label: 'Active Jobs', value: '0', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Applications', value: '0', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Interviews Scheduled', value: '0', icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Shortlisted', value: '0', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  ]);
  const token = localStorage.getItem("access");
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"; 

    useEffect(() => {
      if (!token) return;

      const fetchLogo = async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/accounts/company/profile/`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            console.error("Failed to fetch logo. Status:", res.status);
            return;
          }

          const data = await res.json();
          setLogo(data.brand_logo || null);
        } catch (err) {
          console.error("Error fetching logo:", err);
        }
      };

      const fetchDashboardStats = async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/accounts/company/stats/`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) return;

          const data = await res.json();
          setDashboardStats([
            { label: 'Active Jobs', value: data.active_jobs, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Total Applications', value: data.total_applications, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Interviews Scheduled', value: data.interviews, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Shortlisted', value: data.shortlisted, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
          ]);
        } catch (err) {
          console.error("Error fetching stats:", err);
        }
      };

      fetchLogo();
      fetchDashboardStats();
    }, [token, BASE_URL]);

  return (
        <div className="space-y-8 animate-fade-in">
          {/* Verification Banner */}
          {company.verification_status === 'unverified' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900">Complete Your Profile</h3>
                  <p className="text-amber-700 text-sm">Please complete your business details and upload documents in settings to request verification.</p>
                </div>
              </div>
              <Link to="/company/dashboard?tab=settings" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-600/20 whitespace-nowrap">
                Go to Settings
              </Link>
            </div>
          )}

          {company.verification_status === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Verification Pending</h3>
                <p className="text-blue-700 text-sm">Your profile is under review by our admin team. You'll be able to post jobs once verified.</p>
              </div>
            </div>
          )}

          {company.verification_status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-red-900">Verification Rejected</h3>
                  <p className="text-red-700 text-sm">Reason: {company.rejection_reason || "Documents were non-compliant."}. Please update your profile.</p>
                </div>
              </div>
              <Link to="/company/dashboard?tab=settings" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 whitespace-nowrap">
                Update Profile
              </Link>
            </div>
          )}

          {/* Company Header Card */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
                <span className="text-3xl font-bold text-slate-400">
                  {company.company_name?.[0]}
                </span>
              </div> */}

              <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                {logo ? (
  <img
    src={logo}
    alt="Company Logo"
    className="w-full h-full object-cover"
  />
) : (
  <span className="text-3xl font-bold text-slate-400">
    {company.company_name?.[0]}
  </span>
)}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-slate-900">
                    {company.company_name}
                  </h1>
                  {company.verification_status === 'verified' ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-tighter border border-green-200">
                      <ShieldCheck className="w-3 h-3 fill-green-700 text-white" /> Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-tighter border border-slate-200">
                      <ShieldAlert className="w-3 h-3" /> Unverified
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-slate-500 text-sm">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" /> {company.email}
                  </span>
                  <span className="px-2 py-0.5 bg-brand-accent/10 text-brand-accent rounded-full font-bold text-xs uppercase tracking-wide">
                    Company Account
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link 
                to="/company/dashboard?tab=settings"
                className="px-5 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" /> Manage Profile
              </Link>
              {/* <button className="px-6 py-2.5 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-navy/20 flex items-center gap-2"> */}
                <Link to="/company/post-job"  className="px-6 py-2.5 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-navy/20 flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Post a New Job
                </Link>
              {/* </button> */}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
            ))}
          </div>

        </div>
      );
};

export default Overview;
