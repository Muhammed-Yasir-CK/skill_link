import React, { useState, useEffect } from 'react';
import { CheckCircle, MapPin, DollarSign, Clock, ArrowRight, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const CompletedWorks = () => {
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompletedWorks = async () => {
            try {
                const res = await api.get('seeker/completed-works/');
                setWorks(res.data.completed_works || []);
            } catch (error) {
                console.error("Failed to fetch completed works:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompletedWorks();
    }, []);

    const userEmail = localStorage.getItem("email") || "";

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900">Completed Works History</h2>

            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                    Loading history...
                </div>
            ) : works.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {works.map(work => (
                        <div key={work.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
                                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                            {work.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1 font-medium">{work.company}</p>
                                    </div>
                                </div>
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100">
                                    Completed
                                </span>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    {work.location}
                                </span>
                                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    Completed on {work.posted}
                                </span>
                                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                                    <IndianRupee className="w-4 h-4" />
                                    {work.salary}
                                </span>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                                <Link
                                    to={`/${work.user_role === 'provider' ? 'provider' : 'seeker'}/agreement/${work.application_id}`}
                                    className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
                                >
                                    View Agreement <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <CheckCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No completed works yet</h3>
                    <p className="text-sm text-slate-500">Works you complete will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default CompletedWorks;
