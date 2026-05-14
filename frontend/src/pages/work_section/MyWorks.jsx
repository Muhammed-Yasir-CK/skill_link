import React, { useState, useEffect } from 'react';

import { Filter, MapPin, Globe, MoreVertical, Edit2, Trash2, Eye, XCircle, X, Calendar, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Notification from '@/components/Notification';

const MyWorks = () => {
    // Mock Data
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);


    const [filterCategory, setFilterCategory] = useState('');
    const [selectedWork, setSelectedWork] = useState(null);
    const [notification, setNotification] = useState({
        isVisible: false,
        type: 'success',
        message: ''
    });

    const hideNotification = () => setNotification(prev => ({ ...prev, isVisible: false }));

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'closed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    };


    useEffect(() => {
        const fetchWorks = async () => {
            try {
                const token = localStorage.getItem("access");

                const response = await fetch("http://localhost:8000/api/work-posts/", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch works");
                }

                const data = await response.json();
                setWorks(data);
            } catch (error) {
                console.error("Error fetching works:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWorks();
    }, []);


    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this work post?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("access");

            const response = await fetch(
                `http://localhost:8000/api/work-posts/${id}/delete/`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete work post");
            }

            // Remove from UI immediately
            setWorks((prevWorks) => prevWorks.filter((work) => work.id !== id));

        } catch (error) {
            console.error("Delete error:", error);
            setNotification({
                isVisible: true,
                type: 'error',
                message: 'Failed to delete work post'
            });
        }
    };


    return (
        <div className="space-y-6 animate-fade-in relative">
            <Notification 
                {...notification}
                onClose={hideNotification}
            />
            {/* Detail Modal */}
            {selectedWork && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex justify-between items-center z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{selectedWork.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${getStatusColor(selectedWork.status)}`}>
                                        {selectedWork.status}
                                    </span>
                                    {/* <span className="text-sm text-slate-500">• Posted {new Date(selectedWork.created_at).toLocaleDateString()}</span> */}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedWork(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Key Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Category</p>
                                    <p className="font-semibold text-slate-700">{selectedWork.category}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Location</p>
                                    <p className="font-semibold text-slate-700 flex items-center gap-1">
                                        {selectedWork.type === 'Online' ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                        {/* {selectedWork.type} */}
                                        {selectedWork.work_nature === "Professional" ? (
                                         <>
                                             Online
                                                </>
                                            ) : (
                                                <>
                                                    {/* <MapPin className="w-3 h-3" /> */}
                                                    {selectedWork.city}, {selectedWork.area}
                                                </>
                                            )}
                                            </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Budget</p>
                                    <p className="font-semibold text-slate-700 flex items-center gap-1">
                                         ₹{selectedWork.budget_min} - ₹{selectedWork.budget_max}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Duration</p>
                                    <p className="font-semibold text-slate-700 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {selectedWork.work_nature === "Professional"
                                                                            ? selectedWork.professional_duration
                                                                            : selectedWork.local_time_estimate}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Description</h4>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {selectedWork.description}
                                </p>
                            </div>

                            {/* Requirements */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Requirements</h4>
                                <ul className="space-y-2">
                                    {/* {selectedWork.requirements.map((req, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                            {req}
                                        </li>
                                    ))} */}
                                    {selectedWork.skills && selectedWork.skills.length > 0 ? (
                                        selectedWork.skills.map((skill, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                {skill}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-slate-500">No specific requirements</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedWork(null)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-white hover:border-slate-300 transition-all text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-900">My Work Requests</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <select className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white shadow-sm flex-1 sm:flex-none">
                        <option value="">All Status</option>
                        <option>Active</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Draft</option>
                    </select>
                    <select className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white shadow-sm flex-1 sm:flex-none">
                        <option value="">All Categories</option>
                        <option>Software</option>
                        <option>Hardware</option>
                        <option>Local Service</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                
                {loading ? (
                    <p className="text-slate-500">Loading works...</p>
                ) : works.length === 0 ? (
                    <p className="text-slate-500">No work posts found.</p>
                ) : 
                works.map(work => (
                    <div key={work.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-slate-900 text-lg">{work.title}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${getStatusColor(work.status)}`}>
                                        {work.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                    <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{work.category}</span>
                                    <span className="flex items-center gap-1">
                                        {work.type === 'Online' ? <Globe className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                                        {work.type} {work.type === 'On-site' && `• ${work.location}`}
                                    </span>
                                    <span>Posted {work.posted}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                                {work.applicants > 0 && (
                                    <Link to={`/work-dashboard/applications`} className="text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                                        {work.applicants} Applicants
                                    </Link>
                                )}
                                <div className="flex items-center gap-1">
                                    {/* <button
                                        onClick={() => setSelectedWork(work)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors tooltip"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button> */}
                                    <button
                                        onClick={() => setSelectedWork(work)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors tooltip"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    {/* <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button> */}
                                    <button
                                        onClick={() => handleDelete(work.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                                                    </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyWorks;
