import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Briefcase, Building2, MapPin, Calendar, CheckCircle2, Clock, XCircle, UserCheck, FileSignature } from 'lucide-react';
const MyApplications = () => {
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await axios.get(
                    "http://127.0.0.1:8000/api/my-applications/",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("access")}`,
                        },
                    }
                );

                setApplications(res.data);
            } catch (err) {
                console.error(err);

                console.log("ERROR STATUS:", err.response?.status);
                console.log("ERROR DATA:", err.response?.data);

            }
        };

        fetchApplications();
    }, []);

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Applications Tracker
            </h2>

            <div className="space-y-4">
                {applications.length === 0 ? (
                    <p>No applications yet.</p>
                ) : (
                    applications.map((app) => (
                        <div
                            key={app.id}
                            className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                {app.company_logo ? (
                                    <img 
                                        src={app.company_logo} 
                                        alt={app.company_name} 
                                        className="w-12 h-12 rounded-lg object-cover border border-slate-200" 
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-700">
                                        {app.company_name?.[0]}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        {app.job_title}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {app.company_name} • Applied{" "}
                                        {new Date(app.applied_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {app.status === "Selected" && app.job_source === "user" && (
                                    <button
                                        onClick={() => navigate(`/seeker/agreement/${app.id}`)}
                                        className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <FileSignature className="w-3 h-3" /> View
                                    </button>
                                )}
                                <span
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold border
                                ${app.status === "Pending"
                                            ? "text-blue-600 bg-blue-50 border-blue-200"
                                            : app.status === "Review"
                                                ? "text-purple-600 bg-purple-50 border-purple-200"
                                                : app.status === "Shortlist"
                                                    ? "text-indigo-600 bg-indigo-50 border-indigo-200"
                                                    : app.status === "Interview"
                                                        ? "text-yellow-600 bg-yellow-50 border-yellow-200"
                                                        : app.status === "Selected"
                                                            ? "text-green-600 bg-green-50 border-green-200"
                                                            : "text-red-600 bg-red-50 border-red-200"
                                        }`}
                                >
                                    {app.status}
                                </span>


                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyApplications;