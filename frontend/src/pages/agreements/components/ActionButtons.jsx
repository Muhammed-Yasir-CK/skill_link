import React from 'react';
import { Send, Wallet, Upload, CheckCircle, RefreshCcw, Archive, Star } from 'lucide-react';

const ActionButtons = ({ role, status, agreementId, onAction, disabled }) => {
    // role: 'provider' | 'seeker'

    const Button = ({ children, onClick, variant = 'primary', icon: Icon, ...props }) => {
        const variants = {
            primary: 'bg-brand-navy text-white hover:bg-slate-800 shadow-brand-navy/20',
            emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20',
            outline: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
        };

        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className={`${variants[variant]} flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl`}
                {...props}
            >
                {Icon && <Icon className="w-4 h-4" />}
                {children}
            </button>
        );
    };

    if (role === 'provider') {
        switch (status) {
            case 'Selected':
                return <Button onClick={() => onAction('create')} icon={Send}>
                    {agreementId ? "Update Agreement" : "Create & Send Agreement"}
                </Button>
            case 'Accepted':
                return <Button onClick={() => onAction('deposit')} variant="emerald" icon={Wallet}>Deposit Money on Blockchain</Button>;
            case 'InProgress':
                return <p className="text-xs font-bold text-slate-500 italic">Work in progress. Waiting for seeker to submit work...</p>;
            case 'Submitted':
                return (
                    <Button onClick={() => onAction('approve_work')} variant="emerald" icon={CheckCircle}>Confirm Work & Release Funds</Button>
                );
            case 'Payment Released':
                return <p className="text-xs font-bold text-slate-500 italic">Funds released. Waiting for seeker to confirm receipt...</p>;
            case 'Completed':
                return (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex flex-col items-center justify-center gap-1">
                        <CheckCircle className="w-5 h-5 mb-1 text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Project Complete</p>
                        <p className="text-xs font-bold text-emerald-600 text-center">Work approved and payment released.</p>
                    </div>
                );
            default:
                return <p className="text-xs font-bold text-slate-400 italic">Waiting for Seeker action...</p>;
        }
    }

    if (role === 'seeker') {
        switch (status) {
            case 'Agreement Pending':
                return (
                    <div className="flex flex-col gap-3 w-full">
                        <Button onClick={() => onAction('accept')} variant="emerald" icon={CheckCircle}>Accept Agreement</Button>
                        <Button onClick={() => onAction('reject')} variant="outline">Reject</Button>
                    </div>
                );
            case 'Accepted':
                return <p className="text-xs font-bold text-slate-500 italic">Waiting for Provider to deposit funds on the blockchain...</p>;
            case 'InProgress':
                return <Button onClick={() => onAction('show_submit_form')} variant="primary" icon={Upload}>Submit Work</Button>;
            case 'Submitted':
                return <p className="text-xs font-bold text-slate-500 italic">Work submitted. Waiting for Provider approval...</p>;
            case 'Payment Released':
                return <Button onClick={() => onAction('confirm_payment')} variant="emerald" icon={CheckCircle}>Confirm Funds Received</Button>;
            case 'Completed':
                return (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex flex-col items-center justify-center gap-1">
                        <Wallet className="w-5 h-5 mb-1 text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Payment Complete</p>
                        <p className="text-xs font-bold text-emerald-600 text-center">Funds successfully received in your wallet!</p>
                    </div>
                );
            default:
                return <p className="text-xs font-bold text-slate-400 italic">Waiting for Provider action...</p>;
        }
    }

    return null;
};

export default ActionButtons;
