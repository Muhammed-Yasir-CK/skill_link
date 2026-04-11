import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Github, Briefcase, Building2, CheckCircle, Star, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notification from '../components/Notification';

const Signup = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState('seeker'); // 'seeker' or 'employer'
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [notification, setNotification] = useState({
        isVisible: false,
        type: 'success',
        message: ''
    });

    const hideNotification = () => setNotification(prev => ({ ...prev, isVisible: false }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setNotification({
                isVisible: true,
                type: 'error',
                message: "Passwords do not match"
            });
            return;
        }

        try {
            let url = '';
            let payload = {};

            if (userType === 'seeker') {
                url = 'http://localhost:8000/api/accounts/register/seeker/';

                payload = {
                    username: email.split('@')[0],   // auto username
                    email: email,
                    password: password,
                    password2: confirmPassword
                };
            } else {
                url = 'http://localhost:8000/api/accounts/register/company/';

                payload = {
                    username: username,
                    email: email,
                    password: password,
                    password2: confirmPassword,
                    company_name: name
                };
            }

            const response = await axios.post(url, payload);

            // Show success notification
            setShowSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

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

    const benefits = userType === 'seeker' ? [
        "Apply to top tech companies",
        "Get salary insights",
        "Showcase your portfolio"
    ] : [
        "Post unlimited jobs",
        "Access powerful candidate search",
        "Manage applications easily"
    ];

    return (
        <div className="min-h-screen flex bg-brand-navy">
            <Notification 
                {...notification}
                onClose={hideNotification}
            />
            {/* Left Side - Visual/Branding (Dynamic based on User Type) */}
            <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden transition-colors duration-500 ease-in-out ${userType === 'seeker' ? 'bg-brand-primary' : 'bg-slate-900'}`}>
                {/* Background Patterns */}
                <div className="absolute inset-0 bg-brand-accent/5">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                </div>

                {/* Dynamic Orbs */}
                {userType === 'seeker' ? (
                    <>
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-[100px] animate-pulse" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
                    </>
                ) : (
                    <>
                        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-accent/20 rounded-full blur-[100px] animate-pulse" />
                        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
                    </>
                )}

                {/* Content */}
                <div className="relative z-10 w-full flex flex-col justify-center px-12 top-0">
                    <div className="mb-12">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium mb-6 transition-colors duration-300 ${userType === 'seeker' ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue' : 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent'
                            }`}>
                            {userType === 'seeker' ? <Star className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                            <span>{userType === 'seeker' ? 'For Professionals' : 'For Companies'}</span>
                        </div>

                        <h1 className="text-5xl font-bold text-white leading-tight mb-6 transition-all duration-300">
                            {userType === 'seeker' ? (
                                <>
                                    Accelerate your <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-400">career growth</span>
                                </>
                            ) : (
                                <>
                                    Build your dream <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-emerald-400">team today</span>
                                </>
                            )}
                        </h1>

                        <div className="space-y-4">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-3 text-slate-300">
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${userType === 'seeker' ? 'bg-brand-blue/20 text-brand-blue' : 'bg-brand-accent/20 text-brand-accent'}`}>
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <span className="text-lg">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-brand-navy border-l border-white/5 relative">
                {/* Mobile Background Decoration */}
                <div className={`lg:hidden absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] ${userType === 'seeker' ? 'bg-brand-blue/10' : 'bg-brand-accent/10'}`} />

                <div className="w-full max-w-md space-y-8 relative z-10">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex lg:hidden w-12 h-12 bg-white/10 p-2 rounded-xl border border-white/20 mb-6 items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
                        <p className="mt-2 text-slate-400">Choose your account type to get started.</p>
                    </div>

                    {/* Account Type Toggle */}
                    <div className="p-1.5 bg-slate-900/80 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                        <div className="grid grid-cols-2 gap-1 relative">
                            {/* Sliding Background */}
                            <div className={`absolute inset-y-0 w-1/2 bg-slate-700/50 rounded-xl transition-transform duration-300 ease-spring ${userType === 'employer' ? 'translate-x-full' : 'translate-x-0'}`} />

                            <button
                                type="button"
                                onClick={() => setUserType('seeker')}
                                className={`relative flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${userType === 'seeker' ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                <User className={`w-4 h-4 ${userType === 'seeker' ? 'text-brand-blue' : ''}`} />
                                Job Seeker
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserType('employer')}
                                className={`relative flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${userType === 'employer' ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                <Building2 className={`w-4 h-4 ${userType === 'employer' ? 'text-brand-accent' : ''}`} />
                                Company
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="animate-fade-in">
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                                    {userType === 'seeker' ? 'Full Name' : 'Company Name'}
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-white transition-colors duration-300">
                                        {userType === 'seeker' ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all placeholder:text-slate-600"
                                        placeholder={userType === 'seeker' ? "John Doe" : "Acme Inc."}
                                        required
                                    />
                                </div>
                            </div>

                            {userType === 'employer' && (
                                <div className="animate-fade-in delay-100">
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Username</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-white transition-colors duration-300" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all placeholder:text-slate-600"
                                            placeholder="company_username"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="animate-fade-in delay-100">
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Work Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-white transition-colors duration-300" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all placeholder:text-slate-600"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="animate-fade-in delay-200">
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-white transition-colors duration-300" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all placeholder:text-slate-600"
                                        placeholder="Create a password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="animate-fade-in delay-200">
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-white transition-colors duration-300" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all placeholder:text-slate-600"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`w-full font-bold py-3.5 rounded-xl transition-all transform hover:translate-y-[-2px] hover:shadow-lg flex items-center justify-center gap-2 group animate-fade-in delay-300 ${userType === 'seeker'
                                ? 'bg-brand-blue hover:bg-blue-600 text-white shadow-brand-blue/25'
                                : 'bg-brand-accent hover:bg-brand-accent-hover text-brand-navy shadow-brand-accent/25'
                                }`}
                        >
                            Create Account
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        {userType === 'seeker' && (
                            <>
                                <div className="relative my-8 animate-fade-in delay-400">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-700"></span>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-brand-navy px-2 text-slate-500">Or continue with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 animate-fade-in delay-500">
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
                            </>
                        )}
                    </form>


                    <p className="text-center text-sm text-slate-400 animate-fade-in delay-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-accent hover:text-brand-accent-hover font-medium hover:underline decoration-brand-accent/30 underline-offset-4">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            {/* Success Notification Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-scale-in">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Account Created!</h3>
                            <p className="text-slate-300">
                                Your account has been successfully created. Redirecting to login...
                            </p>
                            <div className="w-full bg-slate-700 rounded-full h-1 overflow-hidden">
                                <div className="h-full bg-brand-accent animate-progress" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Signup;
