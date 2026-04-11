import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Github, Briefcase } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// import axios from "axios";
import api from "../api/axios";
import Notification from '../components/Notification';


const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loadUser } = useAuth();
    const [notification, setNotification] = useState({
        isVisible: false,
        type: 'success',
        message: ''
    });

    const hideNotification = () => setNotification(prev => ({ ...prev, isVisible: false }));
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("HANDLE SUBMIT TRIGGERED");
        try {
            const response = await api.post("accounts/login/", {
                username: email.split('@')[0], // same as signup username
                password: password
            });
            console.log("LOGIN RESPONSE:", response.data);
            const userType = response.data.user_type?.toLowerCase();
            console.log("USER TYPE:", response.data.user_type);
            
            // Save JWT tokens and user type in localStorage
            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("user_type", response.data.user_type);
            // api.defaults.headers.common.Authorization = `Bearer ${response.data.access}`;
            await loadUser();
           
            // alert("Login successful!");
            // if (userType === "company") {
            //     navigate("/company/dashboard");
            //     } else if (userType === "seeker") {
            //     navigate("/seeker/dashboard");
            //     } else {
            //     console.error("Unknown user type:", userType);
            //     }
            
            // window.location.href = response.data.user_type === 'company'
            //     ? '/company/dashboard'
            //     : '/seeker/dashboard';
            let targetRoute = '/seeker';
            if (response.data.user_type === 'company') {
                targetRoute = '/company/dashboard';
            } else if (response.data.user_type === 'admin') {
                targetRoute = '/admin/dashboard';
            }

            navigate(targetRoute, { replace: true });

           // Redirect based on user_type
            // const dashboardRoute = {
            //     seeker: "/seeker/dashboard",
            //     company: "/company/dashboard"
            // };

            // navigate(dashboardRoute[response.data.user_type]);


        } catch (error) {
            if (error.response) {
                console.error(error.response.data);
                setNotification({
                    isVisible: true,
                    type: 'error',
                    message: JSON.stringify(error.response.data)
                });
            } else {
                setNotification({
                    isVisible: true,
                    type: 'error',
                    message: "Server error"
                });
            }
        }
    };

    
    return (
        <div className="min-h-screen flex bg-brand-navy">
            <Notification 
                {...notification}
                onClose={hideNotification}
            />
            {/* Left Side - Visual/Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-primary">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-brand-accent/5">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                </div>

                {/* Floating Orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-accent/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />

                {/* Content */}
                <div className="relative z-10 w-full flex flex-col justify-center px-12 top-0">
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-sm font-medium mb-6">
                            <Briefcase className="w-4 h-4" />
                            <span>#1 Job Platform</span>
                        </div>
                        <h1 className="text-5xl font-bold text-white leading-tight mb-6">
                            Find the job that <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-white">defines your future</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-md leading-relaxed">
                            Join millions of professionals who have taken the next step in their careers. Connect with top companies and unlock new opportunities.
                        </p>
                    </div>

                    {/* Stats/Social Proof */}
                    <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8 max-w-md">
                        <div>
                            <p className="text-3xl font-bold text-white mb-1">10k+</p>
                            <p className="text-sm text-slate-500 uppercase tracking-wider">Active Jobs</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white mb-1">500+</p>
                            <p className="text-sm text-slate-500 uppercase tracking-wider">Top Companies</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-brand-navy border-l border-white/5 relative">
                {/* Mobile Background Decoration (visible only on small screens) */}
                <div className="lg:hidden absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-[80px]" />

                <div className="w-full max-w-md space-y-8 relative z-10">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex lg:hidden w-12 h-12 bg-white/10 p-2 rounded-xl border border-white/20 mb-6 items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back</h2>
                        <p className="mt-2 text-slate-400">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-brand-accent transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all placeholder:text-slate-600"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5 ml-1">
                                    <label className="text-sm font-medium text-slate-300">Password</label>
                                    <a href="#" className="text-sm font-medium text-brand-accent hover:text-brand-accent-hover transition-colors">Forgot password?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-brand-accent transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            // onClick={handleSubmit}
                            className="w-full bg-brand-accent hover:bg-brand-accent-hover text-brand-navy font-bold py-3.5 rounded-xl transition-all transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-brand-accent/25 flex items-center justify-center gap-2 group"
                        >
                            Log in
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-700"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-brand-navy px-2 text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl transition-all text-sm text-slate-300 font-medium group">
                                <Github className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                                GitHub
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl transition-all text-sm text-slate-300 font-medium group">
                                <svg className="h-5 w-5 opacity-75 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-brand-accent hover:text-brand-accent-hover font-medium hover:underline decoration-brand-accent/30 underline-offset-4">
                            Sign up for free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
