import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            {trend !== undefined && (
                <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-brand-navy">{value}</p>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await api.get('accounts/admin/stats/');
            const data = res.data;
            setStats([
                { title: 'Total Job Seekers', value: data.seekers.toLocaleString(), icon: Users, color: 'bg-blue-500', },
                { title: 'Registered Companies', value: data.companies.toLocaleString(), icon: Building2, color: 'bg-purple-500' },
                { title: 'Active Job Posts', value: data.jobs.toLocaleString(), icon: Briefcase, color: 'bg-brand-accent' },
                { title: 'Pending Verifications', value: data.pending.toLocaleString(), icon: AlertTriangle, color: 'bg-red-500' },
            ]);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const recentActivity = [
        { id: 1, user: 'System', action: 'Dashboard synchronized with database', time: 'Just now' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-brand-navy">Dashboard Overview</h1>
                <div className="text-sm text-slate-500">Last updated: Just now</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-brand-navy mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4 py-3 border-b last:border-0 border-slate-50">
                            <div className="w-2 h-2 rounded-full bg-brand-accent"></div>
                            <div className="flex-1">
                                <span className="font-medium text-brand-navy">{activity.user}</span>
                                <span className="text-slate-500 mx-2">{activity.action}</span>
                            </div>
                            <span className="text-sm text-slate-400">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
