import React from 'react';
import { ShieldAlert, Plus, X } from 'lucide-react';

const TermsSection = ({ terms, isEditing, onUpdate, checked, onChange, readOnly = false }) => {
    const defaultTerms = [
        "Scope of Work: The Seeker agrees to complete all deliverables specified in the Work Definition section within the agreed deadline.",
        "Payment Release: Funds will be held in the blockchain escrow and released only upon the Provider's approval of the submitted work, unless otherwise specified in milestone terms.",
        "Quality Assurance: All work must meet the standards defined in the description. The Provider reserves the right to request reasonable changes.",
        "Confidentiality: Both parties agree to maintain the confidentiality of any shared project resources or proprietary information."
    ];

    const currentTerms = terms || defaultTerms;

    const handleAddTerm = () => {
        onUpdate([...currentTerms, ""]);
    };

    const handleUpdateTerm = (index, value) => {
        const newTerms = [...currentTerms];
        newTerms[index] = value;
        onUpdate(newTerms);
    };

    const handleRemoveTerm = (index) => {
        const newTerms = currentTerms.filter((_, i) => i !== index);
        onUpdate(newTerms);
    };
    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-brand-navy" /> Terms & Conditions
            </h3>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 max-h-64 overflow-y-auto mb-6">
                <ol className="list-decimal list-inside space-y-4 text-sm text-slate-600 font-medium leading-relaxed">
                    {currentTerms.map((term, index) => (
                        <li key={index} className="flex gap-3 group/term relative">
                            <span className="shrink-0 font-bold text-slate-400">{index + 1}.</span>
                            {isEditing ? (
                                <div className="flex-1 flex gap-2 items-start">
                                    <textarea
                                        value={term}
                                        onChange={(e) => handleUpdateTerm(index, e.target.value)}
                                        className="flex-1 bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy resize-y min-h-[60px] text-sm"
                                        placeholder="Enter term condition..."
                                    />
                                    <button
                                        onClick={() => handleRemoveTerm(index)}
                                        className="p-2 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-lg shrink-0 mt-1 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <span>{term}</span>
                            )}
                        </li>
                    ))}
                </ol>
                {isEditing && (
                    <button
                        onClick={handleAddTerm}
                        className="mt-6 flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:bg-brand-navy/5 px-4 py-2 rounded-xl transition-all border border-brand-navy/10"
                    >
                        <Plus className="w-4 h-4" /> Add New Term
                    </button>
                )}
            </div>

            {(!readOnly || checked) && (
                <label className={`flex items-center gap-3 ${readOnly ? 'cursor-default opacity-80' : 'cursor-pointer group'}`}>
                    <div className="relative">
                        <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={checked}
                            disabled={readOnly}
                            onChange={(e) => !readOnly && onChange(e.target.checked)}
                        />
                        <div className={`w-6 h-6 border-2 rounded-lg transition-all flex items-center justify-center ${readOnly
                                ? 'border-brand-navy bg-brand-navy'
                                : 'border-slate-200 group-hover:border-brand-navy peer-checked:bg-brand-navy peer-checked:border-brand-navy'
                            }`}>
                            <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                    <span className={`text-xs font-bold transition-colors ${readOnly ? 'text-brand-navy' : 'text-slate-600 group-hover:text-brand-navy'
                        }`}>
                        {readOnly ? 'Agreement terms have been read and confirmed.' : 'I have read and confirm all agreement terms mentioned above.'}
                    </span>
                </label>
            )}
        </div>
    );
};

export default TermsSection;
