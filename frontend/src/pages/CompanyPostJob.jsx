import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Notification from '../components/Notification';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';  
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    FileText,
    Globe,
    CheckCircle,
    ChevronRight,
    Search,
    X,
    Building,
    Calendar,
    PenTool,
    GraduationCap,
    Award,
    Tag,
    XCircle,
    UploadCloud
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CompanyPostJob = () => {
    const { user, loading } = useAuth();
    const [companyStatus, setCompanyStatus] = useState('unverified');
    const [fetchingStatus, setFetchingStatus] = useState(true);
    const [formData, setFormData] = useState({
        // 1. Basic Job Information
        jobTitle: '',
        category: '',
        employmentType: '',
        seniorityLevel: '',
        location: '',
        remoteOption: 'On-site',

        // 2. Details & Skills
        description: '',
        skills: [],
        currentSkill: '',
        education: '',
        experience: '',
        certifications: '',

        // 3. Compensation & Benefits
        salaryMin: '',
        salaryMax: '',
        currency: 'INR', // Default based on user request example
        salaryPeriod: 'Yearly',
        benefits: [],
        currentBenefit: '',

        // 4. Application Details & Tags
        deadline: '',
        applicationMethod: 'Via App',
        applicationLink: '', // If method is link
        openings: '1',
        tags: [],
        currentTag: '',

        // Optional
        shortSummary: '',
        questions: [],
        currentQuestion: '',

       
    });

    const [activeSection, setActiveSection] = useState(0);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({
            show: false,
            message: '',
            type: 'success', // 'success' | 'error' | 'info'
        });
    const [isSubmitting, setIsSubmitting] = useState(false);

    React.useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await api.get('accounts/company/me/');
                setCompanyStatus(res.data.verification_status);
            } catch (err) {
                console.error(err);
            } finally {
                setFetchingStatus(false);
            }
        };
        if (user) fetchStatus();
    }, [user]);

    if (loading || fetchingStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name] || errors.form) {
            setErrors(prev => ({ ...prev, [name]: '', form: '' }));
        }
    };

    const handleArrayAdd = (field, currentField, e) => {
        if (e.key === 'Enter' && formData[currentField]?.trim()) {
            e.preventDefault();
            const val = formData[currentField].trim();
            if (!formData[field].includes(val)) {
                setFormData(prev => ({
                    ...prev,
                    [field]: [...prev[field], val],
                    [currentField]: ''
                }));
            }
        }
    };

    const handleArrayRemove = (field, itemToRemove) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(item => item !== itemToRemove)
        }));
    };

    const categories = ['IT & Software', 'Marketing', 'Finance', 'Design', 'Sales', 'HR', 'Engineering', 'Operations', 'Other'];
    const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
    const seniorityLevels = ['Entry-level', 'Junior', 'Mid-level', 'Senior', 'Manager', 'Director', 'Executive'];
    const remoteOptions = ['On-site', 'Remote', 'Hybrid'];

    const sections = [
        { id: 'basics', label: 'Basics', icon: Briefcase },
        { id: 'details', label: 'Details', icon: FileText },
        { id: 'rewards', label: 'Rewards', icon: DollarSign },
        { id: 'finalize', label: 'Finalize', icon: CheckCircle }
    ];

    const validateStep = (step) => {
        const newErrors = {};
        let isValid = true;

        if (step === 0) {
            if (!formData.jobTitle.trim()) newErrors.jobTitle = true;
            if (!formData.category) newErrors.category = true;
            if (!formData.employmentType) newErrors.employmentType = true;
            if (!formData.seniorityLevel) newErrors.seniorityLevel = true;
            if (!formData.location.trim() && formData.remoteOption !== 'Remote') newErrors.location = true;
        }

        if (step === 1) {
            if (!formData.description.trim()) newErrors.description = true;
            if (formData.skills.length === 0) newErrors.skills = true;
        }

        if (step === 2) {
            if (formData.salaryMin && formData.salaryMax && Number(formData.salaryMin) > Number(formData.salaryMax)) {
                newErrors.salary = 'Min salary cannot be greater than Max salary';
                isValid = false;
            }
        }

        if (step === 3) {
            if (!formData.deadline) newErrors.deadline = true;
        }

        if (Object.keys(newErrors).length > 0 && !newErrors.salary) {
            isValid = false;
            setErrors({ ...newErrors, form: 'Please fill in all required fields.' });
        } else if (newErrors.salary) {
            setErrors({ ...newErrors });
        }

        return isValid;
    };


    const handleSubmitJob = async () => {
        setIsSubmitting(true); // Start loading
        const workModeMap = { 'On-site': 'on_site', 'Remote': 'remote', 'Hybrid': 'hybrid' };
        const salaryPeriodMap = { 'Yearly': 'yearly', 'Monthly': 'monthly', 'Hourly': 'hourly' };

        const payload = {
            title: formData.jobTitle,
            category: formData.category,
            employment_type: formData.employmentType.toLowerCase().replace('-', '_'),
            seniority_level: formData.seniorityLevel.toLowerCase().replace('-', '_'),
            location: formData.location,
            work_mode: workModeMap[formData.remoteOption],
            description: formData.description,
            skills: formData.skills,
            education: formData.education,
            experience: formData.experience,
            certifications: formData.certifications,
            salary_min: formData.salaryMin || null,
            salary_max: formData.salaryMax || null,
            salary_currency: formData.currency,
            salary_period: salaryPeriodMap[formData.salaryPeriod],
            benefits: formData.benefits,
            application_deadline: formData.deadline,
            openings: Number(formData.openings),
            tags: formData.tags,
            short_summary: formData.shortSummary,
        };

        try {
            const response = await api.post('company/jobs/', payload);

            if (response.status === 201) {
                setNotification({
                    show: true,
                    message: 'Job Posted Successfully! Redirecting...',
                    type: 'success'
                });
                setTimeout(() => {
                        window.location.href = '/company/dashboard';
                    }, 3000); // give time to show notification
                }
        } catch (err) {
            console.error('Error posting job:', err.response?.data || err.message);

            // Highlight backend validation errors
            if (err.response?.data) {
                const backendErrors = err.response.data;
                const fieldErrors = {};
                Object.keys(backendErrors).forEach(key => {
                    fieldErrors[key] = true; // mark field as error
                });
                setErrors(prev => ({ ...prev, ...fieldErrors, form: 'Please fix highlighted fields.' }));
                const firstErrorField = document.querySelector('.border-red-500');
                if (firstErrorField) firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            } else {
                setErrors(prev => ({ ...prev, form: 'Failed to post job. Please try again.' }));
            }
            setNotification({
                    show: true,
                    message: 'Failed to post job. Please try again.',
                    type: 'error'
                });
        } finally {
            setIsSubmitting(false); // Stop loading
        }
    };




    const handleNext = () => {
        if (validateStep(activeSection)) {
            if (activeSection < sections.length - 1) {
                setActiveSection(prev => prev + 1);
                window.scrollTo(0, 0);
            } else {
                
                handleSubmitJob();
            }
        }
    };


    return (
        <div className="min-h-screen bg-slate-50/50 font-sans">
            {/* Notification at top level */}
            <Notification
                type={notification.type}
                message={notification.message}
                isVisible={notification.show}
                onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />
            
            
            <Header user={user} />

            <div className="bg-brand-navy pt-20 pb-32 px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Post a New Job Opportunity</h1>
                <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                    Find the perfect candidate for your team.
                </p>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-20 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Stepper */}
                    <div className="bg-slate-50 border-b border-slate-200 p-4 md:p-6 overflow-x-auto">
                        <div className="flex items-center justify-between min-w-max md:min-w-0 px-4">
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
                                        <div className={`w-12 md:w-24 h-0.5 mx-2 md:mx-4 ${index < activeSection ? 'bg-brand-accent' : 'bg-slate-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <form className="p-6 md:p-10 space-y-8">
                        {/* Step 1: Basic Info */}
                        {activeSection === 0 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                                    <Briefcase className="w-6 h-6 text-brand-accent" /> Basic Job Information
                                </h2>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Job Title *</label>
                                    <input
                                        type="text"
                                        name="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Senior Python Developer"
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.jobTitle ? 'border-red-500' : 'border-slate-200'} focus:border-brand-accent outline-none transition-all`}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Make it clear and descriptive.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Job Category *</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${errors.category ? 'border-red-500' : 'border-slate-200'} focus:border-brand-accent outline-none bg-white`}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Employment Type *</label>
                                        <select
                                            name="employmentType"
                                            value={formData.employmentType}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${errors.employmentType ? 'border-red-500' : 'border-slate-200'} focus:border-brand-accent outline-none bg-white`}
                                        >
                                            <option value="">Select Type</option>
                                            {employmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Seniority Level *</label>
                                        <select
                                            name="seniorityLevel"
                                            value={formData.seniorityLevel}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${errors.seniorityLevel ? 'border-red-500' : 'border-slate-200'} focus:border-brand-accent outline-none bg-white`}
                                        >
                                            <option value="">Select Level</option>
                                            {seniorityLevels.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Remote Option *</label>
                                        <select
                                            name="remoteOption"
                                            value={formData.remoteOption}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent outline-none bg-white"
                                        >
                                            {remoteOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {formData.remoteOption !== 'Remote' && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Work Location {formData.remoteOption !== 'Remote' && '*'}</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Bangalore, India"
                                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.location ? 'border-red-500' : 'border-slate-200'} focus:border-brand-accent outline-none`}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Details & Skills */}
                        {activeSection === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                                    <FileText className="w-6 h-6 text-brand-accent" /> Description & Requirements
                                </h2>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Job Description *</label>
                                    <textarea
                                        name="description"
                                        rows={6}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Detailed description of responsibilities, day-to-day tasks, and expectations..."
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.description ? 'border-red-500' : 'border-slate-200'} focus:border-brand-accent outline-none resize-none`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Required Skills *</label>
                                    <div className={`p-2 border rounded-lg ${errors.skills ? 'border-red-500' : 'border-slate-200'}`}>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.skills.map((skill, i) => (
                                                <span key={i} className="px-3 py-1 bg-brand-navy text-white text-sm font-bold rounded-full flex items-center gap-2 animate-scale-in">
                                                    {skill}
                                                    <button type="button" onClick={() => handleArrayRemove('skills', skill)} className="hover:text-red-300"><X className="w-3 h-3" /></button>
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                name="currentSkill"
                                                value={formData.currentSkill}
                                                onChange={handleInputChange}
                                                onKeyDown={(e) => handleArrayAdd('skills', 'currentSkill', e)}
                                                placeholder="Type skill & press Enter"
                                                className="flex-1 min-w-[150px] outline-none p-1 text-sm bg-transparent"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">E.g., Python, React, AWS, SQL</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Minimum Experience</label>
                                        <input
                                            type="text"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 3+ Years"
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Education Requirements</label>
                                        <div className="relative">
                                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                name="education"
                                                value={formData.education}
                                                onChange={handleInputChange}
                                                placeholder="e.g. B.Tech / MCA or equivalent"
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Compensation & Benefits */}
                        {activeSection === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                                    <DollarSign className="w-6 h-6 text-brand-accent" /> Compensation & Benefits
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Salary Range ({formData.currency})</label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="number"
                                                    name="salaryMin"
                                                    value={formData.salaryMin}
                                                    onChange={handleInputChange}
                                                    placeholder="Min"
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent outline-none"
                                                />
                                            </div>
                                            <span className="text-slate-400 font-bold">-</span>
                                            <div className="flex-1 relative">
                                                <input
                                                    type="number"
                                                    name="salaryMax"
                                                    value={formData.salaryMax}
                                                    onChange={handleInputChange}
                                                    placeholder="Max"
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent outline-none"
                                                />
                                            </div>
                                            <select
                                                name="salaryPeriod"
                                                value={formData.salaryPeriod}
                                                onChange={handleInputChange}
                                                className="px-4 py-3 rounded-lg border border-slate-200 bg-white"
                                            >
                                                <option value="Yearly">Per Year</option>
                                                <option value="Monthly">Per Month</option>
                                                <option value="Hourly">Per Hour</option>
                                            </select>
                                        </div>
                                        {errors.salary && <p className="text-xs text-red-500 mt-1 font-bold">{errors.salary}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Benefits & Perks</label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            name="currentBenefit"
                                            value={formData.currentBenefit}
                                            onChange={handleInputChange}
                                            onKeyDown={(e) => handleArrayAdd('benefits', 'currentBenefit', e)}
                                            placeholder="Add benefit (e.g. Health Insurance, Remote work)"
                                            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (formData.currentBenefit.trim()) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        benefits: [...prev.benefits, prev.currentBenefit.trim()],
                                                        currentBenefit: ''
                                                    }));
                                                }
                                            }}
                                            className="px-4 py-3 bg-brand-navy text-white rounded-lg font-bold"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.benefits.map((benefit, i) => (
                                            <span key={i} className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 text-sm font-bold rounded-lg flex items-center gap-2">
                                                <CheckCircle className="w-3 h-3" /> {benefit}
                                                <button type="button" onClick={() => handleArrayRemove('benefits', benefit)} className="hover:text-green-900"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Finalize & Optional */}
                        {activeSection === 3 && (
                            <div className="space-y-8 animate-fade-in">
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                                    <CheckCircle className="w-6 h-6 text-brand-accent" /> Application & Review
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Application Deadline *</label>
                                        <input
                                            type="date"
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${errors.deadline ? 'border-red-500' : 'border-slate-200'} focus:border-brand-accent outline-none text-slate-700`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Number of Openings</label>
                                        <input
                                            type="number"
                                            name="openings"
                                            min="1"
                                            value={formData.openings}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Search Tags / Keywords</label>
                                    <div className="p-2 border border-slate-200 rounded-lg">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.tags.map((tag, i) => (
                                                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-bold rounded-full flex items-center gap-2">
                                                    #{tag}
                                                    <button type="button" onClick={() => handleArrayRemove('tags', tag)} className="hover:text-slate-900"><X className="w-3 h-3" /></button>
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                name="currentTag"
                                                value={formData.currentTag}
                                                onChange={handleInputChange}
                                                onKeyDown={(e) => handleArrayAdd('tags', 'currentTag', e)}
                                                placeholder="Add tag & press Enter"
                                                className="flex-1 min-w-[150px] outline-none p-1 text-sm bg-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Short Summary (Optional)</label>
                                    <input
                                        type="text"
                                        name="shortSummary"
                                        value={formData.shortSummary}
                                        onChange={handleInputChange}
                                        placeholder="A catchy 1-2 line summary of the job..."
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-accent outline-none"
                                    />
                                </div>

                                {/* Mock Company Review */}
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Building className="w-5 h-5 text-slate-500" /> Posting as:
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                                            <span className="font-bold text-brand-navy text-xl">{user?.name?.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-slate-900">{user?.name}</p>
                                            <a href={user?.email} target="_blank" rel="noreferrer" className="text-brand-navy hover:underline text-sm">{user?.email}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="pt-8 border-t border-slate-100">
                            {errors.form && (
                                <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm font-bold flex items-center gap-2 animate-shake">
                                    <XCircle className="w-4 h-4" /> {errors.form}
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                {activeSection === 0 ? (
                                    <Link to="/company-dashboard" className="w-full md:w-auto px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-center">
                                        Cancel
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setActiveSection(prev => prev - 1)}
                                        className="w-full md:w-auto px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-center"
                                    >
                                        Back
                                    </button>
                                )}

                                {activeSection < sections.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="w-full md:w-auto px-8 py-3 bg-brand-navy hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-brand-navy/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        Next Step <ChevronRight className="w-5 h-5" />
                                    </button>
                                ) : (
                                 companyStatus !== 'verified' ? (
                                     <div className="w-full bg-amber-50 border border-amber-200 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                                         <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                <XCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-amber-900">Verification Required</h3>
                                                <p className="text-amber-700 text-sm">You must have a verified business profile to post jobs. Please complete your settings.</p>
                                            </div>
                                         </div>
                                         <Link to="/company/dashboard?tab=settings" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-600/20 whitespace-nowrap">
                                            Verify Now
                                         </Link>
                                     </div>
                                 ) : (
                                   <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={isSubmitting}
                                        className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all
                                            ${isSubmitting
                                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed shadow-none'
                                                : 'bg-brand-accent hover:bg-brand-accent-hover text-brand-navy shadow-brand-accent/20'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <svg className="w-5 h-5 animate-spin text-brand-navy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                            </svg>
                                        ) : (
                                            <>
                                                Post Job Now <CheckCircle className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                 )

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

export default CompanyPostJob;
