import React  from 'react';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { applyToJob } from "../../services/applyService";
import Notification from "../../components/Notification";
// Header/Footer removed here as they are provided by WorkLayout
import {
    MapPin,
    Clock,
    DollarSign,
    ArrowLeft,
    // Share2,
    Briefcase,
    Monitor,
    Wrench,
    Calendar,
    CheckCircle,
    User,
    Phone,
    MessageSquare,
    Shield,
    Globe
} from 'lucide-react';

const WorkDetails = () => {
    const { id } = useParams();
    const [work, setWork] = useState(null);
    
    const [notification, setNotification] = useState({
        isVisible: false,
        message: "",
        type: "success"
    });

    const handleApply = async () => {
        try {
            await applyToJob(work.id, "local"); // work posts are local

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
        const fetchWork = async () => {
            try {
                // const res = await fetch(`http://localhost:8000/api/work-posts/${id}/`);

                const token = localStorage.getItem("access");

                const res = await fetch(`http://localhost:8000/api/work-posts/${id}/`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!res.ok) throw new Error("Work not found");

                const data = await res.json();
                console.log("WORK DATA:", data);
                setWork(data);

            } catch (error) {
                console.error("Failed to fetch work:", error);
            }
        };

        fetchWork();
    }, [id]);


    console.log("PARAM ID:", id);

    if (!work) {
        return (
            <div className="flex items-center justify-center py-20">
                <Header />
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800">Work request not found</h2>
                    <Link to={`/seeker/work/${id}`} className="text-indigo-600 font-bold hover:underline mt-4 inline-block">Back to My Works</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const isProfessional = work?.work_nature === 'Professional';

    

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
                <div className="max-w-5xl mx-auto animate-fade-in">

                <Link
                    to="/seeker"
                    className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-semibold"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to My Works
                </Link>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                 
                <div className="p-8 border-b border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">

                        

                        <div className="flex items-start gap-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 flex-shrink-0 ${isProfessional ? 'bg-indigo-600 border-indigo-500/20' : 'bg-emerald-600 border-emerald-500/20'}`}>
                                {isProfessional ? <Monitor className="w-8 h-8" /> : <Wrench className="w-8 h-8" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${isProfessional ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                        {work.work_nature}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Category: {work.category}</span>
                                </div>
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">{work.title}</h1>

                                <div className="flex items-center gap-3 mt-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                            {/* Posted By */}
                                        </p>
                                        <p className="text-sm font-bold text-slate-800">
                                            {work.provider_name || "Unknown User"}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>



                        {/* RIGHT SIDE APPLY BUTTON */}
                        <div className="w-full md:w-auto flex justify-end">
                            <button
                                onClick={handleApply}
                                className={`text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:-translate-y-0.5 active:scale-95 ${
                                    isProfessional
                                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                }`}
                            >
                                Apply Now
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-8">
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-bold">{work.currency} {work.budget_min} - {work.budget_max} ({work.payment_type})</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-bold">Urgency: {work.urgency}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm font-bold">
                                    Posted {new Date(work.created_at).toLocaleDateString()}
                                </span>   
                        </div>
                        {!isProfessional && (
                            <div className="flex items-center gap-2 text-slate-600 bg-emerald-50/50 border border-emerald-100 px-4 py-2 rounded-xl">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-bold">{work.city}, {work.area}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body Section */}
                <div className="p-8 space-y-10">
                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                            Work Description
                        </h3>
                        <div className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                            {work.description}
                        </div>
                    </div>

                    {/* Conditional Detail Sections */}
                    {isProfessional ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Required Expertise</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {work.skills?.map((skill, i) => (
                                            <span key={i} className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-xl border border-indigo-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">XP Level</p>
                                        <p className="font-bold text-slate-900">{work.experience_level}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Portfolio</p>
                                        <p className="font-bold text-slate-900">{work.portfolio_required ? 'Required' : 'Not Required'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-900 rounded-2xl text-white">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    Expected Deliverables
                                </h4>
                                <p className="text-sm font-medium leading-relaxed italic text-slate-300">
                                    "{work.deliverables}"
                                </p>
                                <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                    <Globe className="w-3 h-3" /> Digital Work • All Remote
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                    <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4">Service Schedule</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500 font-bold">Preferred Date:</span>
                                            <span className="text-sm text-slate-900 font-black">{work.preferred_date}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500 font-bold">Preferred Time:</span>
                                            <span className="text-sm text-slate-900 font-black">{work.preferred_time_slot}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500 font-bold">Estimated Time:</span>
                                            <span className="text-sm text-slate-900 font-black">{work.local_time_estimate}</span>
                                        </div>
                                    </div>
                                </div>
                                {work.certification_required  && (
                                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                        <Shield className="w-6 h-6 text-amber-600" />
                                        <div>
                                            <p className="text-sm font-black text-amber-900">License/ID Required</p>
                                            <p className="text-[10px] text-amber-700 font-bold">Worker must present valid certification on arrival</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Location & Tools</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase">Venue</p>
                                                <p className="text-sm font-bold text-slate-900">{work.work_location_type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                <Wrench className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase">Tools Provided By</p>
                                                <p className="text-sm font-bold text-slate-900">{work.tools_provided_by === 'Me' ? 'Hirer (Me)' : 'Worker'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                <Shield className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase">Pincode</p>
                                                <p className="text-sm font-bold text-slate-900">{work.pincode}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase">Range Preference</p>
                                                <p className="text-sm font-bold text-slate-900">Within {work.distance_preference}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Preference Section */}
                    {/* <div className="pt-8 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-200/60">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                    {work.contactMethod === 'Chat' ? <MessageSquare className="w-6 h-6 text-indigo-600" /> : <Phone className="w-6 h-6 text-emerald-600" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Connect Via</p>
                                    <p className="text-lg font-black text-slate-900">Direct {work.contactMethod}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button className="flex-1 sm:flex-none px-8 py-3 bg-slate-900 text-white font-black text-sm rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-slate-900/40 transition-all active:scale-95">
                                    {work.contactMethod === 'Chat' ? 'Open Chat' : 'View Contact Number'}
                                </button>
                                <button className="flex-1 sm:flex-none px-8 py-3 bg-white text-slate-600 border border-slate-200 font-black text-sm rounded-2xl hover:bg-slate-50 transition-all">
                                    Edit Request
                                </button>
                            </div>
                        </div>
                    </div> */}
                </div>
                            </div>
            </div>
        </main>

        <Footer />
    </div>

    );
};

export default WorkDetails;

