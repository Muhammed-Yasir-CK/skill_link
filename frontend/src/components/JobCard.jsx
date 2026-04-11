import React, { useState } from 'react';
import { MapPin, Clock, DollarSign, Building, Heart, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import Notification from './Notification';
import { applyToJob } from "../services/applyService";
const JobCard = ({ job }) => {
    console.log("JobCard received job:", job);
    
    const [savedId, setSavedId] = useState(job.saved_id || null);
    const [isSaved, setIsSaved] = useState(job.is_saved || false);
    const [notification, setNotification] = useState({
        isVisible: false,
        message: '',
        type: 'success'
    });


    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const token = localStorage.getItem("access");

        try {
            // if (!savedId) return;
            if (isSaved && savedId) {
                // DELETE
                console.log("Deleting saved job id:", savedId);
                const response = await fetch(
                    `http://localhost:8000/api/saved-jobs/${savedId}/`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) throw new Error("Failed to unsave");

                setIsSaved(false);
                setSavedId(null);

                setNotification({
                    isVisible: true,
                    message: "Job removed from saved!",
                    type: "success"
                });

            } else {
                //  POST
                const response = await fetch(
                    "http://localhost:8000/api/saved-jobs/",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            job_id: job.id,
                            job_source: job.source === "local" ? "user" : "company"
                        }),
                    }
                );

                const data = await response.json();
                if (!response.ok) throw new Error("Failed to save");

                setIsSaved(true);
                setSavedId(data.id);  //  IMPORTANT

                setNotification({
                    isVisible: true,
                    message: "Job saved successfully!",
                    type: "success"
                });
            }

        } catch (error) {
            setNotification({
                isVisible: true,
                message: error.message,
                type: "error"
            });
        }
    };



    const handleApply = async (e) => {
        e.preventDefault();
        e.stopPropagation();

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

    return (
        <>
            <Notification
                isVisible={notification.isVisible}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ ...notification, isVisible: false })}
            />

        <Link
            to={
                job.source === "local"
                    ? `/work/${job.id}`      // WorkDetails page
                    : `/job/${job.id}`       // JobDetails page
            }
            className="block bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-all duration-200 group relative"
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4">
                    {job.company_logo ? (
                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200 shadow-sm shrink-0 overflow-hidden group-hover:border-green-400 group-hover:ring-2 group-hover:ring-green-100 transition-all duration-300">
                            <img src={job.company_logo} alt={job.company} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 shadow-sm shrink-0 group-hover:border-green-400 group-hover:ring-2 group-hover:ring-green-100 transition-all duration-300">
                            <span className="text-lg font-bold text-gray-600">{(job.company && job.company.charAt(0).toUpperCase()) || "C"}</span>
                        </div>
                    )}
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            {job.company_website ? (
                                <a 
                                    href={job.company_website.startsWith('http') ? job.company_website : `https://${job.company_website}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-medium text-brand-navy hover:text-green-600 hover:underline transition-colors flex items-center gap-1"
                                >
                                    <Globe className="w-3.5 h-3.5" />
                                    {job.company}
                                </a>
                            ) : (
                                <span className="font-medium text-brand-navy">{job.company}</span>
                            )}
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {job.location}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current text-red-500' : ''}`} />                </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1">
                    <Building className="w-4 h-4 text-gray-400" />
                    {job.workType || 'Full-time'}
                </div>
                <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    {job.salary}
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {job.posted}
                </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    {job.tags?.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded text-xs font-medium">
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                        // onClick={(e) => {
                        //     e.preventDefault();
                        //     e.stopPropagation();
                        // }}

                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-brand-navy bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        View Details
                    </button>
                    <button  onClick={handleApply} className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-brand-accent rounded-lg hover:bg-brand-accent-hover transition-colors shadow-sm">
                        Apply Now
                    </button>
                </div>
            </div>
        </Link>
    </>
    );
};

export default JobCard;
