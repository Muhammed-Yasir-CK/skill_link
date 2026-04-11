import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search,
    Filter,
    Users,
    MessageSquare,
    Mail,
    Phone,
    Calendar,
    FileText,
    MoreHorizontal,
    ChevronRight,
    MapPin,
    Clock,
    X,
    CheckCircle2,
    Briefcase,
    ShieldCheck,
    ArrowUpRight,
    GraduationCap,
    Send,
    User,
    ExternalLink,
    Image as ImageIcon
} from 'lucide-react';

const Candidates = () => {
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    //  Data
    const [candidates, setCandidates] = useState([]);

    const openCandidateDetails = (candidate) => {
        setSelectedCandidate(candidate);
        setIsViewModalOpen(true);
    };

    const statusFlow = [
      "Pending",
      "Review",
      "Shortlist",
      "Interview",
      "Selected"
    ];

    const getNextStatuses = (current) => {
      if (current === "Selected" || current === "Rejected") return [];

      const index = statusFlow.indexOf(current);

      return [
        statusFlow[index + 1], // next step
        "Rejected"             // reject anytime
      ].filter(Boolean);
    };

    useEffect(() => {

        const fetchCandidates = async () => {

            try {

                const res = await axios.get(
                    "http://127.0.0.1:8000/api/company/received-applications/",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("access")}`
                        }
                    }
                );

                console.log("CANDIDATES DATA:", res.data);

                setCandidates(res.data);

            } catch (err) {

                console.error("FETCH ERROR:", err);

            }

        };

        fetchCandidates();

    }, []);

    // const updateApplicationStatus = async (applicationId, newStatus) => {
    //     try {

    //         await axios.patch(
    //             `http://127.0.0.1:8000/api/company/update-application-status/${applicationId}/`,
    //             { status: newStatus },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${localStorage.getItem("access")}`
    //                 }
    //             }
    //         );

    //         // update UI instantly
    //         setCandidates(prev =>
    //             prev.map(c =>
    //                 c.id === applicationId ? { ...c, status: newStatus } : c
    //             )
    //         );

    //         setSelectedCandidate(prev => ({
    //             ...prev,
    //             status: newStatus
    //         }));

    //     } catch (err) {
    //         console.error("STATUS UPDATE ERROR:", err);
    //     }
    // };



    const updateApplicationStatus = async (applicationId, newStatus) => {
      try {

          const res = await axios.patch(
              `http://127.0.0.1:8000/api/company/update-application-status/${applicationId}/`,
              { status: newStatus },
              {
                  headers: {
                      Authorization: `Bearer ${localStorage.getItem("access")}`
                  }
              }
          );

          const updatedStatus = res.data.status;

          // update candidates list
          setCandidates(prev =>
              prev.map(c =>
                  c.id === applicationId
                      ? { ...c, status: updatedStatus }
                      : c
              )
          );

          // update modal candidate safely
          setSelectedCandidate(prev => {
              if (!prev || prev.id !== applicationId) return prev;

              return {
                  ...prev,
                  status: updatedStatus
              };
          });

      } catch (err) {
          console.error("STATUS UPDATE ERROR:", err);
      }
  };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        Candidate Pipeline
                        <span className="px-2 py-0.5 bg-brand-navy/5 text-brand-navy text-[10px] uppercase tracking-tighter rounded-md border border-brand-navy/10">Active Applications</span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Manage and track your incoming talent pool with precision.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, role or skill..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:ring-2 focus:ring-brand-navy/10 focus:border-brand-navy outline-none w-72 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Candidates Card Grid */}
            <div className="grid grid-cols-1 gap-4">
                {candidates
                    .filter(c =>
                        (c.candidateName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (c.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (c.jobTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((candidate) => (
                        <div
                            key={candidate.id}
                            className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-navy/20 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 cursor-pointer"
                            onClick={() => openCandidateDetails(candidate)}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                   <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center 
                                        border border-slate-200 overflow-hidden
                                        group-hover:ring-2 group-hover:ring-green-400 transition-all duration-300">
                                        <img
                                          src={candidate.avatar}
                                          alt="avatar"
                                          className="w-full h-full object-cover rounded-3xl"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-navy transition-colors">{candidate.candidateName}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${candidate.status === 'Interview' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                candidate.status === 'Selected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    candidate.status === 'Shortlist' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                        candidate.status === 'Review' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {candidate.status}
                                            </span>
                                        </div>
                                        <p className="text-brand-navy text-[11px] font-bold uppercase tracking-[0.05em] mb-2">Applied for: {candidate.jobTitle}</p>
                                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {candidate.location}</div>
                                            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Applied {new Date(candidate.appliedDate).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                                    <div className="flex -space-x-1">
                                        {(candidate.skills || []).slice(0,3).map((skill, i) => (
                                            <div key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 shadow-sm">
                                                {skill}
                                            </div>
                                        ))}
                                        {(candidate.skills || []).length > 3 && (
                                            <div className="px-3 py-1 bg-slate-900 border border-slate-900 rounded-lg text-[10px] font-bold text-white shadow-sm">
                                                +{(candidate.skills || []).length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openCandidateDetails(candidate); }}
                                        className="px-6 py-2 bg-brand-navy text-white text-xs font-bold rounded-xl hover:bg-indigo-600 shadow-lg shadow-brand-navy/10 transition-all flex items-center gap-2"
                                    >
                                        View Details <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Candidate Detail Modal */}
            {isViewModalOpen && selectedCandidate && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex items-start justify-between">
                            <div className="flex gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-brand-navy font-bold text-3xl shadow-sm">
                                    <img
                                      src={selectedCandidate.avatar}
                                      alt="avatar"
                                      className="w-full h-full object-cover rounded-3xl"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-slate-900">{selectedCandidate.candidateName}</h2>
                                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-emerald-100 flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" /> Verified Profile
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                                        <div className="flex items-center gap-1.5 tracking-tight">
                                            <span className="text-[10px] font-bold text-slate-300 uppercase">Profession:</span>
                                            <Briefcase className="w-4 h-4 text-slate-400" /> {selectedCandidate.role}
                                        </div>
                                        <span className="text-slate-300">•</span>
                                        <div className="flex items-center gap-1.5 tracking-tight"><MapPin className="w-4 h-4 text-slate-400" /> {selectedCandidate.location}</div>
                                        <span className="text-slate-300">•</span>
                                        <div className="font-bold text-brand-navy uppercase text-[10px] tracking-widest">
                                          <span className="text-slate-400">Experience:</span> {selectedCandidate.experience}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                onClick={() => setIsViewModalOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column */}
                                <div className="lg:col-span-2 space-y-8">
                                    <section className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-navy/20 group-hover:bg-brand-navy transition-colors"></div>
                                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                            <User className="w-4 h-4 text-brand-navy" /> Professional Summary
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed text-[15px] font-medium">
                                            {selectedCandidate.bio}
                                        </p>
                                    </section>

                                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5" /> Application Status
                                        </h3>
                                        

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                          <div>
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">
                                                  Job Applied
                                              </p>
                                              <p className="font-bold text-slate-900 text-sm">
                                                  {selectedCandidate.jobTitle}
                                              </p>
                                          </div>

                                          {/* <select
                                              className="text-xs font-bold border-slate-200 rounded-lg focus:ring-brand-navy focus:border-brand-navy bg-white py-1.5"
                                              value={selectedCandidate.status}
                                              onChange={(e) =>
                                                  updateApplicationStatus(selectedCandidate.id, e.target.value)
                                              }
                                          >
                                              <option value="Pending">Pending</option>
                                              <option value="Review">Review</option>
                                              <option value="Shortlist">Shortlist</option>
                                              <option value="Interview">Interview</option>
                                              <option value="Selected">Select</option>
                                              <option value="Rejected">Reject</option>
                                          </select> */}
                                          <div className="flex flex-col items-end bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">

                                          <select
                                            className="text-xs font-bold border-slate-200 rounded-lg focus:ring-brand-navy focus:border-brand-navy bg-white py-1.5"
                                            value={selectedCandidate.status}
                                            onChange={(e) =>
                                                updateApplicationStatus(selectedCandidate.id, e.target.value)
                                            }
                                            disabled={
                                                selectedCandidate.status === "Selected" ||
                                                selectedCandidate.status === "Rejected"
                                            }
                                          >
                                            <option value={selectedCandidate.status}>
                                                {selectedCandidate.status}
                                            </option>

                                            {getNextStatuses(selectedCandidate.status).map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                          </select>
                                          </div>
                                      </div>
                                    </section>

                                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5" /> Documents & Proofs
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Resume Column */}
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-brand-navy/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">Resume / CV</p>
                                                        <p className="text-[10px] text-slate-500 font-medium font-mono">Candidate_Resume.pdf</p>
                                                    </div>
                                                </div>
                                                <a href={selectedCandidate.resume} target="_blank" rel="noreferrer" className="p-2 bg-white text-slate-400 hover:text-brand-navy rounded-lg border border-slate-200 shadow-sm transition-all">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>

                                            {/* Portfolio/Certificates Column */}
                                            {selectedCandidate.certificates && selectedCandidate.certificates.length > 0 && (
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-brand-navy/30 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                                            <ImageIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">Work Proof / Certificates</p>
                                                            <p className="text-[10px] text-slate-500 font-medium">{selectedCandidate.certificates.length} Files Attached</p>
                                                        </div>
                                                    </div>
                                                    <a href={selectedCandidate.certificates} target="_blank" rel="noreferrer" className="p-2 bg-white text-slate-400 hover:text-brand-navy rounded-lg border border-slate-200 shadow-sm transition-all">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Core Competencies</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(selectedCandidate.skills|| []).map((skill) => (
                                                <span key={skill} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 shadow-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    <div className="bg-slate-900 p-7 rounded-[2rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5">Management Actions</h3>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">Current Status</p>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-base font-black ${selectedCandidate.status === 'Interview' ? 'text-amber-400' :
                                                        selectedCandidate.status === 'Selected' ? 'text-emerald-400' :
                                                            selectedCandidate.status === 'Shortlist' ? 'text-indigo-400' :
                                                                selectedCandidate.status === 'Review' ? 'text-blue-400' :
                                                                    'text-red-400'
                                                        }`}>
                                                        {selectedCandidate.status}
                                                    </span>
                                                    <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                                                </div>
                                            </div>
                                            <button
                                              onClick={() =>
                                                window.location.href = `mailto:${selectedCandidate.email}?subject=Regarding Your Application for ${selectedCandidate.jobTitle}`
                                              }
                                              className="w-full py-3.5 bg-white text-slate-900 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all transform active:scale-[0.98] shadow-lg shadow-white/5 flex items-center justify-center gap-2"
                                            >
                                              <Mail className="w-4 h-4" /> Send Outreach
                                            </button>
                                            {/* <button className="w-full py-3 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-500/10 transition-all border border-red-500/10">
                                                Reject Application
                                            </button> */}
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Detail</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                                                    <p className="text-xs font-bold text-slate-900 truncate">{selectedCandidate.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</p>
                                                    <p className="text-xs font-bold text-slate-900">{selectedCandidate.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Recent Activity</h3>
                                        <div className="space-y-4">
                                            {(selectedCandidate.history || []).map((item, i) => (
                                              <div key={i} className="flex gap-3">
                                                  <div className="w-3 h-3 rounded-full bg-brand-navy"></div>

                                                  <div>
                                                      <p className="text-xs font-bold text-slate-800">
                                                          {item.old_status} → {item.new_status}
                                                      </p>

                                                      <p className="text-[10px] text-slate-400">
                                                          {new Date(item.created_at).toLocaleString()} • {item.actor}
                                                      </p>
                                                  </div>
                                              </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 flex justify-end bg-white">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-8 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Candidates;
