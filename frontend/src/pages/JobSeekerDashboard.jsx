import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import { jobsData, categories } from '../data/jobs';
import {
    LayoutDashboard,
    User,
    Heart,
    Briefcase,
    Bell,
    Settings,
    HelpCircle,
    LogOut,
    MapPin,
    Calendar,
    FileText
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const JobSeekerDashboard = () => {
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'home';
    const [jobs, setJobs] = useState(jobsData);
    const [filteredJobs, setFilteredJobs] = useState(jobsData);
    const [filters, setFilters] = useState({
        query: '',
        location: '',
        category: '',
        type: '',
        workType: '',
        experience: ''
    });

    // Filtering Logic (Reused from Home)
    useEffect(() => {
        const data = jobs.filter(job => {
            const matchesQuery = job.title.toLowerCase().includes(filters.query.toLowerCase()) ||
                job.company.toLowerCase().includes(filters.query.toLowerCase()) ||
                job.tags.some(tag => tag.toLowerCase().includes(filters.query.toLowerCase()));
            const matchesLocation = job.location.toLowerCase().includes(filters.location.toLowerCase());
            const matchesCategory = filters.category === '' || job.tags.includes(filters.category);
            const matchesType = filters.type === '' || job.type === filters.type;
            const matchesWorkType = filters.workType === '' || job.workType === filters.workType;
            const matchesExperience = filters.experience === '' || job.experience === filters.experience;

            return matchesQuery && matchesLocation && matchesCategory && matchesType && matchesWorkType && matchesExperience;
        });
        setFilteredJobs(data);
    }, [filters, jobs]);



    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                <Home
                    filters={filters}
                    setFilters={setFilters}
                    categories={categories}
                    filteredJobs={filteredJobs}
                />
            );

            case 'profile':
                return (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex gap-6">
                                    <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-lg overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">Muhammed Yasir</h2>
                                        <p className="text-brand-blue font-medium mb-2">Senior Frontend Developer</p>
                                        <div className="flex gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> San Francisco, CA</span>
                                            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> 5 Years Exp</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                                    Edit Profile
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-4">About Me</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm">
                                        Passionate frontend developer with experience in React, Vue, and modern web technologies. I love building accessible and performant user interfaces.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-4">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Figma', 'GraphQL'].map(skill => (
                                            <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'saved':
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Saved Jobs (12)</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {jobsData.slice(0, 3).map(job => <JobCard key={job.id} job={job} />)}
                        </div>
                    </div>
                );

            case 'applications':
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Applications Tracker</h2>
                        <div className="space-y-4">
                            {[
                                { company: "Google", role: "Senior UX Designer", status: "Interviewing", date: "2 days ago", color: "text-amber-600 bg-amber-50 border-amber-200" },
                                { company: "Airbnb", role: "Frontend Engineer", status: "Applied", date: "1 week ago", color: "text-blue-600 bg-blue-50 border-blue-200" },
                                { company: "Netflix", role: "UI Engineer", status: "Rejected", date: "2 weeks ago", color: "text-red-600 bg-red-50 border-red-200" }
                            ].map((app, i) => (
                                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-700">
                                            {app.company[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{app.role}</h3>
                                            <p className="text-sm text-slate-500">{app.company} • Applied {app.date}</p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${app.color}`}>
                                        {app.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Notifications</h2>
                        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-6 hover:bg-slate-50 transition-colors flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-slate-800 font-medium">New job alert: Senior React Developer at TechCorp</p>
                                        <p className="text-sm text-slate-500 mt-1">2 hours ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return <div className="p-8 text-center text-slate-500">Section under construction</div>;
        }
    };

    return (
        <div className="min-h-screen bg-brand-light font-sans">
            <Header user={{ name: 'Muhammed Yasir', role: 'Job Seeker', email: 'yasir@example.com' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Main Content Area */}
                <div className="flex-grow min-w-0">
                    {renderContent()}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default JobSeekerDashboard;
