import React from 'react';
import { Briefcase, ListTodo, Calendar, Paperclip, Plus, X } from 'lucide-react';

const WorkDetails = ({ data, isEditing, onUpdate }) => {
    const handleAddDeliverable = () => {
        onUpdate({ ...data, deliverables: [...(data.deliverables || []), ""] });
    };

    const handleUpdateDeliverable = (index, value) => {
        const newDels = [...(data.deliverables || [])];
        newDels[index] = value;
        onUpdate({ ...data, deliverables: newDels });
    };

    const handleRemoveDeliverable = (index) => {
        const newDels = (data.deliverables || []).filter((_, i) => i !== index);
        onUpdate({ ...data, deliverables: newDels });
    };
    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-navy" /> Work Definition
                {isEditing && <span className="ml-2 px-2 py-0.5 bg-brand-navy/10 text-brand-navy rounded text-[9px] normal-case tracking-normal">Editing</span>}
            </h3>

            <div className="space-y-6">
                {/* Description */}
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-2">Job Description</label>
                    {isEditing ? (
                        <textarea
                            value={data.description}
                            onChange={(e) => onUpdate({ ...data, description: e.target.value })}
                            className="w-full text-slate-700 text-sm leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200 focus:border-brand-navy focus:ring-1 focus:ring-brand-navy outline-none transition-all resize-y min-h-[100px]"
                            placeholder="Enter detailed job description..."
                        />
                    ) : (
                        <p className="text-slate-700 text-sm leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            {data.description || 'No description provided.'}
                        </p>
                    )}
                </div>

                {/* Deliverables */}
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter  mb-2 flex items-center gap-2">
                        <ListTodo className="w-3.5 h-3.5" /> Core Deliverables
                    </label>
                    <ul className="grid grid-cols-1 gap-2">
                        {data.deliverables?.map((item, i) => (
                            <li key={i} className={`flex items-center gap-3 p-3 bg-white border ${isEditing ? 'border-slate-200' : 'border-slate-100'} rounded-xl text-xs font-bold text-slate-600 shadow-sm transition-all focus-within:border-brand-navy focus-within:ring-1 focus-within:ring-brand-navy`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0"></div>
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => handleUpdateDeliverable(i, e.target.value)}
                                            className="flex-1 outline-none bg-transparent"
                                            placeholder="Enter deliverable..."
                                        />
                                        <button onClick={() => handleRemoveDeliverable(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <span>{item}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                    {isEditing && (
                        <button onClick={handleAddDeliverable} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-brand-navy bg-brand-navy/5 hover:bg-brand-navy/10 px-3 py-1.5 rounded-lg transition-all">
                            <Plus className="w-3.5 h-3.5" /> Add Deliverable
                        </button>
                    )}
                </div>

                {/* Deadline & Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <div className="p-2.5 bg-brand-navy/5 text-brand-navy rounded-xl">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Project Deadline</p>
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={data.deadline || ""}
                                    onChange={(e) => onUpdate({ ...data, deadline: e.target.value })}
                                    className="w-full text-sm font-black text-slate-900 bg-transparent outline-none border-b border-dashed border-slate-300 focus:border-brand-navy pb-0.5"
                                />
                            ) : (
                                <p className="text-sm font-black text-slate-900">{data.deadline || 'Flexible'}</p>
                            )}
                        </div>
                    </div>

                    {/* {data.attachments && (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-brand-navy/5 text-brand-navy rounded-xl">
                                    <Paperclip className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Resources</p>
                                    <p className="text-sm font-black text-slate-900">{data.attachments.length} Files Attached</p>
                                </div>
                            </div>
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    );
};

export default WorkDetails;
