import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useEffect, useState } from 'react';
import axios from 'axios';

import {
    LayoutDashboard,
    User,
    Heart,
    Briefcase,
    Bell,
    Settings,
    FileText
} from 'lucide-react';

const JobSeekerLayout = () => {
    // Hardcoded user for now, as in previous Dashboard
    const [user, setUser] = useState(null);


    const navItems = [
        { to: '.', label: 'Dashboard', icon: LayoutDashboard ,end: true},
        { to: 'profile', label: 'Profile', icon: User },
        { to: 'applications', label: 'Applications', icon: Briefcase },
        { to: 'saved', label: 'Saved Jobs', icon: Heart },
        { to: 'notifications', label: 'Notifications', icon: Bell },
        { to: 'settings', label: 'Settings', icon: Settings },
    ];


    useEffect(() => {
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem("access");

            if (!token) {
                console.error("No access token found");
                return;
            }

            const response = await axios.get(
                "http://localhost:8000/api/accounts/seeker/profile/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("API RESPONSE:", response.data);

            setUser({
                name: response.data.full_name || "User",
                role: "Job Seeker",
                email: response.data.email || "",
                profile_picture: response.data.profile_picture || null
            });

        } catch (error) {
            console.error(
                "Error fetching user profile:",
                error.response?.data || error.message
            );
        }
    };

    fetchUserProfile();
}, []);


    

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <Header user={user} />

            <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="w-72 flex-shrink-0 hidden lg:block">
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/40 sticky top-24 overflow-hidden">
                            {/* Profile Snippet */}
                            <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-12 h-12 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-lg shadow-md overflow-hidden">
                                        {user?.profile_picture ? (
                                            <img
                                                src={user.profile_picture}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            user?.name?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 leading-tight">{user?.name || "User"}</p>
                                        <p className="text-xs text-slate-500 font-medium">{user?.role}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Menu</h3>
                                <nav className="space-y-2">
                                    {navItems.map((item) => (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            end={item.end}
                                            className={({ isActive }) =>
                                                `group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ease-in-out ${isActive
                                                    ? 'bg-brand-navy text-white shadow-lg shadow-brand-navy/20 translate-x-1'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-brand-navy hover:shadow-sm'
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-accent' : 'text-slate-400 group-hover:text-brand-navy'}`} />
                                                    {item.label}
                                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />}
                                                </>
                                            )}
                                        </NavLink>
                                    ))}
                                </nav>
                            </div>

                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        <Outlet />
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default JobSeekerLayout;
