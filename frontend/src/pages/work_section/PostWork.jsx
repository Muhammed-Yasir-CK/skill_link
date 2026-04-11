import React, { useState } from 'react';
import {
    Briefcase,
    FileText,
    DollarSign,
    MapPin,
    CheckCircle,
    ChevronRight,
    Search,
    X,
    XCircle,
    Globe,
    Monitor,
    Wrench,
    Clock,
    Layout
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/api/axios';
import Notification from '@/components/Notification';
const PostWork = () => {
    // ---- 1. State Management ----
    const [activeSection, setActiveSection] = useState(0);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState({
        isVisible: false,
        type: 'success',
        message: ''
    });

    const hideNotification = () => setNotification(prev => ({ ...prev, isVisible: false }));

    const [formData, setFormData] = useState({
        // Step 1: Classification
        workNature: '', // 'Professional' or 'Local'

        // Step 2: Category
        category: '',

        // Step 3: Common Basics
        title: '',
        description: '',
        urgency: 'Flexible',

        // Payment
        paymentType: 'Fixed',
        budgetMin: '',
        budgetMax: '',
        currency: 'USD',

        // Visibility
        contactMethod: 'Chat', // 'Chat' or 'Phone'
        showProfile: true, // Show name/anonymous

        // --- Dynamic Fields ---

        // Professional Specific
        skills: [],
        currentSkill: '',
        experienceLevel: 'Intermediate',
        portfolioRequired: false,
        keywords: [], // Can be deliverables or extra tags
        professionalDuration: '1-4 weeks',
        deliverables: '', // Added for "Deliverables" text area or selection

        // Local Specific
        city: '',
        area: '',
        pincode: '',
        distancePreference: '5km',
        workLocationType: 'Home', // Home, Office, Site, Shop
        toolsProvidedBy: 'Worker',
        localTimeEstimate: 'Half Day',
        preferredDate: '',
        preferredTimeSlot: '',
        certificationRequired: false
    });

    // ---- 2. Helpers & Constants ----

    // Step 1 Constants
    const WORK_NATURES = [
        { id: 'Professional', label: 'Professional / Digital Work', icon: Monitor, desc: 'Software, Design, Writing, Admin...' },
        { id: 'Local', label: 'Local / Physical Work', icon: Wrench, desc: 'Plumbing, Electrical, Cleaning, Repair...' }
    ];

    // Step 2 Constants (Categories)
    const PROFESSIONAL_CATEGORIES = ['Software Development', 'Design', 'Writing / Content', 'Marketing', 'Data / Admin', 'Other Digital Work'];
    const LOCAL_CATEGORIES = ['Plumbing', 'Electrical', 'CCTV / Hardware', 'Cleaning', 'Painting', 'Repair', 'Delivery', 'Other Local Work'];

    // Wizard Sections Definition
    const SECTIONS = [
        { id: 'classify', label: 'Classify', icon: Layout },
        { id: 'basics', label: 'Basics', icon: FileText },
        { id: 'details', label: 'Details', icon: Briefcase }, // Dynamic based on Nature
        { id: 'payment', label: 'Payment', icon: DollarSign },
        { id: 'review', label: 'Review', icon: CheckCircle }
    ];


    const transformData = () => ({
        work_nature: formData.workNature,
        category: formData.category,
        title: formData.title.trim(),
        description: formData.description.trim(),
        urgency: formData.urgency,

        skills: formData.skills,
        experience_level: formData.experienceLevel,
        portfolio_required: formData.portfolioRequired,
        deliverables: formData.deliverables,
        professional_duration: formData.professionalDuration,

        city: formData.city,
        area: formData.area,
        pincode: formData.pincode,
        distance_preference: formData.distancePreference,
        work_location_type: formData.workLocationType,
        tools_provided_by: formData.toolsProvidedBy,
        local_time_estimate: formData.localTimeEstimate,
        preferred_date: formData.preferredDate || null,
        preferred_time_slot: formData.preferredTimeSlot || null,
        certification_required: formData.certificationRequired,

        payment_type: formData.paymentType,
        budget_min: formData.budgetMin || null,
        budget_max: formData.budgetMax || null,
        currency: formData.currency,

        keywords: formData.keywords,


        contact_method: formData.contactMethod,
        show_profile: formData.showProfile


        });

    // ---- 3. Handlers ----

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear errors
        if (errors[name] || errors.form) {
            setErrors(prev => ({ ...prev, [name]: '', form: '' }));
        }
    };

    // const handleNatureSelect = (nature) => {
    //     setFormData(prev => ({ ...prev, workNature: nature, category: '' }));
    //     setErrors({});
    // };

    const handleNatureSelect = (nature) => {
        setFormData(prev => ({
            ...prev,
            workNature: nature,
            category: '',
            skills: nature === 'Professional' ? prev.skills : [],
            city: nature === 'Local' ? prev.city : '',
            area: nature === 'Local' ? prev.area : '',
        }));
        setErrors({});
    };


    const handleSkillAdd = (e) => {
        if (e.key === 'Enter' && formData.currentSkill.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(formData.currentSkill.trim())) {
                setFormData(prev => ({
                    ...prev,
                    skills: [...prev.skills, prev.currentSkill.trim()],
                    currentSkill: ''
                }));
            }
        }
    };

    const removeSkill = (skill) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    // ---- 4. Validation ----

    const validateStep = (step) => {
        const newErrors = {};
        let isValid = true;

        // Step 0: Classify & Category
        if (step === 0) {
            if (!formData.workNature) newErrors.workNature = true;
            if (!formData.category) newErrors.category = true;
            if (!formData.workNature || !formData.category) {
                isValid = false;
                setErrors({ form: 'Please select both work nature and category.' });
            }
        }

        // Step 1: Basics
        if (step === 1) {
            if (!formData.title.trim()) newErrors.title = true;
            if (!formData.description.trim()) newErrors.description = true;
            if (Object.keys(newErrors).length > 0) {
                isValid = false;
                setErrors({ form: 'Title and description are required.' });
            }
        }

        // Step 2: Dynamic Details
        if (step === 2) {
            if (formData.workNature === 'Local') {
                if (!formData.city.trim()) newErrors.city = true;
                if (!formData.area.trim()) newErrors.area = true;
                if (!formData.pincode.trim()) newErrors.pincode = true;
                if (!formData.preferredDate) newErrors.preferredDate = true;

                if (Object.keys(newErrors).length > 0) {
                    isValid = false;
                    setErrors({ form: 'Please fill in all mandatory location and schedule details.' });
                }
            }
            // For Professional, we might enforce skills, but keeping it flexible for now
            if (formData.workNature === 'Professional') {
                if (formData.skills.length === 0) {
                    newErrors.skills = true;
                    isValid = false;
                    setErrors({ form: 'Please add at least one required skill.' });
                    }
                }
        }
        if (step === 3) {
            if (
                formData.budgetMin &&
                formData.budgetMax &&
                Number(formData.budgetMax) < Number(formData.budgetMin)
            ) {
                setErrors({ form: "Maximum budget must be greater than minimum budget." });
                return false;
            }
        }


        // Step 3: Payment (Optional but good to check specifics if needed)
        // Kept open for flexibility

        return isValid;
    };

    // const handleNext =async () => {
    //     if (validateStep(activeSection)) {
    //         if (activeSection < SECTIONS.length - 1) {
    //             setActiveSection(prev => prev + 1);
    //             window.scrollTo(0, 0);
    //         } else {
    //             console.log('Submitting:', formData);
    //             await api.post('/work-posts/', transformData());
    //             alert('Work Posted Successfully!');
    //         }
    //     }
    // };

    const handleBack = () => {
        setActiveSection(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleNext = async () => {
        if (!validateStep(activeSection)) return;

        if (activeSection < SECTIONS.length - 1) {
            setActiveSection(prev => prev + 1);
            window.scrollTo(0, 0);
            return;
        }

        try {
            setSubmitting(true);

            await api.post('/work-posts/', transformData());


            setNotification({
                isVisible: true,
                type: 'success',
                message: 'Work Posted Successfully!'
            });
            setTimeout(() => {
                window.location.href = "/work-dashboard";
            }, 2000);
        } catch (error) {
            setErrors({ form: "Something went wrong. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };


    // ---- 5. Render Components ----

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            <Notification 
                {...notification}
                onClose={hideNotification}
            />
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Post New Work</h2>
                <p className="text-slate-500 mt-2">Classify your need and find the perfect match.</p>
            </div>

            {/* Stepper */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 p-4 md:p-6 overflow-x-auto">
                    <div className="flex items-center justify-between min-w-max md:min-w-0">
                        {SECTIONS.map((section, index) => (
                            <div key={section.id} className="flex items-center">
                                <div className={`flex flex-col items-center gap-2 ${index <= activeSection ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${index <= activeSection
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'bg-white border-slate-300'
                                        }`}>
                                        <section.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">{section.label}</span>
                                </div>
                                {index < SECTIONS.length - 1 && (
                                    <div className={`w-12 h-0.5 mx-4 ${index < activeSection ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <form className="p-6 md:p-10 space-y-8">

                    {/* --- STEP 1: CLASSIFY & CATEGORY --- */}
                    {activeSection === 0 && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4">1. What is the nature of the work?</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {WORK_NATURES.map(nature => (
                                        <button
                                            key={nature.id}
                                            type="button"
                                            onClick={() => handleNatureSelect(nature.id)}
                                            className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.workNature === nature.id
                                                ? 'border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-600'
                                                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className={`p-3 rounded-full ${formData.workNature === nature.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    <nature.icon className="w-6 h-6" />
                                                </div>
                                                <span className={`font-bold text-lg ${formData.workNature === nature.id ? 'text-indigo-900' : 'text-slate-700'}`}>{nature.label}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 pl-[4.5rem]">{nature.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.workNature && (
                                <div className="animate-fade-in">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">2. Select a Category</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {(formData.workNature === 'Professional' ? PROFESSIONAL_CATEGORIES : LOCAL_CATEGORIES).map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                                                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${formData.category === cat
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- STEP 2: COMMON BASICS --- */}
                    {activeSection === 1 && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-600" /> Work Basics
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Work Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder={formData.workNature === 'Professional' ? "e.g. Build a React E-commerce Site" : "e.g. Broken Kitchen Sink Pipe Repair"}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Short Description *</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={5}
                                        placeholder="Describe exactly what needs to be done..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Urgency</label>
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        {['Immediate', 'Flexible', 'Scheduled'].map(opt => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, urgency: opt }))}
                                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${formData.urgency === opt
                                                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                                                    : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- STEP 3: DYNAMIC DETAILS --- */}
                    {activeSection === 2 && (
                        <div className="animate-fade-in space-y-8">
                            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-indigo-600" />
                                {formData.workNature === 'Professional' ? 'Professional Requirements' : 'Location & Execution'}
                            </h3>

                            {/* === 3A: PROFESSIONAL FIELDS === */}
                            {formData.workNature === 'Professional' && (
                                <div className="space-y-6">
                                    {/* Skills (Tags) */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Required Skills *</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="currentSkill"
                                                value={formData.currentSkill}
                                                onChange={handleInputChange}
                                                onKeyDown={handleSkillAdd}
                                                placeholder="Type skill & press Enter (e.g. React, SEO, Logo Design)"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                                            />
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {formData.skills.map((skill, i) => (
                                                <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-full flex items-center gap-2 border border-indigo-100">
                                                    {skill}
                                                    <button onClick={() => removeSkill(skill)} type="button" className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Experience Level</label>
                                            <select
                                                name="experienceLevel"
                                                value={formData.experienceLevel}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 bg-white"
                                            >
                                                <option>Beginner</option>
                                                <option>Intermediate</option>
                                                <option>Experienced</option>
                                                <option>Expert</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Check previous work?</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer flex-1 justify-center hover:bg-slate-50">
                                                    <input type="checkbox" checked={formData.portfolioRequired}
                                                        onChange={(e) =>
                                                        setFormData(prev => ({
                                                        ...prev,
                                                        portfolioRequired: e.target.checked
                                                        }))
                                                        } />
                                                    <span className="font-medium text-slate-700">Require Portfolio</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Deliverables</label>
                                        <input
                                            type="text"
                                            name="deliverables"
                                            value={formData.deliverables}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Source code, Design files, 500-word article"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Work Mode</label>
                                        <div className="bg-slate-100 p-2 rounded-xl text-center text-slate-600 text-sm font-medium">
                                            Professional work is set to <strong className="text-indigo-600">Remote</strong> by default.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* === 3B: LOCAL FIELDS === */}
                            {formData.workNature === 'Local' && (
                                <div className="space-y-8 animate-fade-in">
                                    {/* Location */}
                                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50 space-y-4">
                                        <h4 className="font-bold text-indigo-900 flex items-center gap-2 text-sm uppercase tracking-wide">
                                            <MapPin className="w-4 h-4" /> Location Details
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City *</label>
                                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" placeholder="e.g. New York" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Area / Locality *</label>
                                                <input type="text" name="area" value={formData.area} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" placeholder="e.g. Brooklyn" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pincode *</label>
                                                <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" placeholder="11001" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Distance Preference</label>
                                                <select name="distancePreference" value={formData.distancePreference} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 bg-white">
                                                    <option value="3km">Within 3 km</option>
                                                    <option value="5km">Within 5 km</option>
                                                    <option value="10km">Within 10 km</option>
                                                    <option value="20km">Within 20 km (City wide)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Execution Details */}
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Work Location Type</label>
                                                <select name="workLocationType" value={formData.workLocationType} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 bg-white">
                                                    <option>Home</option>
                                                    <option>Office</option>
                                                    <option>Shop</option>
                                                    <option>Construction Site</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Tools provided by?</label>
                                                <select name="toolsProvidedBy" value={formData.toolsProvidedBy} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 bg-white">
                                                    <option value="Worker">Worker (Bring their own)</option>
                                                    <option value="Me">Me (I have tools)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Estimated Time</label>
                                                <select name="localTimeEstimate" value={formData.localTimeEstimate} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 bg-white">
                                                    <option>1-2 Hours</option>
                                                    <option>Half Day (4 hrs)</option>
                                                    <option>Full Day (8 hrs)</option>
                                                    <option>Multiple Days</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Date *</label>
                                                <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-slate-700" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Time Slot</label>
                                                <input type="time" name="preferredTimeSlot" value={formData.preferredTimeSlot} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-slate-700" />
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                                            <div>
                                                <span className="block font-bold text-slate-900 text-sm">Certification Required?</span>
                                                <span className="text-xs text-slate-500">Ask for professional ID/License</span>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={formData.certificationRequired} onChange={(e) => setFormData(prev => ({ ...prev, certificationRequired: e.target.checked }))} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {/* --- STEP 4: PAYMENT --- */}
                    {activeSection === 3 && (
                        <div className="animate-fade-in space-y-8">
                            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-indigo-600" /> Payment & Budget
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Payment Type</label>
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        {['Fixed', 'Hourly'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, paymentType: type }))}
                                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${formData.paymentType === type
                                                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                                                    : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Currency</label>
                                        <select
                                            name="currency"
                                            value={formData.currency}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 bg-white"
                                        >
                                            <option>USD</option>
                                            <option>EUR</option>
                                            <option>GBP</option>
                                            <option>INR</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Budget (Min)</label>
                                        <input type="number" name="budgetMin" value={formData.budgetMin} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"  />
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Budget (Max)</label>
                                        <input type="number" name="budgetMax" value={formData.budgetMax} onChange={handleInputChange} placeholder="1000" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- STEP 5: REVIEW --- */}
                    {activeSection === 4 && (
                        <div className="animate-fade-in space-y-8">
                            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-indigo-600" /> Review & Post
                            </h3>

                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900">{formData.title}</h4>
                                        <p className="text-slate-600 text-sm mt-1">{formData.description}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${formData.workNature === 'Professional' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {formData.workNature}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-slate-200">
                                    <div>
                                        <span className="block text-slate-500 text-xs uppercase font-bold">Category</span>
                                        <span className="font-medium text-slate-900">{formData.category}</span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-500 text-xs uppercase font-bold">Budget</span>
                                        <span className="font-medium text-slate-900">{formData.currency} {formData.budgetMax || 'N/A'} ({formData.paymentType})</span>
                                    </div>
                                    {formData.workNature === 'Local' && (
                                        <div className="col-span-2">
                                            <span className="block text-slate-500 text-xs uppercase font-bold">Location</span>
                                            <span className="font-medium text-slate-900 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {formData.city}, {formData.area} ({formData.pincode})
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div>
                                        <span className="block font-bold text-slate-900">Contact via Chat</span>
                                        <span className="text-xs text-slate-500">Workers will message you on the platform</span>
                                    </div>
                                    <input type="radio" checked readOnly className="w-5 h-5 text-indigo-600" />
                                </label>
                            </div>
                        </div>
                    )}


                    {/* --- NAVIGATION --- */}
                    <div className="pt-8 border-t border-slate-100">
                        {errors.form && (
                            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm font-bold flex items-center gap-2 animate-bounce">
                                <XCircle className="w-4 h-4" /> {errors.form}
                            </div>
                        )}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            {activeSection > 0 ? (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="w-full md:w-auto px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Back
                                </button>
                            ) : (
                                <Link to="/work-dashboard" className="w-full md:w-auto px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-center">
                                    Cancel
                                </Link>
                            )}

                            {activeSection < SECTIONS.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                                >
                                    Next Step <ChevronRight className="w-5 h-5" />
                                </button>
                            ) : (
                                // <button
                                //     type="button"
                                //     onClick={handleNext}
                                //     className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                                // >
                                //     Post Work Now <CheckCircle className="w-5 h-5" />
                                // </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={submitting}
                                    className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2
                                        ${submitting
                                            ? "bg-indigo-400 cursor-not-allowed"
                                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                                        }`}
                                >
                                    {submitting ? "Posting..." : "Post Work Now"}
                                    {!submitting && <CheckCircle className="w-5 h-5" />}
                                </button>
                            )}
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PostWork;
