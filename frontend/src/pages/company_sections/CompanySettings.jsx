

import React, { useState,useEffect } from 'react';
import {
    Building2,
    Mail,
    FileCheck,
    Save,
    Camera,
    Upload,
    MapPin,
    Globe,
    Phone,
    Linkedin,
    Twitter,
    Briefcase,
    Calendar,
    CheckCircle,
    AlertCircle,
    FileText,
    ShieldCheck
} from 'lucide-react';
import Notification from '@/components/Notification';

const CompanySettings = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({
        isVisible: false,
        type: 'success',
        message: ''
    });

    const hideNotification = () => setNotification(prev => ({ ...prev, isVisible: false }));

    const [brandLogo, setBrandLogo] = useState(null);
    const [brandLogoPreview, setBrandLogoPreview] = useState(null);



    const [formData, setFormData] = useState({
        company_name: '',
        email: '',

        brandLogoUrl: null,
        // Company Profile Information
        companyLegalName: '',
        brandName: '',
        companyType: '', // Private, Public, Startup, Government, NGO
        industry: '',
        companySize: '', // e.g. 1-10, 10-50, 50-100, 100-500, 500+
        foundedYear: '',
        description: '',
        headquarters: '',

        // Contact & Communication
        officialEmail:  '',
        phoneNumber: '',
        website: '',
        supportEmail: '',
        linkedinUrl: '',
        twitterUrl: '',
        careersPageUrl: '',

        // Address & Location
        registeredAddress: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        branchLocations: '', // comma-separated or array later
        isRemoteFriendly: false,

        // Legal & Verification
        registrationNumber: '',
        businessType: '', // Pvt Ltd, LLC, LLP, etc.
        taxId: '',
        registrationDate: '',
        registeredCountry: '',
        verificationStatus: 'pending', // pending | verified | rejected
        rejectionReason: '',

        // Documents
        docRegistration: null,
        docTax: null,
        docProof: null,
        docSignatory: null
    });

    useEffect(() => {
        const fetchCompanySettings = async () => {
            try {
            const res = await fetch('http://localhost:8000/api/accounts/company/profile/', {
                headers: {
                Authorization: `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json',
                },
            });

            if (!res.ok) return;

            const data = await res.json();

        
            

            setFormData((prev) => ({
            ...prev,

            brandLogoUrl: data.brand_logo || null,
            // basic user/company
            email: data.email || '',
            company_name: data.company_name || '',

            // profile
            companyLegalName: data.company_legal_name || '',
            brandName: data.brand_name || '',
            companyType: data.company_type || '',
            industry: data.industry || '',
            companySize: data.company_size || '',
            foundedYear: data.founded_year || '',
            description: data.description || '',
            headquarters: data.headquarters || '',

            // contact
            officialEmail: data.official_email || '',
            supportEmail: data.support_email || '',
            phoneNumber: data.phone_number || '',
            website: data.website || '',
            linkedinUrl: data.linkedin_url || '',
            twitterUrl: data.twitter_url || '',
            careersPageUrl: data.careers_page_url || '',

            // location
            registeredAddress: data.registered_address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || '',
            postalCode: data.postal_code || '',
            branchLocations: data.branch_locations || '',
            isRemoteFriendly: data.is_remote_friendly || false,

            // verification
            registrationNumber: data.registration_number || '',
            businessType: data.business_type || '',
            taxId: data.tax_id || '',
            registrationDate: data.registration_date || '',
            registeredCountry: data.registered_country || '',
            verificationStatus: data.verification_status || 'pending',
            rejectionReason: data.rejection_reason || '',
            }


        ));

            } catch (err) {
            console.error(err);

            }
        };

        fetchCompanySettings();
        }, []);


    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const res = await fetch(
                    "http://localhost:8000/api/accounts/company/documents/",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("access")}`,
                        },
                    }
                );

                if (!res.ok) return;

                const docs = await res.json();

                const docState = {
                    docRegistration: false,
                    docTax: false,
                    docProof: false,
                    docSignatory: false,
                };

                docs.forEach((doc) => {
                    if (doc.document_key === "registration") docState.docRegistration = true;
                    if (doc.document_key === "tax") docState.docTax = true;
                    if (doc.document_key === "proof") docState.docProof = true;
                    if (doc.document_key === "signatory") docState.docSignatory = true;
                });

                setFormData((prev) => ({
                    ...prev,
                    ...docState,
                }));
            } catch (err) {
                console.error("Failed to fetch documents", err);
            }
        };

        fetchDocuments();
    }, []);




        const handleSave = async (fullPayload = false) => {
        try {
            setIsLoading(true);

            let payload = {};

            if (fullPayload) {
                payload = {
                    company_legal_name: formData.companyLegalName,
                    brand_name: formData.brandName,
                    company_type: formData.companyType,
                    industry: formData.industry,
                    company_size: formData.companySize,
                    founded_year: formData.foundedYear,
                    description: formData.description,
                    headquarters: formData.headquarters,
                    official_email: formData.officialEmail,
                    support_email: formData.supportEmail,
                    phone_number: formData.phoneNumber,
                    website: formData.website,
                    linkedin_url: formData.linkedinUrl,
                    twitter_url: formData.twitterUrl,
                    careers_page_url: formData.careersPageUrl,
                    registered_address: formData.registeredAddress,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    postal_code: formData.postalCode,
                    branch_locations: formData.branchLocations,
                    is_remote_friendly: formData.isRemoteFriendly,
                    registration_number: formData.registrationNumber,
                    business_type: formData.businessType,
                    tax_id: formData.taxId,
                    registration_date: formData.registrationDate,
                    registered_country: formData.registeredCountry,
                };
            } else {
                if (activeSection === "profile") {
                payload = {
                    company_legal_name: formData.companyLegalName,
                    brand_name: formData.brandName,
                    company_type: formData.companyType,
                    industry: formData.industry,
                    company_size: formData.companySize,
                    founded_year: formData.foundedYear,
                    description: formData.description,
                    headquarters: formData.headquarters,
                };
                }

                if (activeSection === "contact") {
                payload = {
                    official_email: formData.officialEmail,
                    support_email: formData.supportEmail,
                    phone_number: formData.phoneNumber,
                    website: formData.website,
                    linkedin_url: formData.linkedinUrl,
                    twitter_url: formData.twitterUrl,
                    careers_page_url: formData.careersPageUrl,
                };
                }

                if (activeSection === "location") {
                payload = {
                    registered_address: formData.registeredAddress,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    postal_code: formData.postalCode,
                    branch_locations: formData.branchLocations,
                    is_remote_friendly: formData.isRemoteFriendly,
                };
                }

                if (activeSection === "verification") {
                payload = {
                    registration_number: formData.registrationNumber,
                    business_type: formData.businessType,
                    tax_id: formData.taxId,
                    registration_date: formData.registrationDate,
                    registered_country: formData.registeredCountry,
                };
                }
            }

            const res = await fetch(
            "http://localhost:8000/api/accounts/company/profile/",
            {
                method: "PATCH",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access")}`,
                },
                body: JSON.stringify(payload),
            }
            );

            if (!res.ok) {
            const err = await res.json();
            console.error(err);
            throw new Error("Save failed");
            }

            setNotification({
                isVisible: true,
                type: 'success',
                message: "Saved successfully"
            });
        } catch (err) {
            console.error(err);
            setNotification({
                isVisible: true,
                type: 'error',
                message: "Failed to save settings"
            });
        } finally {
            setIsLoading(false);
        }
    };
        const requestVerification = async () => {
            try {
                setIsLoading(true);
                // 1. Save all changes first
                await handleSave(true);

                // 2. Request verification
                const res = await fetch(
                    "http://localhost:8000/api/accounts/company/profile/",
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("access")}`,
                        },
                        body: JSON.stringify({ verification_status: 'pending' }),
                    }
                );

                if (!res.ok) throw new Error("Request failed");

                setFormData(prev => ({ ...prev, verificationStatus: 'pending' }));
                setNotification({
                    isVisible: true,
                    type: 'success',
                    message: "Verification request submitted!"
                });
            } catch (err) {
                console.error(err);
                setNotification({
                    isVisible: true,
                    type: 'error',
                    message: "Failed to submit request"
                });
            } finally {
                setIsLoading(false);
            }
        };

        const isProfileComplete = () => {
            const requiredFields = [
                'companyLegalName', 'industry', 'companySize', 'foundedYear', 
                'description', 'headquarters', 'officialEmail', 'phoneNumber', 
                'website', 'registeredAddress', 'city', 'country',
                'registrationNumber', 'taxId', 'registeredCountry'
            ];
            const hasAllFields = requiredFields.every(field => !!formData[field]?.toString().trim());
            const hasDocs = formData.docRegistration && formData.docTax && formData.docProof;
            return hasAllFields && hasDocs;
        };

        const isVerificationLocked = formData.verificationStatus === 'pending' || formData.verificationStatus === 'verified';

        const uploadBrandLogo = async (file) => {
            const fd = new FormData();
            fd.append("brand_logo", file);

            const res = await fetch(
                "http://localhost:8000/api/accounts/company/profile/",
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access")}`,
                    },
                    body: fd,
                }
            );

            if (!res.ok) {
                throw new Error("Logo upload failed");
            }

            const data = await res.json();

            setFormData(prev => ({
                ...prev,
                brandLogoUrl: data.brand_logo,
            }));
        };




    const uploadDocument = async (documentKey, file) => {
    const formData = new FormData();
    formData.append("document_key", documentKey);
    formData.append("file", file);

    const res = await fetch(
        "http://localhost:8000/api/accounts/company/documents/",
        {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: formData,
        }
    );

    if (!res.ok) {
        throw new Error("Upload failed");
    }

    return await res.json();
    };




    const navItems = [
        { id: 'profile', label: 'Company Profile', icon: Building2 },
        { id: 'contact', label: 'Contact & Communication', icon: Mail },
        { id: 'location', label: 'Address & Location', icon: MapPin },
        { id: 'verification', label: 'Legal & Verification', icon: ShieldCheck },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Company Profile Information</h3>
                                <p className="text-slate-500 text-sm">Define who the company is. This information is public.</p>
                            </div>
                             <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 text-sm bg-brand-navy text-white hover:bg-brand-navy/90 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                                </button>
                            </div>
                        </div>

                         {/* Logo Upload  */}
                        

                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 rounded-full bg-white border-2 border-slate-200 mb-4 relative group overflow-hidden">
                                {brandLogoPreview || formData.brandLogoUrl ? (
                                    <img
                                        src={brandLogoPreview || formData.brandLogoUrl}
                                        alt="Company Logo"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-2xl">
                                        {formData.brandName?.[0] || "C"}
                                    </div>
                                )}

                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-6 h-6 text-white" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            setBrandLogo(file);
                                            setBrandLogoPreview(URL.createObjectURL(file));

                                            try {
                                                await uploadBrandLogo(file);
                                                setNotification({
                                                    isVisible: true,
                                                    type: 'success',
                                                    message: "Logo uploaded"
                                                });
                                            } catch (err) {
                                                setNotification({
                                                    isVisible: true,
                                                    type: 'error',
                                                    message: "Logo upload failed"
                                                });
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            <p className="text-xs text-slate-400 mt-1">Recommended size: 500×500px</p>
                        </div>



                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Company Legal Name</label>
                                <input
                                    type="text"
                                    value={formData.companyLegalName}
                                    onChange={(e) => setFormData({ ...formData, companyLegalName: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                    placeholder="e.g. TechFlow Solutions Pvt. Ltd."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Brand / Display Name</label>
                                <input
                                    type="text"
                                    value={formData.brandName}
                                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                    placeholder="e.g. TechFlow"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Company Type</label>
                                <select
                                    value={formData.companyType}
                                    onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                >
                                    <option value="Private">Private</option>
                                    <option value="Public">Public</option>
                                    <option value="Startup">Startup</option>
                                    <option value="Government">Government</option>
                                    <option value="NGO">NGO / Non-profit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Industry / Sector</label>
                                <select
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                >
                                    <option value="Technology">Technology</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Education">Education</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Consulting">Consulting</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Company Size</label>
                                <select
                                    value={formData.companySize}
                                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                >
                                    <option value="1-10">1-10 Employees</option>
                                    <option value="11-50">11-50 Employees</option>
                                    <option value="51-200">51-200 Employees</option>
                                    <option value="201-500">201-500 Employees</option>
                                    <option value="500+">500+ Employees</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Founded Year</label>
                                <input
                                    type="text"
                                    value={formData.foundedYear}
                                    onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                    placeholder="YYYY"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Headquarters Location</label>
                                <input
                                    type="text"
                                    value={formData.headquarters}
                                    onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                    placeholder="e.g. San Francisco, CA"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Company Description / Overview</label>
                                <textarea
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                    placeholder="Brief overview of your company, mission, and vision..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                );

            case 'contact':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Contact & Communication</h3>
                                <p className="text-slate-500 text-sm">How seekers and the platform can reach you.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-brand-navy text-white text-sm font-bold rounded-lg hover:bg-brand-navy/90 transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Official Company Email</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-500">
                                        <Mail className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="email"
                                        value={formData.officialEmail}
                                        onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-r-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                        placeholder="contact@company.com"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Domain-based email preferred for faster verification.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Support / HR Email</label>
                                <input
                                    type="email"
                                    value={formData.supportEmail}
                                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                    placeholder="hr@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Website URL</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-500">
                                        <Globe className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-r-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                        placeholder="https://company.com"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-4 border-t border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-4 bg-slate-50 p-2 rounded inline-block text-xs uppercase tracking-wider">Social Presence (Optional)</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">LinkedIn Page</label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-[#0077b5] text-white">
                                                <Linkedin className="w-4 h-4" />
                                            </span>
                                            <input
                                                type="url"
                                                value={formData.linkedinUrl}
                                                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-r-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                                placeholder="https://linkedin.com/company/..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Twitter / X Profile</label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-black text-white">
                                                <Twitter className="w-4 h-4" />
                                            </span>
                                            <input
                                                type="url"
                                                value={formData.twitterUrl}
                                                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-r-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                                placeholder="https://twitter.com/..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Company Careers Page</label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-emerald-500 text-white">
                                                <Briefcase className="w-4 h-4" />
                                            </span>
                                            <input
                                                type="url"
                                                value={formData.careersPageUrl}
                                                onChange={(e) => setFormData({ ...formData, careersPageUrl: e.target.value })}
                                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-r-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                                placeholder="https://company.com/careers"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'location':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Address & Location</h3>
                                <p className="text-slate-500 text-sm">Where your business is physically located.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-brand-navy text-white text-sm font-bold rounded-lg hover:bg-brand-navy/90 transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Registered Office Address</label>
                                <input
                                    type="text"
                                    value={formData.registeredAddress}
                                    onChange={(e) => setFormData({ ...formData, registeredAddress: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                    placeholder="Street address, Floor, Building"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">State / Province</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Postal / ZIP Code</label>
                                <input
                                    type="text"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Branch Locations (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.branchLocations}
                                    onChange={(e) => setFormData({ ...formData, branchLocations: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                    placeholder="e.g. London, Tokyo, New York (Comma separated)"
                                />
                            </div>

                            <div className="md:col-span-2 flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div>
                                    <p className="font-bold text-slate-900">Remote Status</p>
                                    <p className="text-sm text-slate-500">Is your company remote-friendly?</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isRemoteFriendly}
                                        onChange={(e) => setFormData({ ...formData, isRemoteFriendly: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
                                    <span className="ml-3 text-sm font-medium text-slate-700">{formData.isRemoteFriendly ? 'Yes' : 'No'}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                );
            case 'verification':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Legal & Verification</h3>
                                <p className="text-slate-500 text-sm">Critical information for platform trust and job posting access.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-brand-navy text-white text-sm font-bold rounded-lg hover:bg-brand-navy/90 transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Details
                            </button>
                        </div>

                        {/* Status Banners */}
                        {formData.verificationStatus === 'pending' && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-amber-800">Verification Pending</h4>
                                    <p className="text-sm text-amber-700">You cannot post jobs until your company details are verified by our admin team. Please ensure all details are accurate.</p>
                                </div>
                            </div>
                        )}
                        {formData.verificationStatus === 'verified' && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-green-800">Account Verified</h4>
                                    <p className="text-sm text-green-700">Your account is fully verified. You have full access to post jobs and contact candidates.</p>
                                </div>
                            </div>
                        )}
                        {formData.verificationStatus === 'rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-red-800">Verification Failed</h4>
                                    <p className="text-sm text-red-700">Reason: {formData.rejectionReason}</p>
                                    <p className="text-sm text-red-700 mt-1">Please update your documents and details and try again.</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Registration Number</label>
                                <input
                                    type="text"
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all top-[2px]"
                                    placeholder="e.g. CIN, CRN"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Business Type</label>
                                <select
                                    value={formData.businessType}
                                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                >
                                    <option>LLP</option>
                                    <option>Pvt Ltd</option>
                                    <option>Public Ltd</option>
                                    <option>Sole Proprietorship</option>
                                    <option>Partnership</option>
                                    <option>Corporation (Inc.)</option>
                                    <option>LLC</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tax ID / GST / EIN</label>
                                <input
                                    type="text"
                                    value={formData.taxId}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Date of Registration</label>
                                <input
                                    type="date"
                                    value={formData.registrationDate}
                                    onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Registered Country</label>
                                <input
                                    type="text"
                                    value={formData.registeredCountry}
                                    onChange={(e) => setFormData({ ...formData, registeredCountry: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className="pt-6 border-t border-slate-200">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-brand-navy" /> Required Documents
                            </h4>
                            <p className="text-sm text-slate-500 mb-4">Please upload clear scans or photos of the original documents. Formats: PDF, JPG, PNG.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {[
                                    { id: 'docRegistration', title: 'Business Registration Cert.', required: true },
                                    { id: 'docTax', title: 'Tax/GST/EIN Document', required: true },
                                    { id: 'docProof', title: 'Govt. Issued Company Proof', required: true },
                                    { id: 'docSignatory', title: 'Authorized Signatory ID', required: false },
                                ].map((doc) => (
                                    <div key={doc.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:border-brand-accent/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{doc.title}</p>
                                                {doc.required && <span className="text-[10px] text-red-500 font-bold uppercase">Required</span>}
                                            </div>
                                            {formData[doc.id] ? (
                                                <div className="text-green-600">
                                                    <CheckCircle className="w-5 h-5" />
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                                            )}
                                        </div>

                                        <div className="mt-3">
                                            <label className="cursor-pointer block w-full py-2 border border-dashed border-slate-300 rounded-lg text-center text-xs font-bold text-slate-500 hover:bg-white hover:text-brand-navy hover:border-brand-navy transition-all">
                                                <Upload className="w-3 h-3 inline-block mr-1" />
                                                Click to Upload
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;

                                                        try {
                                                        await uploadDocument(
                                                            doc.id.replace('doc', '').toLowerCase(),
                                                            file
                                                        );

                                                        setFormData(prev => ({
                                                            ...prev,
                                                            [doc.id]: file.name,
                                                        }));
                                                        } catch (err) {
                                                            setNotification({
                                                                isVisible: true,
                                                                type: 'error',
                                                                message: "Document upload failed"
                                                            });
                                                        }
                                                    }}
                                                    />

                                            </label>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>

                        {/* Verification Action Block at the Bottom */}
                        {!isVerificationLocked && (
                            <div className="pt-8 mt-8 border-t border-slate-200 flex flex-col items-center gap-4">
                                <div className="text-center max-w-md">
                                    <h4 className="font-bold text-slate-900">Final Step: Submit for Verification</h4>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Once you've filled all required fields and uploaded documents, click the button below to request verification from SkillLink Admin.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        onClick={requestVerification}
                                        disabled={!isProfileComplete() || isLoading}
                                        className={`px-8 py-3 text-base font-bold rounded-xl transition-all flex items-center gap-2 ${
                                            isProfileComplete() 
                                            ? 'bg-brand-accent text-brand-navy hover:bg-brand-accent/90 shadow-xl shadow-brand-accent/20 scale-105 active:scale-95' 
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                        }`}
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-brand-navy border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <ShieldCheck className="w-5 h-5" />
                                        )}
                                        {isLoading ? 'Processing...' : 'Submit Verification Request'}
                                    </button>
                                    {!isProfileComplete() && (
                                        <div className="flex items-center gap-1.5 text-amber-600">
                                            <AlertCircle className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Please complete all 15 required fields & 3 mandatory docs to activate</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <Notification 
                {...notification}
                onClose={hideNotification}
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Settings Sidebar */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                        <div className="p-4 bg-slate-50 border-b border-slate-100">
                            <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Settings Menu</h2>
                        </div>
                        <nav className="flex flex-col p-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${activeSection === item.id
                                        ? 'bg-brand-navy text-white shadow-md'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-brand-navy'
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 ${activeSection === item.id ? 'text-brand-accent' : ''}`} />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanySettings;
