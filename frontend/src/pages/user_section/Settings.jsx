import React, { useState, useEffect } from 'react';
import {
    User,
    Shield,
    Wallet,
    Copy,
    Link,
    Activity,
    History,
    AlertTriangle,
    MapPin,
    Smartphone,
    Mail,
    Briefcase,
    Clock,
    Lock,
    FileText,
    Award,
    Upload,
    X,
    Plus,
    CheckCircle
} from 'lucide-react';
import Notification from "../../components/Notification";
import WalletSettings from './components/WalletSettings';

const API_BASE = "http://localhost:8000/api/accounts";

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("access")}`
});




const Settings = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const sections = [
        { id: 'personal', label: 'Personal Information', icon: User },
        { id: 'security', label: 'Account Security', icon: Shield },
        { id: 'payment', label: 'Payment Settings', icon: Wallet },
    ];

    // ---- Constants ----
    const PROFESSIONS = [
        'Software Engineer', 'Designer', 'Data Entry Operator', 'Tutor',
        'Electrician', 'Plumber', 'Carpenter', 'Painter',
        'Delivery Executive', 'Driver', 'Construction Worker', 'Cleaner',
        'Freelance Worker', 'Daily Wage Worker', 'Other'
    ];

    const TRAVEL_OPTIONS = ['Within city', 'Nearby districts', 'Anywhere'];
    const AVAILABILITY_OPTIONS = ['Available now', 'Available part-time', 'Available on weekends', 'Not available currently'];
    const EXPERIENCE_OPTIONS = ['Fresher', '1–3 years', '3–5 years', '5+ years', 'Not applicable'];
    const WORK_MODES = ['Onsite', 'Hybrid', 'Remote'];

    const [notification, setNotification] = useState({
        isVisible: false,
        type: "success",
        message: ""
    });




    const [userData, setUserData] = useState({
        profile_picture: null,
        full_name: "",
        email: "",
        mobile: "",
        profession: "",
        other_profession: "",

        country: "",
        state: "",
        city: "",
        area: "",
        pincode: "",

        location: "",
        travel_willingness: "",
        availability_status: "",
        work_modes: [],

        experience_level: "",
        skills: [],
        newSkill: "",
        //new 
        resume: null,
        workProof: null,

        education: {
            qualification: "",
            institution: "",
            year: ""
        },

        summary: ""
    });

    const [profileImageFile, setProfileImageFile] = useState(null);

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Mock Blockchain & Payment Data State (Preserved)
    const [paymentSettings, setPaymentSettings] = useState({
        walletAddress: '',
        network: 'Unknown',
        isConnected: false,
        paymentMode: 'Escrow',
        autoRelease: false,
        preferredToken: 'USDT',
        feePayer: 'Employer',
        balance: '0.00',
        escrowLocked: '0.00',
        totalEarned: '0.00'
    });

    // ---- Handlers ----

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordSubmit = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setNotification({ isVisible: true, type: "error", message: "New passwords do not match" });
            return;
        }
        if (passwordData.newPassword.length < 8) {
            setNotification({ isVisible: true, type: "error", message: "New password must be at least 8 characters" });
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/change-password/`, {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    old_password: passwordData.oldPassword,
                    new_password: passwordData.newPassword
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.old_password?.[0] || errorData.new_password?.[0] || "Failed to update password");
            }

            setNotification({ isVisible: true, type: "success", message: "Password updated successfully" });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setNotification({ isVisible: true, type: "error", message: err.message });
        }
    };

    const handleEducationChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            education: { ...prev.education, [name]: value }
        }));
    };


    useEffect(() => {
        const loadProfile = async () => {
            try {


                const res = await fetch(`${API_BASE}/seeker/profile/`, {
                    headers: getAuthHeaders()
                });

                if (!res.ok) return;

                const data = await res.json();

                setUserData(prev => ({
                    ...prev,
                    ...data,
                    profile_picture: data.profile_picture,
                    resume: data.resume || null,
                    workProof: data.work_proof || null,
                    work_modes: Array.isArray(data.work_modes) ? data.work_modes : [],
                    skills: Array.isArray(data.skills) ? data.skills : [],
                    education: {
                        qualification: data.qualification || '',
                        institution: data.institution || '',
                        year: data.year || ''
                    }
                }));

                if (data.wallet_address) {
                    setPaymentSettings(prev => ({
                        ...prev,
                        walletAddress: data.wallet_address,
                        isConnected: true
                    }));

                    if (window.ethereum) {
                        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                        const networkName = chainId === '0x89' ? 'Polygon Mainnet' : chainId === '0x13881' ? 'Polygon Mumbai' : 'Unknown Network';
                        setPaymentSettings(prev => ({ ...prev, network: networkName }));
                    }
                }
            } catch (err) {
                console.error("Profile load failed", err);
            }
        };

        loadProfile();

        if (window.ethereum) {
            const handleChainChanged = (chainId) => {
                const networkName = chainId === '0x89' ? 'Polygon Mainnet' : chainId === '0x13881' ? 'Polygon Mumbai' : 'Unknown Network';
                setPaymentSettings(prev => ({ ...prev, network: networkName }));
            };
            window.ethereum.on('chainChanged', handleChainChanged);
            return () => window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
    }, []);



    const toggleWorkMode = (mode) => {
        setUserData(prev => {
            const current = prev.work_modes;
            if (current.includes(mode)) {
                return { ...prev, work_modes: current.filter(m => m !== mode) };
            } else {
                return { ...prev, work_modes: [...current, mode] };
            }
        });
    };

    const addSkill = (e) => {
        if (e.key === 'Enter' && userData.newSkill.trim()) {
            e.preventDefault();
            if (!userData.skills.includes(userData.newSkill.trim())) {
                setUserData(prev => ({
                    ...prev,
                    skills: [...prev.skills, prev.newSkill.trim()],
                    newSkill: ''
                }));
            }
        }
    };

    const removeSkill = (skillToRemove) => {
        setUserData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };


    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setUserData(prev => ({
                ...prev,
                [field]: file.name
            }));
        }
    };

    // Check if education/resume should be emphasized based on profession
    const isProfessionalRole = ['Software Engineer', 'Designer', 'Data Entry Operator', 'Tutor', 'Other'].includes(userData.profession);


    const saveProfile = async () => {
        try {
            const formData = new FormData();

            Object.entries({
                full_name: userData.full_name,
                mobile: userData.mobile,
                profession: userData.profession,
                other_profession: userData.other_profession,
                country: userData.country,
                state: userData.state,
                city: userData.city,
                area: userData.area,
                pincode: userData.pincode,
                location: userData.location,
                travel_willingness: userData.travel_willingness,
                availability_status: userData.availability_status,
                experience_level: userData.experience_level,
                summary: userData.summary,
                qualification: userData.education.qualification,
                institution: userData.education.institution,
                year: userData.education.year,
            }).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            userData.work_modes.forEach(mode =>
                formData.append("work_modes", mode)
            );

            userData.skills.forEach(skill =>
                formData.append("skills", skill)
            );

            if (profileImageFile) {
                formData.append("profile_picture", profileImageFile);
            }

            const res = await fetch(`${API_BASE}/seeker/profile/`, {
                method: "PATCH",
                headers: getAuthHeaders(), // NO content-type here
                body: formData
            });

            if (!res.ok) throw new Error();

            const data = await res.json();
            setUserData(prev => ({
                ...prev,
                profile_picture: data.profile_picture
            }));

            // alert("Profile saved successfully");
            setNotification({
                isVisible: true,
                type: "success",
                message: "Profile saved successfully"
            });
            window.location.reload();
        } catch {
            // alert("Failed to save profile");
            setNotification({
                isVisible: true,
                type: "error",
                message: "Failed to save profile"
            });
        }
    };



    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // optional validation
        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setNotification({
                isVisible: true,
                type: "error",
                message: "Only JPG or PNG allowed"
            });
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setNotification({
                isVisible: true,
                type: "error",
                message: "Max file size is 2MB"
            });
            return;
        }

        setProfileImageFile(file);

        // preview immediately
        const previewUrl = URL.createObjectURL(file);
        setUserData(prev => ({
            ...prev,
            profile_picture: previewUrl
        }));


    };


    // const uploadDocument = async (file, type) => {
    //     if (!file) return;

    //     const formData = new FormData();
    //     formData.append("document_type", type);
    //     formData.append("file", file);

    //     try {
    //         const res = await fetch(`${API_BASE}/seeker/documents/`, {
    //         method: "POST",
    //         headers: getAuthHeaders(),
    //         body: formData
    //         });

    //         if (!res.ok) throw new Error("Upload failed");

    //         alert(`${type} uploaded successfully`);
    //     } catch (err) {
    //         console.error(err);
    //         alert("Upload failed");
    //     }
    //  };


    const uploadDocument = async (file, type) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("document_type", type);
        formData.append("file", file);

        try {
            const res = await fetch(`${API_BASE}/seeker/documents/`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: formData
            });

            if (!res.ok) throw new Error("Upload failed");

            // Update state to show tick mark
            if (type === "resume") {
                setUserData(prev => ({ ...prev, resume: file.name }));
            } else if (type === "work_proof") {
                setUserData(prev => ({ ...prev, workProof: file.name }));
            }

            setNotification({
                isVisible: true,
                type: "success",
                message: `${type === "resume" ? "Resume" : "Work Proof"} uploaded successfully`
            });
        } catch (err) {
            console.error(err);
            setNotification({
                isVisible: true,
                type: "error",
                message: "Upload failed"
            });
        }
    };




    return (
        <div className="animate-fade-in pb-20">
            <Notification
                type={notification.type}
                message={notification.message}
                isVisible={notification.isVisible}
                onClose={() =>
                    setNotification(prev => ({
                        ...prev,
                        isVisible: false
                    }))
                }
            />
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Settings</h2>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Panel: Navigation */}
                <aside className="w-full lg:w-64 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit flex-shrink-0">
                    <nav className="flex flex-col p-2">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveTab(section.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === section.id
                                    ? 'bg-brand-navy text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-brand-navy'
                                    }`}
                            >
                                <section.icon className={`w-4 h-4 ${activeTab === section.id ? 'text-brand-accent' : 'text-slate-400'}`} />
                                {section.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Right Panel: Content */}
                <main className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 min-w-0">

                    {/* 1. PERSONAL INFORMATION (UNIFIED PROFILE MODEL) */}
                    {activeTab === 'personal' && (
                        <div className="space-y-10 animate-fade-in">

                            {/* A. Basic Profile Information */}
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                    <User className="w-5 h-5 text-indigo-600" /> Basic Profile Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-full flex items-center gap-6">
                                        {/* <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-3xl font-bold border-2 border-dashed border-slate-300 flex-shrink-0 relative overflow-hidden group hover:border-indigo-500 hover:text-indigo-500 transition-colors cursor-pointer">
                                            {userData.full_name[0]}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Upload className="w-6 h-6 text-white" />
                                            </div>
                                        </div> */}
                                        <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden relative">
                                            {userData.profile_picture ? (
                                                <img
                                                    src={userData.profile_picture}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="flex items-center justify-center w-full h-full text-3xl font-bold text-slate-400">
                                                    {userData.full_name?.[0]}
                                                </span>
                                            )}

                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                id="profilePicInput"
                                                onChange={handleProfileImageChange}
                                            />
                                        </div>


                                        <div>
                                            <h4 className="font-bold text-slate-900">Profile Photo</h4>
                                            <p className="text-xs text-slate-500 mb-2">JPG or PNG. Max 2MB.</p>
                                            <button
                                                onClick={() => document.getElementById("profilePicInput").click()}
                                                className="text-sm text-indigo-600 font-bold hover:underline"
                                            >
                                                Upload New
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name *</label>
                                        <input type="text" name="full_name" value={userData.full_name} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none font-medium text-slate-900" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number *</label>
                                        <div className="flex items-center gap-2 relative">
                                            <input type="text" name="mobile" value={userData.mobile} onChange={handleInputChange} className="w-full px-4 py-2.5 pl-10 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none font-medium text-slate-900" />
                                            <Smartphone className="w-4 h-4 text-slate-400 absolute left-3" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                                        <div className="flex items-center gap-2 relative">
                                            <input type="email" value={userData.email} readOnly className="w-full px-4 py-2.5 pl-10 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed" />
                                            <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Profession / Work Type *</label>
                                        <select name="profession" value={userData.profession} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 font-medium text-slate-900">
                                            {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        {userData.profession === 'Other' && (
                                            <input type="text" name="other_profession" placeholder="Specify your profession" value={userData.other_profession} onChange={handleInputChange} className="mt-2 w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none font-medium text-slate-900" />
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* B. Location & Availability */}
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-indigo-600" /> Current Location & Availability
                                </h3>

                                {/* Residential Location Input (New) */}
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                                    <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400" /> Current Residential Address
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Country</label>
                                            <select name="country" value={userData.country} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 font-medium text-slate-900">
                                                <option>India</option>
                                                <option>USA</option>
                                                <option>UK</option>
                                                <option>UAE</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">State</label>
                                            <input type="text" name="state" value={userData.state} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none font-medium text-slate-900" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                                            <input type="text" name="city" value={userData.city} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none font-medium text-slate-900" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Area / Locality</label>
                                            <input type="text" name="area" value={userData.area} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none font-medium text-slate-900" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pincode</label>
                                            <input type="text" name="pincode" value={userData.pincode} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none font-medium text-slate-900" />
                                        </div>
                                    </div>
                                </div>

                                {/* Work Availability (Existing) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Central Work Location *</label>
                                        <input type="text" name="location" value={userData.location} onChange={handleInputChange} placeholder="City, Area" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none font-medium text-slate-900" />
                                        <p className="text-xs text-slate-400 mt-1">Primary area where you are available.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Willingness to Travel</label>
                                        <select name="travel_willingness" value={userData.travel_willingness} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 font-medium text-slate-900">
                                            {TRAVEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preferred Work Mode</label>
                                        <div className="flex flex-wrap gap-2">
                                            {WORK_MODES.map(mode => (
                                                <button
                                                    key={mode}
                                                    onClick={() => toggleWorkMode(mode)}
                                                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${userData.work_modes.includes(mode) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Availability Status</label>
                                        <select name="availability_status" value={userData.availability_status} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 font-medium text-slate-900">
                                            {AVAILABILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* C. Professional Details */}
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-indigo-600" /> Professional Details
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Experience Level</label>
                                        <select name="experience_level" value={userData.experience_level} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 font-medium text-slate-900">
                                            {EXPERIENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Skills *</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {userData.skills.map((skill, i) => (
                                                <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 border border-indigo-100">
                                                    {skill}
                                                    <button onClick={() => removeSkill(skill)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                name="newSkill"
                                                value={userData.newSkill}
                                                onChange={handleInputChange}
                                                onKeyDown={addSkill}
                                                placeholder="Add a skill (e.g. Piping, React, Driving)"
                                                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none font-medium text-slate-900"
                                            />
                                            <button onClick={() => { if (userData.newSkill) { addSkill({ key: 'Enter', preventDefault: () => { } }) } }} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 rounded-lg font-bold border border-slate-200 transition-colors">
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Education - Optional / Context Aware */}
                                    <div className={`border rounded-xl p-6 ${isProfessionalRole ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200/60'}`}>
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
                                            <span>Education Background</span>
                                            <span className="text-xs font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">Optional</span>
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="flex flex-col">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Highest Qualification</label>
                                                <input type="text" name="qualification" value={userData.education.qualification} onChange={handleEducationChange} placeholder="e.g. B.Tech, Diploma, 12th" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium" />
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Institution Name</label>
                                                <input type="text" name="institution" value={userData.education.institution} onChange={handleEducationChange} placeholder="University / School" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium" />
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Year</label>
                                                <input type="text" name="year" value={userData.education.year} onChange={handleEducationChange} placeholder="2023" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* D. Resume / Work Proof */}
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-600" /> Resume & Work Proof
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Resume */}
                                    {/* <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer group text-center">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-100">
                                            <FileText className="w-6 h-6" /> */}
                                    <div
                                        onClick={() => document.getElementById("resumeUpload").click()}
                                        className={`border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer group text-center ${userData.resume ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${userData.resume ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
                                            {userData.resume ? <CheckCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}

                                        </div>
                                        <h4 className="font-bold text-slate-900">Upload Resume</h4>
                                        <p className="text-xs text-slate-500 mt-1 mb-4">PDF only. Recommended for professional roles.</p>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            hidden
                                            id="resumeUpload"
                                            onChange={(e) => uploadDocument(e.target.files[0], "resume")}
                                            onClick={(e) => e.stopPropagation()}
                                        />

                                        {/* <button
                                            onClick={() => document.getElementById("resumeUpload").click()}
                                            className="text-sm bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold"
                                            >
                                            Choose File
                                            </button> */}
                                        <button
                                            className={`text-sm border px-4 py-2 rounded-lg font-bold shadow-sm ${userData.resume ? 'bg-white text-emerald-600 border-emerald-200' : 'bg-white border-slate-200 text-slate-600 group-hover:text-indigo-600 group-hover:border-indigo-200'}`}
                                        >
                                            {userData.resume ? 'Change File' : 'Choose File'}
                                        </button>

                                    </div>

                                    {/* Work Proof */}
                                    {/* <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer group text-center">
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-100">
                                            <Award className="w-6 h-6" /> */}
                                    <div
                                        onClick={() => document.getElementById("proofUpload").click()}
                                        className={`border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer group text-center ${userData.workProof ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${userData.workProof ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}`}>
                                            {userData.workProof ? <CheckCircle className="w-6 h-6" /> : <Award className="w-6 h-6" />}

                                        </div>
                                        <h4 className="font-bold text-slate-900">Work Proof / Certificates</h4>
                                        <p className="text-xs text-slate-500 mt-1 mb-4">Images or PDF. Trade certs, portfolio, etc.</p>
                                        <input
                                            type="file"
                                            hidden
                                            id="proofUpload"
                                            onChange={(e) => uploadDocument(e.target.files[0], "work_proof")}
                                            onClick={(e) => e.stopPropagation()}
                                        />

                                        {/* <button
                                        onClick={() => document.getElementById("proofUpload").click()}
                                        className="text-sm bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold"
                                        >
                                        Choose File
                                        </button> */}
                                        <button
                                            className={`text-sm border px-4 py-2 rounded-lg font-bold shadow-sm ${userData.workProof ? 'bg-white text-emerald-600 border-emerald-200' : 'bg-white border-slate-200 text-slate-600 group-hover:text-emerald-600 group-hover:border-emerald-200'}`}
                                        >
                                            {userData.workProof ? 'Change File' : 'Choose File'}
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* E. About / Work Summary */}
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-600" /> Profile Summary
                                </h3>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Work Summary</label>
                                    <textarea
                                        name="summary"
                                        value={userData.summary}
                                        onChange={handleInputChange}
                                        rows={4}
                                        placeholder="Briefly describe who you are, what work you do, and what jobs you are looking for..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-slate-900"
                                    />
                                    <p className="text-xs text-slate-400 mt-2 text-right">0/300 characters</p>
                                </div>
                            </section>

                            <div className="flex justify-end pt-6 border-t border-slate-100">
                                <button
                                    onClick={saveProfile}
                                    className="bg-brand-navy hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-navy/20"
                                >
                                    Save Profile
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2. ACCOUNT SECURITY */}
                    {activeTab === 'security' && (
                        <div className="space-y-10 animate-fade-in">
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-indigo-600" /> Change Password
                                </h3>
                                <div className="max-w-md space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Password</label>
                                        <input 
                                            type="password" 
                                            name="oldPassword"
                                            value={passwordData.oldPassword} 
                                            onChange={handlePasswordInputChange} 
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" 
                                            placeholder="••••••••" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                                        <input 
                                            type="password" 
                                            name="newPassword"
                                            value={passwordData.newPassword} 
                                            onChange={handlePasswordInputChange} 
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" 
                                            placeholder="Min. 8 characters" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm New Password</label>
                                        <input 
                                            type="password" 
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword} 
                                            onChange={handlePasswordInputChange} 
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" 
                                            placeholder="Re-enter password" 
                                        />
                                    </div>
                                    <button 
                                        onClick={handlePasswordSubmit} 
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* 3. PAYMENT SETTINGS (Modularized) */}
                    {activeTab === 'payment' && (
                        <div className="space-y-10 animate-fade-in">
                            <WalletSettings
                                initialWalletAddress={userData.wallet_address}
                                onUpdate={(newAddress) => setUserData(prev => ({ ...prev, wallet_address: newAddress }))}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Settings;
