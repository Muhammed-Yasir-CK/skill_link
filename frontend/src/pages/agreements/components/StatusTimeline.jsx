import React from 'react';
import { Check, Clock, ShieldCheck, Wallet, Trophy, FileSignature, Send } from 'lucide-react';

const steps = [
    { id: 'Selected', label: 'Selected', icon: Check },
    { id: 'Agreement', label: 'Agreement', icon: FileSignature },
    { id: 'Payment', label: 'Payment', icon: Wallet },
    { id: 'InProgress', label: 'Work', icon: Clock },
    { id: 'Completed', label: 'Done', icon: Trophy }
];

const StatusTimeline = ({ currentStatus }) => {
    // Map status to step index
    const getActiveIndex = () => {
        const statusMap = {
            'Selected': 0,
            'Agreement Pending': 1,
            'Payment Pending': 2,
            'InProgress': 3,
            'Payment Released': 4,
            'Completed': 4
        };
        return statusMap[currentStatus] ?? 0;
    };

    const activeIndex = getActiveIndex();

    return (
        <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8 overflow-x-auto">
            <div className="min-w-[700px] flex items-center justify-between relative">
                {/* Connection Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-brand-navy -translate-y-1/2 z-0 transition-all duration-500"
                    style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`
                                w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-2
                                ${isActive ? 'bg-brand-navy border-brand-navy text-white shadow-lg shadow-brand-navy/20' : 'bg-white border-slate-200 text-slate-300'}
                                ${isCurrent ? 'scale-110' : 'scale-100'}
                            `}>
                                <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                            </div>
                            <div className="absolute top-16 text-center whitespace-nowrap">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-brand-navy' : 'text-slate-400'}`}>
                                    {step.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusTimeline;
