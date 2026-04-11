import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
    Briefcase,
    Monitor,
    Calendar,
    DollarSign,
    Clock,
    FileText,
    Globe,
    Shield,
    CheckCircle,
    ChevronRight,
    Search,
    X,
    UploadCloud,
    XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Notification from '../components/Notification';

const PostJob = () => {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        duration: '1-4 weeks',
        description: '',
        deliverables: '',
        responsibilities: '',
        tools: '',
        skills: [],
        currentSkill: '',
        experienceLevel: 'Intermediate',
        paymentType: 'Fixed Price',
        budgetMin: '',
        budgetMax: '',
        currency: 'USD',
        paymentMethod: 'Platform Escrow',
        startDate: '',
        completionTime: '',
        deadline: '',
        portfolioRequired: 'Yes',
        sampleWorkLink: '',
        language: 'English',
        visibility: 'Public'
    });

    const [notification, setNotification] = useState({
        isVisible: false,
        type: 'success',
        message: ''
    });

    const hideNotification = () => setNotification(prev => ({ ...prev, isVisible: false }));

    const [activeSection, setActiveSection] = useState(0);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name] || errors.form) {
            setErrors(prev => ({ ...prev, [name]: '', form: '' }));
        }
    };

    const validateStep = (step) => {
        const newErrors = {};
        let isValid = true;

        if (step === 0) {
            if (!formData.title.trim()) newErrors.title = true;
            if (!formData.category) newErrors.category = true;
            if (Object.keys(newErrors).length > 0) {
                isValid = false;
                setErrors({ form: 'Please fill in all required fields.' });
            }
        }

        if (step === 1) {
            if (!formData.description.trim()) {
                isValid = false;
                setErrors({ form: 'Project Description is required.' });
            }
        }

        if (step === 2) {
            // Basic validation for budget if needed, currently loose
            if (!formData.budgetMax && formData.paymentType === 'Fixed Price') {
                // specific logic if strictly required
            }
        }

        if (step === 3) {
            if (!formData.deadline) {
                isValid = false;
                setErrors({ form: 'Application deadline is required.' });
            }
        }

        return isValid;
    };

    const handleNext = () => {
        if (validateStep(activeSection)) {
            if (activeSection < sections.length - 1) {
                setActiveSection(prev => prev + 1);
            } else {
                // Submit logic here
                console.log('Submitting:', formData);
                setNotification({
                    isVisible: true,
                    type: 'success',
                    message: 'Job Posted Successfully! (Mock)'
                });
            }
        }
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

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const categories = [
        'Web Development',
        'Design',
        'Data / ML',
        'Writing',
        'Marketing',
        'Virtual Assistant',
        'Other'
    ];

    const sections = [
        { id: 'basic', label: 'Basic Info', icon: Briefcase },
        { id: 'details', label: 'Details', icon: FileText },
        { id: 'payment', label: 'Payment', icon: DollarSign },
        { id: 'finalize', label: 'Finalize', icon: CheckCircle }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Notification 
                {...notification}
                onClose={hideNotification}
            />
            <Header user={{ name: 'Muhammed Yasir', role: 'Job Seeker', email: 'yasir@example.com' }} />

            <div className="bg-brand-navy pt-16 pb-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Post a Freelance Gig</h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Connect with top talent for your remote projects. Fill in the details below to get started.
                    </p>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-20 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Progress Bar */}
                    <div className="bg-slate-50 border-b border-slate-200 p-4 md:p-6 overflow-x-auto">
                        <div className="flex items-center justify-between min-w-max md:min-w-0">
                            {sections.map((section, index) => (
                                <div key={section.id} className="flex items-center">
                                    <div className={`flex flex-col items-center gap-2 ${index <= activeSection ? 'text-brand-accent' : 'text-slate-400'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${index <= activeSection
                                            ? 'bg-brand-navy border-brand-accent text-brand-accent'
                                            : 'bg-white border-slate-300'
                                            }`}>
                                            <section.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider">{section.label}</span>
                                    </div>
                                    {index < sections.length - 1 && (
                                        <div className={`w-12 h-0.5 mx-4 ${index < activeSection ? 'bg-brand-accent' : 'bg-slate-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <form className="p-6 md:p-10 space-y-10">
                        {/* Section A: Basic Job Info */}
                        {activeSection === 0 && (
                            <section className="animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-brand-accent" /> Basic Job Info
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Gig Title *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g. React Developer needed for E-commerce Dashboard"
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Category *</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all font-medium text-slate-900 bg-white"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Remote Status</label>
                                        <div className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-medium flex items-center gap-2 cursor-not-allowed">
                                            <Globe className="w-4 h-4" />
                                            Remote Only
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Project Duration</label>
                                        <select
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all font-medium text-slate-900 bg-white"
                                        >
                                            <option value="1-7 days">1–7 days</option>
                                            <option value="1-4 weeks">1–4 weeks</option>
                                            <option value="1-3 months">1–3 months</option>
                                            <option value="3-6 months">3–6 months</option>
                                            <option value="6+ months">6+ months</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Section B/C: Description & Skills */}
                        {activeSection === 1 && (
                            <section className="animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-brand-accent" /> Description & Skills
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Project Description *</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={4}
                                            placeholder="Detailed overview of what you are building or need help with..."
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Core Responsibilities</label>
                                            <textarea
                                                name="responsibilities"
                                                value={formData.responsibilities}
                                                onChange={handleInputChange}
                                                rows={3}
                                                placeholder="- Develop UI components&#10;- Optimize performance..."
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Deliverables</label>
                                            <textarea
                                                name="deliverables"
                                                value={formData.deliverables}
                                                onChange={handleInputChange}
                                                rows={3}
                                                placeholder="- Source code&#10;- Documentation..."
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Required Skills</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="currentSkill"
                                                    value={formData.currentSkill}
                                                    onChange={handleInputChange}
                                                    onKeyDown={handleSkillAdd}
                                                    placeholder="Type skill & hit Enter"
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                                />
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {formData.skills.map((skill, i) => (
                                                    <span key={i} className="px-3 py-1 bg-brand-navy text-white text-sm font-bold rounded-full flex items-center gap-2">
                                                        {skill}
                                                        <button onClick={() => removeSkill(skill)} className="hover:text-red-300"><X className="w-3 h-3" /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Experience Level</label>
                                            <select
                                                name="experienceLevel"
                                                value={formData.experienceLevel}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all font-medium text-slate-900 bg-white"
                                            >
                                                <option value="Beginner">Beginner (Entry Level)</option>
                                                <option value="Intermediate">Intermediate (Competent)</option>
                                                <option value="Expert">Expert (Specialist)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Section D: Payment */}
                        {activeSection === 2 && (
                            <section className="animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-brand-accent" /> Payment & Budget
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Payment Type</label>
                                        <div className="flex bg-slate-100 p-1 rounded-lg">
                                            {['Fixed Price', 'Hourly'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, paymentType: type }))}
                                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${formData.paymentType === type
                                                        ? 'bg-white text-brand-navy shadow-sm border border-slate-200'
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
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all font-medium text-slate-900 bg-white"
                                            >
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                                <option value="GBP">GBP (£)</option>
                                                <option value="INR">INR (₹)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Range ({formData.currency})</label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="number"
                                                    name="budgetMin"
                                                    placeholder="Min"
                                                    value={formData.budgetMin}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-3 rounded-lg border border-slate-200 focus:border-brand-accent outline-none text-sm"
                                                />
                                                <span className="text-slate-400">-</span>
                                                <input
                                                    type="number"
                                                    name="budgetMax"
                                                    placeholder="Max"
                                                    value={formData.budgetMax}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-3 rounded-lg border border-slate-200 focus:border-brand-accent outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method</label>
                                        <select
                                            name="paymentMethod"
                                            value={formData.paymentMethod}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all font-medium text-slate-900 bg-white"
                                        >
                                            <option value="Platform Escrow">Platform Escrow (Safest)</option>
                                            <option value="Direct Payment">Direct Payment (UPI/Bank/Wallet)</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Section E/F/G: Final Details */}
                        {activeSection === 3 && (
                            <section className="animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-brand-accent" /> Timeline & Requirements
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Application Deadline</label>
                                        <input
                                            type="date"
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent outline-none text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent outline-none text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Portfolio Required?</label>
                                        <select
                                            name="portfolioRequired"
                                            value={formData.portfolioRequired}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent outline-none bg-white text-slate-700"
                                        >
                                            <option value="Yes">Yes, Required</option>
                                            <option value="No">No, Optional</option>
                                        </select>
                                    </div>
                                    <div className="lg:col-span-3">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Job Visibility</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-brand-accent hover:bg-brand-accent/5 transition-all flex-1">
                                                <input
                                                    type="radio"
                                                    name="visibility"
                                                    value="Public"
                                                    checked={formData.visibility === 'Public'}
                                                    onChange={handleInputChange}
                                                    className="w-5 h-5 text-brand-navy focus:ring-brand-accent"
                                                />
                                                <div>
                                                    <span className="block font-bold text-slate-900">Public</span>
                                                    <span className="text-xs text-slate-500">Visible to all freelancers on the platform</span>
                                                </div>
                                            </label>
                                            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-brand-accent hover:bg-brand-accent/5 transition-all flex-1">
                                                <input
                                                    type="radio"
                                                    name="visibility"
                                                    value="Invite"
                                                    checked={formData.visibility === 'Invite'}
                                                    onChange={handleInputChange}
                                                    className="w-5 h-5 text-brand-navy focus:ring-brand-accent"
                                                />
                                                <div>
                                                    <span className="block font-bold text-slate-900">Invite Only</span>
                                                    <span className="text-xs text-slate-500">Only people you invite can view this</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        <div className="pt-8 border-t border-slate-100">
                            {errors.form && (
                                <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm font-bold flex items-center gap-2">
                                    <XCircle className="w-4 h-4" /> {errors.form}
                                </div>
                            )}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                {activeSection === 0 ? (
                                    <Link to="/" className="w-1/3 md:w-auto px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-center">
                                        Cancel
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setActiveSection(prev => prev - 1)}
                                        className="w-1/3 md:w-auto px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-center"
                                    >
                                        Back
                                    </button>
                                )}

                                {activeSection < sections.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="w-2/3 md:w-auto px-8 py-3 bg-brand-navy hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-brand-navy/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        Next Step <ChevronRight className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="w-2/3 md:w-auto px-8 py-3 bg-brand-accent hover:bg-brand-accent-hover text-brand-navy rounded-xl font-bold shadow-lg shadow-brand-accent/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        Post Job Now <CheckCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PostJob;
