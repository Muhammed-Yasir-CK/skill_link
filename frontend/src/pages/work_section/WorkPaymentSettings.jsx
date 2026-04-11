import React, { useState, useEffect } from 'react';
import WalletSettings from '../user_section/components/WalletSettings';

const WorkPaymentSettings = () => {
    const [initialWallet, setInitialWallet] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/accounts/me/", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access")}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setInitialWallet(data.wallet_address || '');
                }
            } catch (err) {
                console.error("Failed to fetch wallet info", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWallet();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hirer Payment Settings</h2>
                    <p className="text-slate-500 font-medium mt-1">Configure your blockchain wallet for secure escrow payments.</p>
                </div>

                <WalletSettings
                    initialWalletAddress={initialWallet}
                    onUpdate={(newAddress) => setInitialWallet(newAddress)}
                />
            </div>

            <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
                <h4 className="text-amber-800 font-bold text-sm mb-2 flex items-center gap-2">
                    💡 Important Security Note
                </h4>
                <p className="text-amber-700 text-xs font-medium leading-relaxed">
                    Always double-check the recipient address when funding an agreement. SkillLink uses a secure, audited smart contract, but blockchain transactions are irreversible once confirmed. Your wallet address is used to verify your identity as the Provider/Hirer in the escrow process.
                </p>
            </div>
        </div>
    );
};

export default WorkPaymentSettings;
