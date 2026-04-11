import React from 'react';
import { Wallet, ShieldCheck, Hash, ExternalLink } from 'lucide-react';

const PaymentDetails = ({ data, isEditing, onUpdate }) => {
    return (
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" /> Financial Terms
                {isEditing && <span className="ml-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] normal-case tracking-normal">Editing</span>}
            </h3>

            <div className="space-y-6">
                {/* Amount Display */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-2">Total Contract Value</p>
                    <div className="flex items-baseline gap-2">
                        {isEditing ? (
                            <>
                                <input
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) => onUpdate({ ...data, amount: e.target.value })}
                                    className="w-24 text-4xl font-black text-white bg-transparent border-b border-white/20 outline-none focus:border-emerald-400 pb-1"
                                    placeholder="0.00"
                                />
                                <input
                                    type="text"
                                    value={data.currency}
                                    onChange={(e) => onUpdate({ ...data, currency: e.target.value })}
                                    className="w-16 text-emerald-400 font-bold text-sm tracking-widest uppercase bg-transparent border-b border-white/20 outline-none focus:border-emerald-400 pb-1"
                                    placeholder="ETH"
                                />
                            </>
                        ) : (
                            <>
                                <span className="text-4xl font-black text-white">{data.amount}</span>
                                <span className="text-emerald-400 font-bold text-sm tracking-widest uppercase">{data.currency || 'USD'}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Terms Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Payment Method</p>
                        <p className="text-xs font-bold flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {data.method || 'Blockchain Wallet'}
                        </p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">Release Strategy</p>
                        {isEditing ? (
                            <textarea
                                value={data.release_strategy || ""}
                                onChange={(e) => onUpdate({ ...data, release_strategy: e.target.value })}
                                className="w-full text-xs font-bold bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-emerald-400 min-h-[60px] resize-y"
                                placeholder="E.g., Release upon final code approval"
                            />
                        ) : (
                            <p className="text-xs font-bold">{data.release_strategy || 'On Approval'}</p>
                        )}
                    </div>
                </div>

                {/* Blockchain Info */}
                {data.txHash && (
                    <div className="pt-4 border-t border-white/10 space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-2 flex items-center gap-2">
                                <Hash className="w-3.5 h-3.5" /> Blockchain Transaction
                            </p>
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-emerald-500/20 transition-all">
                                <p className="text-[10px] font-mono text-emerald-400 truncate pr-4">{data.txHash}</p>
                                <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0" />
                            </div>
                        </div>

                        {data.on_chain_id !== undefined && data.on_chain_id !== null && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Smart Contract Agreement ID
                                </p>
                                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl inline-block">
                                    <span className="text-xs font-mono font-bold text-indigo-400">#{data.on_chain_id}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentDetails;
