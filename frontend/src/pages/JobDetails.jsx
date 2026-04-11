import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { applyToJob } from "../services/applyService";
import Notification from "../components/Notification";
import { MapPin, Clock, DollarSign, Building, ArrowLeft, Share2, Globe } from 'lucide-react';

const JobDetails = () => {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({
        isVisible: false,
        message: "",
        type: "success"
    });

    const handleApply = async () => {
        try {
            await applyToJob(job.id, job.source);

            setNotification({
                isVisible: true,
                message: "Application submitted successfully!",
                type: "success"
            });

        } catch (error) {
            setNotification({
                isVisible: true,
                message: error.message,
                type: "error"
            });
        }
    };

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/jobs/${id}/`);

                if (!res.ok) {
                    setJob(null);
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setJob(data);
                setLoading(false);

            } catch (error) {
                console.error("Error fetching job:", error);
                setLoading(false);
            }
        };

        fetchJob();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Job not found
                    </h2>
                </div>
                <Footer />
            </div>
        );
    }

    const formattedDate = new Date(job.created_at).toLocaleDateString();

    const salaryDisplay =
        job.salary_min && job.salary_max
            ? `${job.salary_min} - ${job.salary_max} ${job.salary_currency} / ${job.salary_period}`
            : "Not specified";

    return (

        
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">

                <Notification
                    isVisible={notification.isVisible}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ ...notification, isVisible: false })}
                />
                <div className="max-w-4xl mx-auto">

                    <Link to="/" className="inline-flex items-center text-slate-500 hover:text-brand-blue mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Jobs
                    </Link>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

                        {/* Top Section */}
                        <div className="p-8 border-b border-slate-100">
                            <div className="flex justify-between items-start gap-6">

                                <div className="flex items-start gap-6">
                                    {job.company_logo ? (
                                        <div className="w-16 h-16 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                                            <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold text-2xl border border-slate-200 shadow-sm shrink-0">
                                            {job.title?.charAt(0)}
                                        </div>
                                    )}

                                    <div>
                                        <h1 className="text-2xl font-bold text-slate-900">
                                            {job.title}
                                        </h1>

                                        <div className="text-slate-600 font-medium mt-1 flex items-center gap-2">
                                            <Building className="w-4 h-4" />
                                            {job.company_website ? (
                                                <a 
                                                    href={job.company_website.startsWith('http') ? job.company_website : `https://${job.company_website}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="hover:text-brand-blue hover:underline transition-colors"
                                                >
                                                    {job.company_name}
                                                </a>
                                            ) : (
                                                <span>{job.company_name}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleApply} className="bg-brand-blue text-white px-6 py-2.5 rounded-lg font-medium">
                                    Apply Now
                                </button>

                            </div>

                            <div className="flex flex-wrap gap-6 mt-8">

                                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {job.location} ({job.work_mode})
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                                    <DollarSign className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {salaryDisplay}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        Posted {formattedDate}
                                    </span>
                                </div>
                                {job.company_website && (
                                    <a 
                                        href={job.company_website.startsWith('http') ? job.company_website : `https://${job.company_website}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-brand-blue bg-blue-50 hover:bg-blue-100 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-lg border border-blue-100/50 cursor-pointer"
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            Visit Website
                                        </span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8">

                            {/* About the Role */}
                            <h3 className="text-lg font-bold text-slate-900 mb-4">
                                About the Role
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                {job.description}
                            </p>

                            {/* Requirements */}
                            <h3 className="text-lg font-bold text-slate-900 mb-4">
                                Requirements
                            </h3>

                            {job.skills && job.skills.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 mb-6">
                                    {job.skills.map((skill, index) => (
                                        <li key={index}>{skill}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500 mb-6">No specific requirements listed.</p>
                            )}

                            {/* Benefits */}
                            <h3 className="text-lg font-bold text-slate-900 mb-4">
                                Benefits
                            </h3>

                            {job.benefits && job.benefits.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 mb-6">
                                    {job.benefits.map((benefit, index) => (
                                        <li key={index}>{benefit}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500 mb-6">No benefits listed.</p>
                            )}

                            {/* Tags */}
                            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                                Tags
                            </h4>

                            <div className="flex flex-wrap gap-2">

                                {job.tags && job.tags.map((tag, index) => (
                                    <span key={index} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                                        {tag}
                                    </span>
                                ))}

                                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {job.employment_type}
                                </span>

                                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {job.seniority_level}
                                </span>

                            </div>

                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default JobDetails;



