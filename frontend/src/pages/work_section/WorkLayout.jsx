import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
    LayoutDashboard,
    List,
    PlusCircle,
    CheckCircle,
    Briefcase,
    MessageSquare,
    Settings,
    ArrowLeft,
    Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../api/axios';

const WorkLayout = () => {
    const [user, setUser] = useState(null);

    const navItems = [
        { path: '', end: true, label: 'Dashboard', icon: LayoutDashboard },
        { path: 'my-works', label: 'My Work Requests', icon: List },
        { path: 'post-work', label: 'Post New Work', icon: PlusCircle },
        { path: 'completed', label: 'Completed Works', icon: CheckCircle },
        { path: 'applications', label: 'Received Applications', icon: Briefcase },
        { path: 'payment-settings', label: 'Payment Settings', icon: Settings },
    ];

    const fetchUser = async () => {
        try {
            const res = await api.get('accounts/me/');
            setUser(res.data);
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);


    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <Header user={user} isWorkMode={true} />

            <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* Mode Switcher / Breadcrumb Area */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Work Dashboard</h1>
                        <p className="text-slate-500 text-sm">Manage your work requests and hires</p>
                    </div>
                    <Link to="/seeker" className="flex items-center gap-2 text-sm font-bold text-brand-blue bg-brand-blue/10 px-4 py-2 rounded-lg hover:bg-brand-blue/20 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Switch to Job Seeker
                    </Link>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="w-72 flex-shrink-0 hidden lg:block">
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/40 sticky top-24 overflow-hidden">
                            {/* Profile Snippet */}
                            <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-white">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                                        {user?.full_name?.[0] || "U"}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 leading-tight">{user?.full_name || "Loading..."}</p>
                                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Hirer Mode</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Work Menu</h3>
                                <nav className="space-y-2">
                                    {navItems.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end={item.end}
                                            className={({ isActive }) =>
                                                `group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ease-in-out ${isActive
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 translate-x-1'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:shadow-sm'
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                                    {item.label}
                                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />}
                                                </>
                                            )}
                                        </NavLink>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0 min-h-[85vh]">
                        <Outlet />
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default WorkLayout;
