import React, { useState, useEffect } from 'react';
import { Search, Check, X, ShieldAlert, Eye, FileText } from 'lucide-react';
import api from '../../api/axios';

const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCompanies = async () => {
        try {
            const res = await api.get('accounts/admin/companies/');
            setCompanies(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyDetail = async (id) => {
        try {
            const res = await api.get(`accounts/admin/companies/${id}/`);
            setSelectedCompany(res.data);
            setShowModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleVerifyStatus = async (id, status, reason = "") => {
        try {
            await api.post(`accounts/admin/companies/${id}/verify/`, { status, rejection_reason: reason });
            fetchCompanies();
            if (selectedCompany?.id === id) setShowModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredCompanies = companies.filter(company =>
        company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-brand-navy">Company Management</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/50 w-64"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">Company Name</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Email</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Posted Jobs</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCompanies.map((company) => (
                            <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-brand-navy">{company.company_name}</td>
                                <td className="px-6 py-4 text-slate-500">{company.email}</td>
                                <td className="px-6 py-4 text-slate-500">{company.posted_jobs_count}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${company.verification_status === 'verified' ? 'bg-green-100 text-green-700' :
                                            company.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            company.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-slate-100 text-slate-700'
                                        }`}>
                                        {company.verification_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {company.verification_status !== 'verified' && (
                                            <>
                                                <button
                                                    onClick={() => handleVerifyStatus(company.id, 'verified')}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                    title="Approve"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const reason = prompt("Reason for rejection:");
                                                        if (reason) handleVerifyStatus(company.id, 'rejected', reason);
                                                    }}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Reject"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}

                                        <button 
                                            onClick={() => fetchCompanyDetail(company.id)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {showModal && selectedCompany && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col scale-in">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                    {selectedCompany.brand_logo ? (
                                        <img src={selectedCompany.brand_logo} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-slate-300">{selectedCompany.company_name?.[0]}</span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-brand-navy">{selectedCompany.company_name}</h2>
                                    <p className="text-slate-500 text-sm">{selectedCompany.official_email || selectedCompany.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Company Details</h3>
                                    <div className="space-y-4">
                                        <DetailItem label="Legal Name" value={selectedCompany.company_legal_name} />
                                        <DetailItem label="Industry" value={selectedCompany.industry} />
                                        <DetailItem label="Size" value={selectedCompany.company_size} />
                                        <DetailItem label="Founded" value={selectedCompany.founded_year} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Info</h3>
                                    <div className="space-y-4">
                                        <DetailItem label="Website" value={selectedCompany.website} isLink />
                                        <DetailItem label="Support Email" value={selectedCompany.support_email} />
                                        <DetailItem label="Phone" value={selectedCompany.phone_number} />
                                        <DetailItem label="HQ" value={selectedCompany.headquarters} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Verification</h3>
                                    <div className="space-y-4">
                                        <DetailItem label="Reg Number" value={selectedCompany.registration_number} />
                                        <DetailItem label="Tax ID" value={selectedCompany.tax_id} />
                                        <DetailItem label="Status" value={selectedCompany.verification_status} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Uploaded Documents</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedCompany.documents?.length > 0 ? (
                                        selectedCompany.documents.map(doc => (
                                            <a 
                                                key={doc.id} 
                                                href={doc.file} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-brand-accent/30 hover:bg-slate-50 transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-brand-navy/5 text-brand-navy flex items-center justify-center group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{doc.document_key.replace('_', ' ').toUpperCase()}</p>
                                                    <p className="text-xs text-slate-400">View Document</p>
                                                </div>
                                                <Eye className="w-4 h-4 text-slate-300 group-hover:text-brand-accent transition-colors" />
                                            </a>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 italic text-sm">No documents uploaded.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0">
                            {selectedCompany.verification_status !== 'verified' && (
                                <>
                                    <button 
                                        onClick={() => handleVerifyStatus(selectedCompany.id, 'rejected', prompt("Reason for rejection:"))}
                                        className="px-6 py-2.5 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Reject Company
                                    </button>
                                    <button 
                                        onClick={() => handleVerifyStatus(selectedCompany.id, 'verified')}
                                        className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 transition-all flex items-center gap-2"
                                    >
                                        <Check className="w-5 h-5" /> Approve Verification
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailItem = ({ label, value, isLink }) => (
    <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        {isLink && value ? (
            <a href={value} target="_blank" rel="noreferrer" className="block text-sm font-medium text-brand-navy hover:underline truncate">{value}</a>
        ) : (
            <p className="text-sm font-medium text-brand-navy truncate">{value || 'N/A'}</p>
        )}
    </div>
);


export default CompanyManagement;
