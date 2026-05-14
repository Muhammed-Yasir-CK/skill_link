

import React, { useState, useEffect } from 'react';
import { User, MessageSquare, Check, X, Phone, Mail, FileText, ChevronRight, XCircle, CheckCircle, ExternalLink, Image as ImageIcon, ShieldCheck, FileSignature } from 'lucide-react';
import { useLocation } from "react-router-dom";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { useSearchParams } from 'react-router-dom';

const ReceivedApplications = () => {
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);

    const handleAction = async (id, action) => {
        const newStatus = action === "accept" ? "Selected" : "Rejected";
        try {
            const res = await fetch(`http://localhost:8000/api/company/update-application-status/${id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access")}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error("Failed request");
            const data = await res.json();

            setApplications(prev => prev.map(app => app.id === id ? { ...app, status: data.status } : app));

            if (selectedApp && selectedApp.id === id) {
                setSelectedApp(prev => ({ ...prev, status: data.status }));
            }
        } catch (err) {
            console.error("Status update failed:", err);
        }
    };

    useEffect(() => {
        fetch("http://localhost:8000/api/worker/received-applications/", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access")}`
            }
        })
        .then(res => res.json())
        .then(data => {
            setApplications(data);
        })
        .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-6 animate-fade-in relative">

            {/* Detail Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                            <div className="flex gap-6">
                                <div className="relative">
                                    <img
                                        src={selectedApp.avatar || "https://via.placeholder.com/150"}
                                        alt={selectedApp.applicantName}
                                        className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-bold text-slate-900">{selectedApp.applicantName}</h3>
                                        {/* <Link to={`/candidate/${selectedApp.id}`} className="px-3 py-1 bg-white border border-slate-200 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition-all shadow-sm">
                                            View Profile
                                        </Link> */}
                                    </div>
                                    <p className="text-indigo-600 font-bold tracking-tight">{selectedApp.applicantRole}</p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-slate-100">
                                            Applied for: <span className="text-slate-700">{selectedApp.workTitle}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="p-2.5 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-100 rounded-xl transition-all text-slate-400 hover:text-red-500 shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8 flex-1">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Experience</p>
                                        <p className="text-lg font-bold text-slate-900">{selectedApp.experience}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Summary */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-indigo-500" /> Professional Summary
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100 border-dashed italic">
                                    "{selectedApp.profileSummary}"
                                </p>
                            </div>

                            {/* Documents & Proofs Section */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Documents & Proofs
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <a
                                        href={selectedApp.resume}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 hover:bg-slate-50 transition-all group"
                                    >       <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-slate-900">Resume / CV</p>
                                                <p className="text-[10px] text-slate-500">View detailed history</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                                    </a>
                                    <a
                                        href={selectedApp.certificate}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-600 hover:bg-slate-50 transition-all group"
                                    >       <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600">
                                                <ImageIcon className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-slate-900">Work Proof</p>
                                                <p className="text-[10px] text-slate-500">License / Certificate</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-emerald-600" />
                                    </a>
                                </div>
                            </div>

                            {/* Contact Info (Mock) */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Information</h4>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl flex-1 shadow-sm">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-bold text-slate-900">{selectedApp.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl flex-1 shadow-sm">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-bold text-slate-900 truncate">{selectedApp.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="p-8 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3 justify-end items-center">
                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100 transition-all shadow-sm active:scale-95">
                                <MessageSquare className="w-5 h-5" /> Chat Now
                            </button>
                            {selectedApp.status !== 'Selected' && selectedApp.status !== 'Rejected' && (
                                <>
                                    <button
                                        onClick={() => handleAction(selectedApp.id, 'reject')}
                                        className="w-full sm:w-auto  py-3 rounded-2xl border border-red-100 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 px-8"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(selectedApp.id, 'accept')}
                                        className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95"
                                    >
                                        Select Candidate
                                    </button>
                                </>
                            )}
                            {selectedApp.status === 'Selected' && (
                                <div className="flex items-center gap-3">
                                    <div className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200">
                                        <CheckCircle className="w-5 h-5" /> Candidate Selected
                                    </div>
                                    {/* <button
                                        onClick={() => navigate(`/provider/agreement/${selectedApp.id}`)}
                                        className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95"
                                    >
                                        <FileSignature className="w-5 h-5" /> Setup Agreement
                                    </button> */}
                                    <button
                                        onClick={() => navigate(`/provider/agreement/${selectedApp.id}`, {
                                            state: { application: selectedApp }
                                        })}
                                        className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95"
                                    >
                                        <FileSignature className="w-5 h-5" /> Setup Agreement
                                    </button>
                                </div>
                            )}
                            {selectedApp.status === 'Rejected' && (
                                <div className="px-6 py-3 bg-red-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-red-200">
                                    <XCircle className="w-5 h-5" /> Application Rejected
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Received Applications</h2>
                    <p className="text-slate-500 font-medium">Review talent for your posted requests</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {applications.map(app => (
                    <div key={app.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                            {/* Avatar & Basic Info */}
                            <div className="flex items-center gap-5 w-full md:w-auto flex-1">
                                <div className="relative shrink-0">
                                    <img
                                        src={app.avatar || "https://via.placeholder.com/100"}
                                        alt={app.applicantName}
                                        className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-bold text-slate-900 text-xl tracking-tight">{app.applicantName}</h3>
                                    <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                        {app.applicantRole} <span className="text-slate-300">|</span> <span className="text-indigo-600 font-bold">{app.experience} Exp.</span>
                                    </p>
                                </div>
                            </div>

                            {/* Job Info (Desktop) */}
                            <div className="hidden md:block flex-1 border-l border-slate-100 pl-8">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Request Reference</p>
                                <p className="font-bold text-slate-800 line-clamp-1">{app.workTitle}</p>
                            </div>

                            {/* Status & Match */}
                            {/* Status & Match */}
                            <div className="flex items-center justify-end w-full md:w-auto gap-10 md:border-l md:border-slate-100 md:pl-8">
                                <div className="text-right">
                                    <span className={`inline-block px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest ${app.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                        app.status === 'Selected' ? 'bg-emerald-100 text-emerald-700' :
                                            app.status === 'Reviewed' ? 'bg-indigo-100 text-indigo-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {app.status}
                                    </span>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                                        {app.date ? new Date(app.date).toLocaleDateString() : "—"}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="w-full md:w-auto flex items-center gap-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end">
                                {app.status === 'Selected' && (
                                    // <button
                                    //     onClick={() => navigate(`/provider/agreement/${app.id}`)}
                                    //     className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
                                    // >
                                    //     <FileSignature className="w-3.5 h-3.5" /> Setup Agreement
                                    // </button>
                                    <button
                                        onClick={() => navigate(`/provider/agreement/${app.id}`, {
                                            state: { application: app }
                                        })}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
                                    >
                                        <FileSignature className="w-3.5 h-3.5" /> Setup Agreement
                                    </button>
                                )}
                                
                                
                                <button
                                    onClick={() => setSelectedApp(app)}
                                    className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 group/btn"
                                >
                                    Details <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                </button>

                                {app.status === 'Pending' && (
                                    <div className="flex items-center gap-2 ml-1">
                                        <button
                                            onClick={() => handleAction(app.id, 'accept')}
                                            className="p-2.5 text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-md active:scale-90"
                                            title="Accept"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleAction(app.id, 'reject')}
                                            className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-md active:scale-90"
                                            title="Reject"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReceivedApplications;
