


import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Search,
    Filter,
    ChevronRight,
    MapPin,
    MoreHorizontal,
    Settings,
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Users,
    Calendar,
    DollarSign,
    FileText,
    Globe,
    Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/api/axios';
import Notification from '@/components/Notification';


const Jobs = ({ user }) => {
    // Mock Data - Extended for Detail View
    const [jobs, setJobs] = useState([
    ]);

    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [notification, setNotification] = useState({
        isVisible: false,
        type: 'success',
        message: ''
    });

    const hideNotification = () => setNotification(prev => ({ ...prev, isVisible: false }));

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await api.get('/company/jobs/');
                const formatted = res.data.map(job => ({
                    id: job.id,
                    title: job.title,
                    company_name: job.company_name,
                    company_website: job.company_website,
                    location: job.location,
                    type: job.employment_type.replace('_', ' '),
                    salary: `${job.salary_currency} ${job.salary_min} - ${job.salary_max}`,
                    posted: new Date(job.created_at).toLocaleDateString(),
                    description: job.description,
                    skills: job.skills || [],
                    education: job.education || 'Not specified',
                    experience: job.seniority_level || 'Not specified',
                    status: job.status ,
                    applicants: job.applicants,
                    avatars: job.applicant_avatars || []
                }));
                setJobs(formatted);
            } catch (err) {
                console.error('Error fetching jobs', err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);


    const toggleDropdown = (id, e) => {
        e.stopPropagation();
        if (activeDropdown === id) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(id);
        }
    };

    // const handleJobAction = (id, action, e) => {
    //     if (e) e.stopPropagation();
    //     const updatedJobs = jobs.map(job =>
    //         job.id === id ? { ...job, status: action } : job
    //     );
    //     setJobs(updatedJobs);
    //     if (selectedJob && selectedJob.id === id) {
    //         setSelectedJob({ ...selectedJob, status: action });
    //     }
    //     setActiveDropdown(null);
    // };

    const handleJobAction = async (id, action, e) => {
        if (e) e.stopPropagation();

        try {
            const res = await api.patch(
                `/company/jobs/${id}/status/`,
                { status: action }
            );

            // const { status, is_active } = res.data;
            const updatedStatus = res.data.status;

            setJobs(prev =>
                prev.map(job =>
                    job.id === id
                        ? { ...job, status: updatedStatus}
                        : job
                )
            );

            if (selectedJob && selectedJob.id === id) {
                setSelectedJob(prev => ({ ...prev, status: updatedStatus }));
            }

            setActiveDropdown(null);
        } catch (err) {
            console.error('Failed to update job status', err);
        }
    }


    const handleDeleteJob = async (id, e) => {
        if (e) e.stopPropagation();

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this job? This action cannot be undone."
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/company/jobs/${id}/delete/`);

            // remove from UI
            setJobs(prevJobs => prevJobs.filter(job => job.id !== id));

            // if user is viewing this job, exit detail view
            if (selectedJob && selectedJob.id === id) {
                setSelectedJob(null);
            }

            setActiveDropdown(null);
        } catch (err) {
            console.error("Failed to delete job", err);
            setNotification({
                isVisible: true,
                type: 'error',
                message: 'Failed to delete job'
            });
        }
    };



    const StatusBadge = ({ status }) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-block whitespace-nowrap ${status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' :
            status === 'Closed' ? 'bg-red-50 text-red-600 border-red-100' :
                'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
            {status}
        </span>
    );

    // Detail View Component
    const JobDetailView = ({ job }) => (
        <div className="animate-fade-in space-y-6">
            <button
                onClick={() => setSelectedJob(null)}
                className="flex items-center gap-2 text-slate-300 hover:text-white font-medium transition-colors mb-4"
            
            >
                <ArrowLeft className="w-4 h-4" /> Back to All Jobs
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <div className="flex gap-3">
                        <StatusBadge status={job.status} />
                        {job.status === 'Active' ? (
                            <button onClick={() => handleJobAction(job.id, 'Paused')} className="px-4 py-2 bg-amber-50 text-amber-600 rounded-lg text-sm font-bold border border-amber-100 hover:bg-amber-100 transition-colors">Pause Job</button>
                        ) : job.status === 'Paused' ? (
                            <button onClick={() => handleJobAction(job.id, 'Active')} className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-bold border border-green-100 hover:bg-green-100 transition-colors">Activate</button>
                        ) : null}
                        {/* <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-100 transition-colors">Edit Job</button> */}
                        {job.status !== 'Closed' && (
                            <button onClick={() => handleJobAction(job.id, 'Closed')} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors">Close Job</button>
                        )}
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm mb-6">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {job.salary}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.type}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Posted {job.posted}</span>
                    {job.company_website && (
                        <a 
                            href={job.company_website.startsWith('http') ? job.company_website : `https://${job.company_website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-brand-blue hover:text-brand-accent transition-colors underline"
                        >
                            <Globe className="w-4 h-4" /> Visit Website
                        </a>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Applicants</p>
                        <p className="text-2xl font-bold text-slate-900">{job.applicants}</p>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100">
                        <button
                            className="px-6 py-3 bg-brand-navy text-white font-bold rounded-xl flex items-center gap-2"
                        >
                            <Users className="w-5 h-5" />
                            Applied Candidates ({job.applicants})
                        </button>
                    </div>

                    
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-brand-accent" /> Job Description
                        </h3>
                        <p className="text-slate-600 leading-relaxed mb-6">
                            {job.description}
                        </p>
                        
                    </div>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Requirements</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-bold text-slate-700 mb-1">Experience</p>
                                <p className="text-slate-600 text-sm">{job.experience}</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 mb-1">Education</p>
                                <p className="text-slate-600 text-sm">{job.education}</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 mb-2">Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Meta Data</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Posted on</span>
                                <span className="font-bold text-slate-900">{job.posted}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Expires on</span>
                                <span className="font-bold text-slate-900">May 30, 2026</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Job ID</span>
                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">REQ-{1000 + job.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (selectedJob) {
        return <JobDetailView job={selectedJob} />;
    }

    return (
        <div className="space-y-6 animate-fade-in ">
            <Notification 
                {...notification}
                onClose={hideNotification}
            />
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {/* <h2 className="text-2xl font-bold text-white">Manage Job Listings</h2>
                    <p className="text-slate-200">View and manage your job posts and track their performance.</p> */}
                    <h2 className="text-2xl font-bold text-slate-900">Manage Job Listings</h2>
                    <p className="text-slate-500">View and manage your job posts and track their performance.</p>
               
                
                </div>
                <Link to="/company/post-job" state={{ user }} className="px-5 py-2.5 bg-brand-navy hover:bg-brand-navy/90 text-white font-bold rounded-xl shadow-lg shadow-brand-navy/20 transition-all flex items-center justify-center gap-2">
                    <Settings className="w-5 h-5" /> Post New Job
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="Search jobs by title, keyword or location..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none transition-all placeholder:text-slate-400" />
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="px-4 py-2.5 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                        Status: All <ChevronRight className="w-4 h-4 rotate-90" />
                    </button>
                </div>
            </div>

            {/* Jobs List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm relative ">
                {loading ? (
                    <div className="p-10 text-center text-slate-500">Loading jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20">
                        <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No Jobs Posted Yet</h3>
                        <p className="text-slate-500 mb-6">Create your first job listing to get started.</p>
                        <Link to="/company/post-job" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-bold rounded-xl">
                            Post a Job
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto relative pb-10">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Job Title</th>
                                    <th className="px-6 py-4">Applicants</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Posted Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {jobs.map(job => (
                                    <tr
                                        key={job.id}
                                        onClick={() => setSelectedJob(job)}
                                        className="hover:bg-slate-50/50 transition-colors group relative cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-4">
                                                <div className="md:w-10 md:h-10 rounded-lg bg-brand-navy/5 flex items-center justify-center text-brand-navy  md:flex shrink-0">
                                                    <Briefcase className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 group-hover:text-brand-navy transition-colors truncate max-w-[180px] sm:max-w-xs">{job.title}</p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                        <MapPin className="w-3 h-3 shrink-0" /> {job.location}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2 shrink-0">
                                                    {/* {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                            {String.fromCharCode(64 + i)}
                                                        </div>
                                                    ))} */}
                                                    {job.avatars.slice(0,3).map((avatar,i)=>(
                                                        <img
                                                            key={i}
                                                            src={`http://localhost:8000${avatar}`}
                                                            className="w-7 h-7 rounded-full border-2 border-white object-cover"
                                                        />
                                                        ))}
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">+{job.applicants}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={job.status} />
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm font-medium whitespace-nowrap">{job.posted}</td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={(e) => toggleDropdown(job.id, e)}
                                                className={`p-2 rounded-lg transition-colors ${activeDropdown === job.id ? 'bg-slate-100 text-brand-navy' : 'text-slate-400 hover:bg-slate-50 hover:text-brand-navy'}`}
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>

                                            {/* Job Actions Dropdown */}
                                            {activeDropdown === job.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10 cursor-default" onClick={(e) => toggleDropdown(null, e)}></div>
                                                    <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 overflow-visible text-left" onClick={e => e.stopPropagation()}>
                                                        {/* <button className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-navy flex items-center gap-2">
                                                            <Settings className="w-4 h-4" /> Edit Job
                                                        </button> */}
                                                        {/* <button className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 flex items-center gap-2">
                                                            <Trash2 className="w-4 h-4" /> Delete Job
                                                        </button> */}
                                                        <button
                                                            onClick={(e) => handleDeleteJob(job.id, e)}
                                                            className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 flex items-center gap-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Delete Job
                                                        </button>

                                                        {/* {job.status === 'Active' ? (
                                                            <button onClick={(e) => handleJobAction(job.id, 'Paused', e)} className="w-full text-left px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                                                                <Clock className="w-4 h-4" /> Pause Job
                                                            </button>
                                                        ) : (
                                                            <button onClick={(e) => handleJobAction(job.id, 'Active', e)} className="w-full text-left px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 flex items-center gap-2">
                                                                <CheckCircle className="w-4 h-4" /> Activate
                                                            </button>
                                                        )} */}

                                                        {job.status === 'Active' && (
                                                            <button
                                                                onClick={(e) => handleJobAction(job.id, 'Paused', e)}
                                                                className="w-full text-left px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                                                            >
                                                                <Clock className="w-4 h-4" /> Pause Job
                                                            </button>
                                                        )}

                                                        {job.status === 'Paused' && (
                                                            <button
                                                                onClick={(e) => handleJobAction(job.id, 'Active', e)}
                                                                className="w-full text-left px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 flex items-center gap-2"
                                                            >
                                                                <CheckCircle className="w-4 h-4" /> Activate
                                                            </button>
                                                        )}



                                                        {/* <button onClick={(e) => handleJobAction(job.id, 'Closed', e)} className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                            <XCircle className="w-4 h-4" /> Close Job
                                                        </button> */}
                                                        {job.status !== 'Closed' && (
                                                            <button
                                                                onClick={(e) => handleJobAction(job.id, 'Closed', e)}
                                                                className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <XCircle className="w-4 h-4" /> Close Job
                                                            </button>
                                                        )}



                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Jobs;










