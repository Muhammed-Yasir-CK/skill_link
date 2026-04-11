import React from 'react';
import { Plus, Clock, CheckCircle, Users, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
const WorkDashboard = () => {
    const [stats, setStats] = useState([
        { label: 'Active Works', value: '0', color: 'bg-blue-500' },
        { label: 'Pending Applicants', value: '0', color: 'bg-amber-500' },
        { label: 'In Progress', value: '0', color: 'bg-indigo-500' },
        { label: 'Completed', value: '0', color: 'bg-emerald-500' },
    ]);

    const [recentWorks, setRecentWorks] = useState([]);
    const [applicantCount, setApplicantCount] = useState(0);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("access");
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch Stats
                const statsRes = await fetch("http://localhost:8000/api/work-stats/", { headers });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats([
                        { label: 'Active Works', value: statsData.active_works.toString(), color: 'bg-blue-500' },
                        { label: 'Pending Applicants', value: statsData.pending_applicants.toString(), color: 'bg-amber-500' },
                        { label: 'In Progress', value: statsData.in_progress.toString(), color: 'bg-indigo-500' },
                        { label: 'Completed', value: statsData.completed.toString(), color: 'bg-emerald-500' },
                    ]);
                    setApplicantCount(statsData.pending_applicants);
                }

                // Fetch Recent Works
                const worksRes = await fetch("http://localhost:8000/api/work-posts/", { headers });
                if (worksRes.ok) {
                    const worksData = await worksRes.json();
                    setRecentWorks(worksData.slice(0, 3));
                }

                // Fetch Activities
                const activitiesRes = await fetch("http://localhost:8000/api/work-activity/", { headers });
                if (activitiesRes.ok) {
                    const activitiesData = await activitiesRes.json();
                    setActivities(activitiesData);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            }
        };

        fetchDashboardData();
    }, []);

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Manage your works</h2>
                    <p className="text-indigo-100 max-w-lg mb-6">
                        {applicantCount > 0 
                            ? `You have ${applicantCount} new applicant${applicantCount > 1 ? 's' : ''} waiting for review. Check them out or post a new requirement.`
                            : "Easily manage your posted works and review applicant profiles effectively."}
                    </p>
                    <Link to="/work-dashboard/post-work" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all transform hover:-translate-y-1">
                        <Plus className="w-5 h-5" /> Post New Work
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-3 h-3 rounded-full ${stat.color} mb-3`} />
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Updates */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" /> Recent Updates
                    </h3>
                    <div className="space-y-4">
                        {activities.length > 0 ? (
                            activities.map((activity, idx) => (
                                <div key={idx} className={`flex items-start gap-4 p-3 rounded-xl border ${
                                    activity.type === 'new_applicant' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
                                }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                        activity.type === 'new_applicant' ? 'bg-amber-200 text-amber-700' : 'bg-emerald-200 text-emerald-700'
                                    }`}>
                                        {activity.type === 'new_applicant' ? '!' : <CheckCircle className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-slate-800 text-sm font-medium">{activity.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">{formatTime(activity.timestamp)} • {activity.detail}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm py-4 text-center">No recent updates.</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Recent Works */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900">Recent Works</h3>
                        <Link to="/work-dashboard/my-works" className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">View All <ArrowUpRight className="w-4 h-4" /></Link>
                    </div>
                    <div className="space-y-3">
                        {recentWorks.length > 0 ? (
                            recentWorks.map(work => (
                                <div key={work.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors group">
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{work.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                work.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                                work.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>{work.status}</span>
                                            <span className="text-xs text-slate-400">• Posted {work.posted || "Recently"}</span>
                                        </div>
                                    </div>
                                    {work.applicants > 0 && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                            <Users className="w-3 h-3" /> {work.applicants}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm py-4 text-center">No works posted yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkDashboard;
