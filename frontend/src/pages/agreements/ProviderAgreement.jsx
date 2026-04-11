
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, MoreHorizontal, User, ShieldCheck } from 'lucide-react';
import StatusTimeline from './components/StatusTimeline';
import WorkDetails from './components/WorkDetails';
import PaymentDetails from './components/PaymentDetails';
import TermsSection from './components/TermsSection';
import ActionButtons from './components/ActionButtons';
import { blockchainService } from '../../services/blockchainService';
import { getValidToken } from '../../services/authToken';
import { useLocation } from "react-router-dom";
import Notification from '../../components/Notification';
const ProviderAgreement = () => {

    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    const [agreementData, setAgreementData] = useState(null);
    const [agreementId, setAgreementId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({
        isVisible: false,
        type: 'success',
        message: ''
    });

    const hideNotification = () => setNotification(prev => ({ ...prev, isVisible: false }));

    // Helper to load Razorpay Script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const { applicationId } = useParams();
    const token = localStorage.getItem("access");
    const location = useLocation();
    const application = location.state?.application;
    const navigate = useNavigate();
    // Fetch the application data from backend

    useEffect(() => {
        if (!applicationId) {
            console.warn("[SkillLink] Application ID missing in URL");
            return;
        }
        const token = localStorage.getItem("access")

        fetch(`http://localhost:8000/api/provider/get-agreement/${applicationId}/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {

                if (data.exists) {
                    setAgreementId(data.agreement.id);

                    if (data.agreement.status !== "pending" && data.agreement.status !== "Selected") {
                        setIsTermsAccepted(true);
                    } else if (data.agreement.status === "pending") {
                        setIsTermsAccepted(true);
                    }

                    // For the provider side, pending means the provider created it (so they sent it).
                    // Wait, let's map statuses securely for the UI:
                    let uiStatus = data.agreement.status;
                    if (uiStatus === "pending") uiStatus = "Agreement Pending";
                    if (uiStatus === "accepted") uiStatus = "Accepted";
                    if (uiStatus === "in_progress") uiStatus = "InProgress";
                    if (uiStatus === "submitted") uiStatus = "Submitted";
                    if (uiStatus === "paid") uiStatus = "Payment Released";
                    if (uiStatus === "completed") uiStatus = "Completed";

                    setAgreementData({
                        jobTitle: data.default_data?.job_title || application?.job_title || application?.jobTitle || application?.workTitle,
                        seekerName: data.default_data?.seeker_name || application?.candidateName || application?.applicantName || application?.applicant_name,
                        employerName: data.default_data?.employer_name,
                        status: uiStatus,

                        work: {
                            description: data.agreement.description,
                            deliverables: data.agreement.deliverables,
                            deadline: data.agreement.deadline
                        },

                        payment: {
                            amount: data.agreement.amount,
                            currency: data.agreement.currency,
                            method: data.agreement.method,
                            release_strategy: data.agreement.release_strategy
                        },

                        seekerWallet: data.default_data?.seeker_wallet,
                        seekerHasWallet: data.default_data?.seeker_has_wallet,
                        providerEmail: data.default_data?.provider_email || "",

                        terms: data.agreement.terms,

                        submission: {
                            notes: data.agreement.submission_notes,
                            attachment: data.agreement.submission_attachment
                        },
                        
                        onChainId: data.agreement.on_chain_id
                    });

                } else {

                    setAgreementData({
                        jobTitle: data.default_data?.job_title || application?.job_title || application?.jobTitle || application?.workTitle,
                        seekerName: application?.candidateName || application?.applicantName || application?.applicant_name,
                        employerName: data.default_data?.employer_name,
                        status: "Selected",

                        work: {
                            description: data.default_data?.description || "",
                            deliverables: [],
                            deadline: ""
                        },

                        payment: {
                            amount: "",
                            currency: "INR",
                            method: "Blockchain Escrow",
                            release_strategy: ""
                        },

                        terms: [],
                        seekerWallet: data.default_data?.seeker_wallet,
                        seekerHasWallet: data.default_data?.seeker_has_wallet,
                        providerEmail: data.default_data?.provider_email || "",
                    });

                }

                setLoading(false)

            })

    }, [applicationId])

    const handleAction = (actionType) => {
        if (actionType === "create") {

            const data = {
                description: agreementData.work.description,
                deliverables: agreementData.work.deliverables,
                deadline: agreementData.work.deadline,

                amount: agreementData.payment.amount,
                currency: agreementData.payment.currency,
                method: agreementData.payment.method,
                release_strategy: agreementData.payment.release_strategy,

                terms: agreementData.terms
            }

            let url = ""
            let method = ""

            if (agreementId) {
                url = `http://localhost:8000/api/provider/update-agreement/${agreementId}/`
                method = "PUT"
            } else {
                url = `http://localhost:8000/api/provider/create-agreement/${applicationId}/`
                method = "POST"
            }

            fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(data => {

                    console.log("Agreement response:", data)
                    if (data.exists && data.default_data) {
                        console.log("Seeker Wallet from backend:", data.default_data.seeker_wallet);
                    }
                    if (data.agreement_id) {
                        setAgreementId(data.agreement_id)
                    }

                })
                .catch(err => {
                    console.error("Agreement error:", err)
                })

        } else if (actionType === 'deposit') {
            console.log("Deposit clicked. Current agreementData:", agreementData);
            const hasWallet = agreementData.seekerHasWallet;
            console.log("Seeker has wallet check:", hasWallet);

            if (!hasWallet) {
                setNotification({
                    isVisible: true,
                    type: 'error',
                    message: "The Seeker (worker) has not set up their SkillLink Web3 Wallet yet. They must create a wallet in their dashboard before you can deposit funds for this agreement."
                });
                return;
            }

            setLoading(true);

            const handleRazorpayPayment = async () => {
                const scriptRes = await loadRazorpayScript();
                if (!scriptRes) {
                    setNotification({
                        isVisible: true,
                        type: 'error',
                        message: 'Razorpay SDK failed to load. Are you online?'
                    });
                    setLoading(false);
                    return;
                }

                // Always get a fresh, valid token (auto-refreshes if expired)
                const freshToken = await getValidToken();
                if (!freshToken) {
                    setNotification({
                        isVisible: true,
                        type: 'error',
                        message: "Your session has expired. Please log in again."
                    });
                    setLoading(false);
                    return;
                }

                try {
                    // 1. Create Order on Backend
                    const orderRes = await fetch(`http://localhost:8000/api/accounts/create-razorpay-order/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${freshToken}`
                        },
                        body: JSON.stringify({ amount: agreementData.payment.amount * 100 })
                    });

                    if (!orderRes.ok) {
                        const errData = await orderRes.json().catch(() => ({}));
                        throw new Error(errData.detail || `Server error: ${orderRes.status}`);
                    }

                    const orderData = await orderRes.json();
                    if (!orderData.id) throw new Error("Failed to create Razorpay order");

                    // Helper: process payment (called by real Razorpay handler OR mock flow)
                    const processPayment = async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
                        setLoading(true);
                        try {
                            // Let the backend handle both database updates and smart contract creation/funding
                            const verifyRes = await fetch(`http://localhost:8000/api/accounts/verify-razorpay-payment/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${freshToken}` },
                                body: JSON.stringify({
                                    order_id: razorpay_order_id,
                                    payment_id: razorpay_payment_id,
                                    signature: razorpay_signature,
                                    agreement_id: agreementId,
                                    amount_inr: agreementData.payment.amount * 100
                                })
                            });

                            const verifyData = await verifyRes.json();
                            if (verifyData.success) {
                                setNotification({
                                    isVisible: true,
                                    type: 'success',
                                    message: "Payment Successful! Funds are now securely held in Escrow."
                                });
                                setTimeout(() => window.location.reload(), 2000);
                            } else {
                                throw new Error(verifyData.detail || "Payment verification failed");
                            }
                        } catch (err) {
                            console.error("Verification/Funding error:", err);
                            setNotification({
                                isVisible: true,
                                type: 'error',
                                message: "Error finalizing payment: " + err.message
                            });
                        } finally {
                            setLoading(false);
                        }
                    };

                    // --- NORMAL RAZORPAY CHECKOUT ---
                    const options = {
                        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                        amount: orderData.amount,
                        currency: orderData.currency,
                        name: "SkillLink Escrow",
                        description: "Payment for Work Agreement",
                        order_id: orderData.id,
                        handler: async function (response) {
                            await processPayment(
                                response.razorpay_order_id,
                                response.razorpay_payment_id,
                                response.razorpay_signature
                            );
                        },
                        prefill: { email: agreementData.providerEmail || "" },
                        theme: { color: "#4F46E5" }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.on('payment.failed', function (response) {
                        setNotification({
                            isVisible: true,
                            type: 'error',
                            message: `Payment failed: ${response.error?.description || 'Unknown error'}`
                        });
                        setLoading(false);
                    });
                    rzp.open();

                } catch (err) {
                    console.error("Razorpay error:", err);
                    setNotification({
                        isVisible: true,
                        type: 'error',
                        message: "Failed to initiate payment: " + err.message
                    });
                } finally {
                    setLoading(false);
                }
            };

            handleRazorpayPayment();

        } else if (actionType === 'approve_work') {
            if (window.confirm("Are you sure you want to confirm the work is done? This will securely release the funds to the seeker via blockchain.")) {
                setLoading(true);

                const performApprovalFlow = async () => {
                    try {
                        let onChainId = agreementData.onChainId;

                        // Send approval request directly to our backend!
                        // The backend will now decrypt our Managed Wallet private key, 
                        // sign the markCompleted() tx on Polygon behind the scenes,
                        // and record the correct MATIC ledger values.
                        const res = await fetch(`http://localhost:8000/api/provider/approve-work/${agreementId}/`, {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });

                        const data = await res.json();
                        if (res.ok && data.status) {
                            setNotification({
                                isVisible: true,
                                type: 'success',
                                message: "Work approved successfully!"
                            });
                            setTimeout(() => window.location.reload(), 2000);
                        } else {
                            throw new Error(data.error || "Failed to approve work on the backend");
                        }
                    } catch (err) {
                        console.error("Approval flow error:", err);
                        setNotification({
                            isVisible: true,
                            type: 'error',
                            message: "Blockchain approval failed: " + (err.message || "Unknown error")
                        });
                    } finally {
                        setLoading(false);
                    }
                };

                performApprovalFlow();
            }
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Agreement...</div>;
    if (!agreementData) return <div className="p-10 text-center">Agreement not found or not created yet.</div>;

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
                            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">{agreementData.jobTitle}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <p className="text-xs font-bold text-slate-500 underline underline-offset-4 decoration-slate-200">
                                    Contract with {agreementData.seekerName}
                                </p>
                                {agreementData.employerName && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <p className="text-xs font-bold text-slate-500">
                                            Employer: {agreementData.employerName}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-3 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-white hover:shadow-lg transition-all text-slate-400 hover:text-brand-navy">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-white hover:shadow-lg transition-all text-slate-400">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 mt-10">
                {/* Workflow Viz */}
                <StatusTimeline currentStatus={agreementData.status} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <WorkDetails
                            data={agreementData.work}
                            isEditing={agreementData.status === 'Selected'}
                            onUpdate={(workData) => setAgreementData(prev => ({ ...prev, work: workData }))}
                        />
                        <TermsSection
                            terms={agreementData.terms}
                            isEditing={agreementData.status === 'Selected'}
                            onUpdate={(terms) => setAgreementData(prev => ({ ...prev, terms }))}
                            checked={isTermsAccepted}
                            onChange={setIsTermsAccepted}
                            readOnly={agreementData.status !== 'Selected'}
                        />

                        {/* Submitted Work Display */}
                        {(agreementData.status === 'Submitted' || agreementData.status === 'Payment Released' || agreementData.status === 'Completed') && (
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8">
                                <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" /> Work Submitted
                                </h3>
                                {(agreementData.submission?.notes || agreementData.submission?.attachment) ? (
                                    <div className="space-y-4">
                                        {agreementData.submission.notes && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase">Notes from Seeker:</p>
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
                        <PaymentDetails
                            data={agreementData.payment}
                            isEditing={agreementData.status === 'Selected'}
                            onUpdate={(paymentData) => setAgreementData(prev => ({ ...prev, payment: paymentData }))}
                        />

                        {/* Summary Card */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            {agreementData.status !== 'Completed' && (
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Required Actions</h4>
                            )}
                            <ActionButtons
                                role="provider"
                                status={agreementData.status}
                                agreementId={agreementId}
                                onAction={handleAction}
                                disabled={agreementData.status === 'Selected' && !isTermsAccepted}
                            />
                            {agreementData.status === 'Selected' && !isTermsAccepted && (
                                <p className="text-[9px] text-red-400 font-bold mt-3 text-center uppercase tracking-tighter italic">
                                    Please accept terms to send agreement
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProviderAgreement;