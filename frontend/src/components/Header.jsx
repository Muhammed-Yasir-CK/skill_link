import React, { useRef, useEffect } from 'react';
import { Briefcase, Menu, X, User, LogOut, Settings, ChevronDown, Bell, LayoutDashboard, Heart, HelpCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Header = () => {
    // const auth = useAuth();

    // if (!auth) return null;

    // const { user, logout } = useAuth() || {};
    const { user, loading, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const navigate = useNavigate();
    // const { logout } = useAuth();
    
    const location = useLocation();
    const isPostJobPage = location.pathname === '/post-job';
    const isWorkMode = location.pathname.startsWith('/work-dashboard');
    const showSwitchToWork = user?.role !== 'company' && !isWorkMode;
    const showPostJobButton = user?.role !== 'company' && !isPostJobPage && !location.pathname.startsWith('/company/dashboard');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) return null; // don't render until user is loaded

    const handleLinkClick = () => {
        setIsProfileOpen(false);
        setIsMenuOpen(false);
    };

    const handleSignOut = () => {
        // Clear any auth state here if implemented (e.g., local storage)
        // localStorage.removeItem('token');
        setIsProfileOpen(false);
        setIsMenuOpen(false);
        // navigate('/login');
        logout();
        navigate('/login', { replace: true });
    };
user?.role
    return (
        <header className="bg-brand-navy border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="flex items-center gap-3 group">
                        {/* Using mix-blend-mode or just background matching to make logo seamless */}
                        <div className="relative overflow-hidden flex items-center">
                            <img
                                src="/logo.png"
                                alt="SkillLink"
                                className="h-10 w-auto object-contain"
                            />
                        </div>
                    </Link>

                    <nav className="hidden md:flex space-x-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        {user?.role !== 'company' && !isPostJobPage && !isWorkMode && (
                            <>
                                <Link to="/" className="text-slate-300  hover:text-brand-accent font-medium transition-colors text-sm uppercase tracking-wide">Find Jobs</Link>
                                <Link to="/companies" className="text-slate-300  hover:text-brand-accent font-medium transition-colors text-sm uppercase tracking-wide">Companies</Link>
                            </>
                        )}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                {showPostJobButton && (
                                    <>
                                        {!isWorkMode && (
                                            <Link to="/work-dashboard" className="text-slate-300 hover:text-white font-medium text-sm transition-colors mr-2 border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/5">
                                                Switch to Post Work
                                            </Link>
                                        )}
                                    </>
                                    // <Link to="/post-job" className="bg-brand-accent hover:bg-brand-accent-hover text-brand-navy px-5 py-2 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-brand-accent/20 text-sm hidden lg:block">
                                    //     Post a Job
                                    // </Link>
                                )}

                                <div className="relative">
                                    <button
                                        ref={buttonRef}
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className={`flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-all border border-transparent hover:border-white/10 ${isProfileOpen ? 'bg-white/5 border-white/10' : ''}`}
                                    >
                                        <div className="text-right hidden lg:block">
                                            <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent to-amber-600 p-0.5">
                                            <div className="w-full h-full rounded-full bg-brand-navy flex items-center justify-center overflow-hidden">
                                                <span className="text-brand-accent font-bold text-lg">{user.name?.[0]?.toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-brand-accent' : ''}`} />
                                    </button>
                                </div>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <div
                                        ref={dropdownRef}
                                        className="absolute right-0 top-full mt-5 w-64 bg-brand-navy border border-white/10 rounded-xl shadow-2xl py-2 animate-fade-in z-50 origin-top-right transform transition-all duration-200 ease-out"
                                    >
                                        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center text-brand-navy font-bold text-lg">
                                                {user.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                                                <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="py-1">
                                            {user?.role === 'company' ? (
                                                <>
                                                    <Link onClick={handleLinkClick} to="/company/dashboard?tab=overview" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors group">
                                                        <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-brand-accent transition-colors" />
                                                        Dashboard
                                                    </Link>
                                                    <Link onClick={handleLinkClick} to="/company/dashboard?tab=jobs" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors group">
                                                        <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-brand-accent transition-colors" />
                                                        Manage Jobs
                                                    </Link>
                                                    <Link onClick={handleLinkClick} to="/company/dashboard?tab=candidates" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors group">
                                                        <User className="w-4 h-4 text-slate-400 group-hover:text-brand-accent transition-colors" />
                                                        Candidates
                                                    </Link>
                                                    {/* <Link onClick={handleLinkClick} to="/company-dashboard?tab=messages" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors group">
                                                        <Bell className="w-4 h-4 text-slate-400 group-hover:text-brand-accent transition-colors" />
                                                        Messages
                                                    </Link> */}
                                                    <Link onClick={handleLinkClick} to="/company/dashboard?tab=settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors group">
                                                        <Settings className="w-4 h-4 text-slate-400 group-hover:text-brand-accent transition-colors" />
                                                        Settings
                                                    </Link>
                                                </>
                                            ) :isWorkMode ? (
                                                <></>
                                            ) : (
                                                <>
                                                    <Link onClick={handleLinkClick} to="/seeker" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors group">
                                                        <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-brand-accent transition-colors" />
                                                        Dashboard
                                                    </Link>
                                                    <Link onClick={handleLinkClick} to="/seeker/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors group">
                                                        <User className="w-4 h-4 text-slate-400 group-hover:text-brand-accent transition-colors" />
                                                        Profile Overview
                                                    </Link>

                                                    <Link
                                                        onClick={handleLinkClick}
                                                        to="/seeker/applications"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors group"
                                                        >
                                                        <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-brand-accent transition-colors" />
                                                        Applications
                                                    </Link>

                                                    <Link onClick={handleLinkClick} to="/seeker/saved" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors group">
                                                        <Heart className="w-4 h-4 text-slate-400 group-hover:text-brand-accent transition-colors" />
                                                        Saved Jobs
                                                    </Link>
                                                    <Link onClick={handleLinkClick} to="/seeker/notifications" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors group">
                                                        <Bell className="w-4 h-4 text-slate-400 group-hover:text-brand-accent transition-colors" />
                                                        Notifications
                                                    </Link>
                                                    

                                                    <Link onClick={handleLinkClick} to="/seeker/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors group">
                                                        <Settings className="w-4 h-4 text-slate-400 group-hover:text-brand-accent transition-colors" />
                                                        Settings
                                                    </Link>
                                                </>
                                            )}
                                        </div>

                                        <div className="border-t border-white/5 mt-1 pt-1">
                                            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors text-left group">
                                                <LogOut className="w-4 h-4 group-hover:text-red-300 transition-colors" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Log In</Link>
                                {!isPostJobPage && (
                                    <Link to="/post-job" className="bg-brand-accent hover:bg-brand-accent-hover text-brand-navy px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-brand-accent/20">
                                        Post a Job
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-300 hover:text-white"
                        >
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {
                isMenuOpen && (
                    <div className="md:hidden bg-brand-navy border-b border-white/10">
                        <div className="px-4 py-3 space-y-3">
                            {user?.role !== 'Company' && !isPostJobPage && !isWorkMode && (
                                
                                <>
                                    <Link to="/" className="block text-slate-300 font-medium hover:text-white">Find Jobs</Link>
                                    <Link to="/companies" className="block text-slate-300 font-medium hover:text-white">Companies</Link>
                                </>
                            )}
                            <div className="pt-3 border-t border-slate-700 flex flex-col gap-3">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 py-2">
                                            <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center text-brand-navy font-bold">
                                                {user.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{user.name}</p>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                        {user?.role === 'company' ? (
                                            <>
                                                <Link onClick={handleLinkClick} to="/company-dashboard?tab=overview" className="text-left text-slate-300 font-medium hover:text-white flex items-center gap-2">
                                                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                                                </Link>
                                                <Link onClick={handleLinkClick} to="/company-dashboard?tab=jobs" className="text-left text-slate-300 font-medium hover:text-white flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4" /> Manage Jobs
                                                </Link>
                                                <Link onClick={handleLinkClick} to="/company-dashboard?tab=candidates" className="text-left text-slate-300 font-medium hover:text-white flex items-center gap-2">
                                                    <User className="w-4 h-4" /> Candidates
                                                </Link>
                                                {/* <Link onClick={handleLinkClick} to="/company-dashboard?tab=messages" className="text-left text-slate-300 font-medium hover:text-white flex items-center gap-2">
                                                    <Bell className="w-4 h-4" /> Messages
                                                </Link> */}
                                                <Link onClick={handleLinkClick} to="/company-dashboard?tab=settings" className="text-left text-slate-300 font-medium hover:text-white flex items-center gap-2">
                                                    <Settings className="w-4 h-4" /> Settings
                                                </Link>
                                            </>
                                        ) :isWorkMode ? (
                                                <></>
                                            ) : (
                                            <>
                                                <Link onClick={handleLinkClick} to="/seeker" className="text-left text-slate-300 font-medium hover:text-white flex items-center gap-2">
                                                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                                                </Link>
                                                <Link onClick={handleLinkClick} to="/seeker/profile" className="text-left text-slate-300 font-medium hover:text-white flex items-center gap-2">
                                                    <User className="w-4 h-4" /> Profile Overview
                                                </Link>
                                                <Link onClick={handleLinkClick} to="/seeker/applications" className="text-left text-slate-300 font-medium hover:text-white flex items-center gap-2">
                                                    <HelpCircle className="w-4 h-4" /> Applications
                                                </Link>
                                                <Link onClick={handleLinkClick} to="/seeker/saved" className="text-left text-slate-300 font-medium hover:text-white flex items-center gap-2">
                                                    <Heart className="w-4 h-4" /> Saved Jobs
                                                </Link>
                                                <Link onClick={handleLinkClick} to="/seeker/notifications" className="text-left text-slate-300 font-medium hover:text-white flex items-center gap-2">
                                                    <Bell className="w-4 h-4" /> Notifications
                                                </Link>

                                                <Link onClick={handleLinkClick} to="/seeker/settings" className="text-left text-slate-300 font-medium hover:text-white flex items-center gap-2">
                                                    <Settings className="w-4 h-4" /> Settings
                                                </Link>
                                            </>
                                        )}
                                        <button onClick={handleSignOut} className="text-left text-red-400 font-medium hover:text-red-300 flex items-center gap-2">
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                        {showPostJobButton && (
                                            // <Link to="/post-job" className="block text-center bg-brand-accent text-brand-navy px-4 py-2.5 rounded-full font-bold w-full mt-2">
                                            //     Post a Job
                                            // </Link>
                                            
                                            <Link to="/work-dashboard" onClick={handleLinkClick} className="block text-center border border-white/20 text-slate-300 px-4 py-2 rounded-lg hover:bg-white/5" >
                                            Switch to Post Work
                                            </Link>
                                            
                                        )}

                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="text-left text-slate-300 font-medium hover:text-white">Log In</Link>
                                        {!isPostJobPage && (
                                            <Link to="/post-job" className="block text-center bg-brand-accent text-brand-navy px-4 py-2.5 rounded-full font-bold">
                                                Post a Job
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </header >
    );
};

export default Header;
