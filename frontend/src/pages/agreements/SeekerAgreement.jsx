import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageSquare, ShieldCheck, Building2 } from 'lucide-react';
import StatusTimeline from './components/StatusTimeline';
import WorkDetails from './components/WorkDetails';
import PaymentDetails from './components/PaymentDetails';
import TermsSection from './components/TermsSection';
import ActionButtons from './components/ActionButtons';
import Notification from '../../components/Notification';

const SeekerAgreement = () => {

    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    const [agreementData, setAgreementData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [submissionNotes, setSubmissionNotes] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState({
        isVisible: false,
        type: 'success',
        message: ''
    });

    const hideNotification = () => setNotification(prev => ({ ...prev, isVisible: false }));

    const token = localStorage.getItem("access");

    React.useEffect(() => {
        if (!applicationId) return;

        fetch(`http://localhost:8000/api/seeker/get-agreement/${applicationId}/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.agreement) {
                    let uiStatus = data.agreement.status;
                    if (uiStatus === "pending") uiStatus = "Agreement Pending";
                    if (uiStatus === "accepted") uiStatus = "Accepted";
                    if (uiStatus === "in_progress") uiStatus = "InProgress";
                    if (uiStatus === "submitted") uiStatus = "Submitted";
                    if (uiStatus === "paid") uiStatus = "Payment Released";
                    if (uiStatus === "completed") uiStatus = "Completed";

                    setAgreementData({
                        jobTitle: data.agreement.job_title || "Work Agreement",
                        providerName: data.agreement.provider_name || "Provider",
                        status: uiStatus,
                        work: {
                            description: data.agreement.description,
                            deliverables: data.agreement.deliverables || [],
                            deadline: data.agreement.deadline || "",
                            attachments: []
                        },
                        payment: {
                            amount: data.agreement.amount,
                            currency: data.agreement.currency,
                            method: data.agreement.method,
                            release_strategy: data.agreement.release_strategy,
                            txHash: data.agreement.tx_hash
                        },
                        terms: data.agreement.terms || [],
                        submission: {
                            notes: data.agreement.submission_notes,
                            attachment: data.agreement.submission_attachment
                        },
                        onChainId: data.agreement.on_chain_id
                    });

                    if (data.agreement.status !== "pending") {
                        setIsTermsAccepted(true);
                    }
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching seeker agreement:", err);
                setLoading(false);
            });
    }, [applicationId, token]);

    const handleAction = (actionType) => {
        if (!agreementData) return;

        if (actionType === 'accept' || actionType === 'reject') {
            fetch(`http://localhost:8000/api/seeker/respond-agreement/${applicationId}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ action: actionType })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status) {
                        setAgreementData(prev => ({
                            ...prev,
                            status: data.status === "accepted" ? "Accepted" : "Rejected"
                        }));
                        if (data.status === "accepted") setIsTermsAccepted(true);
                    }
                })
                .catch(err => console.error("Error responding to agreement:", err));
        } else if (actionType === 'confirm_payment') {
            const confirmRelease = async () => {
                if (!window.confirm("Confirm you have securely received the crypto funds in your wallet? This will close the contract forever.")) return;
                
                try {
                    setLoading(true);
                    // Send request to backend to process the closure

                    const res = await fetch(`http://localhost:8000/api/seeker/respond-agreement/${applicationId}/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ action: "complete" })
                    });
                    
                    const data = await res.json();
                    if (data.status) {
                        setAgreementData(prev => ({ ...prev, status: 'Completed' }));
                        window.location.reload();
                    }
                } catch (err) {
                    console.error("Release flow error:", err);
                    setNotification({
                        isVisible: true,
                        type: 'error',
                        message: "Failed to confirm payment: " + (err.message || "Unknown error")
                    });
                } finally {
                    setLoading(false);
                }
            };
            confirmRelease();
        } else if (actionType === 'show_submit_form') {
            setShowSubmitForm(true);
        }
    };

    const submitWork = async (e) => {
        e.preventDefault();
        if (!submissionNotes && !submissionFile) return;

        setSubmitting(true);
        const formData = new FormData();
        if (submissionNotes) formData.append("submission_notes", submissionNotes);
        if (submissionFile) formData.append("submission_attachment", submissionFile);

        try {
            const res = await fetch(`http://localhost:8000/api/seeker/submit-work/${applicationId}/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (data.status) {
                setAgreementData(prev => ({ ...prev, status: "Submitted" }));
                setShowSubmitForm(false);
            }
        } catch (error) {
            console.error("Error submitting work:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!agreementData) return <div className="p-10 text-center">Agreement not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Notification 
                {...notification}
                onClose={hideNotification}
            />
            {/* Top Navigation */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all font-bold"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-slate-900 tracking-tight">{agreementData.jobTitle}</h1>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-emerald-100 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Securing Funds
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <p className="text-xs font-bold text-slate-500 underline underline-offset-4 decoration-slate-200">Offered by {agreementData.providerName}</p>
                            </div>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                        <MessageSquare className="w-4 h-4" /> Message Provider
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 mt-10">
                {/* Workflow Viz */}
                <StatusTimeline currentStatus={agreementData.status} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Work View (Reduced for reader) */}
                        <WorkDetails data={agreementData.work} />

                        {/* Terms - Only interactive if status is Pending */}
                        <TermsSection
                            terms={agreementData.terms}
                            checked={isTermsAccepted}
                            onChange={setIsTermsAccepted}
                            readOnly={agreementData.status !== 'Agreement Pending'}
                        />

                        {/* Work Submission Section */}
                        {showSubmitForm && agreementData.status === 'InProgress' && (
                            <form onSubmit={submitWork} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8 space-y-6">
                                <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Submit Your Work</h3>
                                <p className="text-sm text-slate-500 mb-4">Provide any notes, links, or attachments for the provider to review.</p>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Message / Links (Optional)</label>
                                    <textarea
                                        value={submissionNotes}
                                        onChange={(e) => setSubmissionNotes(e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl p-4 text-sm min-h-[100px] bg-slate-50"
                                        placeholder="Add any notes about your completion..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Attachment (Optional)</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setSubmissionFile(e.target.files[0])}
                                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={submitting || (!submissionNotes && !submissionFile)}
                                        className="px-6 py-3 bg-brand-navy text-white text-xs font-bold uppercase rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Work'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowSubmitForm(false)}
                                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase rounded-xl hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                        {(agreementData.status === 'Submitted' || agreementData.status === 'Payment Released' || agreementData.status === 'Completed') && (
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8">
                                <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" /> Work Submitted
                                </h3>
                                {(agreementData.submission?.notes || agreementData.submission?.attachment) ? (
                                    <div className="space-y-4">
                                        {agreementData.submission.notes && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase">Notes:</p>
                                                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl mt-1 border border-slate-100">{agreementData.submission.notes}</p>
                                            </div>
                                        )}
                                        {agreementData.submission.attachment && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase">Attachment:</p>
                                                <a href={`http://127.0.0.1:8000${agreementData.submission.attachment}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline mt-1 inline-block bg-blue-50 px-4 py-2 rounded-xl">View Attached File</a>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">Work was submitted without notes or attachments.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        <PaymentDetails data={agreementData.payment} />

                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Action Required</h4>
                            <ActionButtons
                                role="seeker"
                                status={agreementData.status}
                                onAction={handleAction}
                                disabled={agreementData.status === 'Agreement Pending' && !isTermsAccepted}
                            />
                            {agreementData.status === 'Agreement Pending' && !isTermsAccepted && (
                                <p className="text-[9px] text-red-400 font-bold mt-4 uppercase tracking-tighter italic">
                                    Review and Accept Terms to Proceed
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SeekerAgreement;
