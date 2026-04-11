import React, { useState, useEffect } from 'react';
import { Wallet, Copy, ShieldCheck, Activity, ArrowRightLeft, Lock, ArrowUpRight, ArrowDownLeft, Send, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const API_BASE = "http://localhost:8000/api/accounts";

const WalletSettings = ({ initialWalletAddress, onUpdate }) => {
    const { user } = useAuth();
    const [walletState, setWalletState] = useState({
        walletAddress: initialWalletAddress || '',
        network: 'Unknown',
        isConnected: !!initialWalletAddress,
        walletType: 'external',
    });
    
    const [dashboard, setDashboard] = useState({
        available: 0,
        locked: 0,
        earned: 0,
        history: []
    });
    
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({ address: '', amount: '' });
    
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch(`${API_BASE}/me/`, {
                    headers: getAuthHeaders()
                });
                if (res.ok) {
                    const data = await res.json();
                    setWalletState(prev => ({
                        ...prev,
                        walletAddress: data.wallet_address || '',
                        walletType: data.wallet_type || 'external',
                        isConnected: !!data.wallet_address
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch wallet type", err);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        if (walletState.isConnected && walletState.walletType === 'managed') {
            fetchDashboard();
        }
    }, [walletState.isConnected, walletState.walletType]);

    const fetchDashboard = async () => {
        setRefreshing(true);
        try {
            const res = await fetch(`${API_BASE}/wallet-dashboard/`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setDashboard({
                    available: data.available_balance,
                    locked: data.locked_escrow,
                    earned: data.total_earned,
                    history: data.history
                });
            }
        } catch (err) {
            console.error("Dashboard fetch error", err);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (initialWalletAddress) {
            setWalletState(prev => ({
                ...prev,
                walletAddress: initialWalletAddress,
                isConnected: true
            }));
            checkNetwork();
        }
    }, [initialWalletAddress]);

    const checkNetwork = async () => {
        if (window.ethereum) {
            try {
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                updateNetworkDisplay(chainId);
            } catch (err) {
                console.error("Network check failed", err);
            }
        }
    };

    const updateNetworkDisplay = (chainId) => {
        const networkName = chainId === '0x89' ? 'Polygon Mainnet' :
            chainId === '0x13881' ? 'Polygon Mumbai' :
                'Unknown/Unsupported Network';
        setWalletState(prev => ({ ...prev, network: networkName }));
    };

    const getAuthHeaders = () => ({
        "Authorization": `Bearer ${localStorage.getItem("access")}`,
        "Content-Type": "application/json"
    });

    const handleCreateManagedWallet = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/create-managed-wallet/`, {
                method: "POST",
                headers: getAuthHeaders()
            });

            if (res.ok) {
                const data = await res.json();
                setWalletState({
                    isConnected: true,
                    walletAddress: data.wallet_address,
                    network: 'Polygon (Managed)',
                    walletType: 'managed'
                });
                setMessage({ type: 'success', text: 'Dashboard wallet generated successfully!' });
                if (onUpdate) onUpdate(data.wallet_address);
            } else {
                throw new Error("Failed to create managed wallet");
            }
        } catch (err) {
            console.error("Managed wallet creation error", err);
            setMessage({ type: 'error', text: 'Failed to create dashboard wallet' });
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if(!window.confirm("Are you sure you want to remove this wallet from your account?")) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/update-wallet/`, {
                method: "PATCH",
                headers: getAuthHeaders(),
                body: JSON.stringify({ wallet_address: "", wallet_type: "managed" })
            });
            if (res.ok) {
                setWalletState({ isConnected: false, walletAddress: '', network: 'Unknown', walletType: 'managed' });
                setMessage({ type: 'success', text: 'Wallet removed' });
                if (onUpdate) onUpdate('');
            }
        } catch (err) {
            console.error("Disconnect error", err);
            setMessage({ type: 'error', text: 'Failed to remove wallet' });
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if(dashboard.available <= 0) {
            setMessage({ type: 'error', text: 'No available MATIC to withdraw.' });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/withdraw-matic/`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ target_address: withdrawForm.address, amount: withdrawForm.amount })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `Successfully withdrawn MATIC!` });
                setShowWithdraw(false);
                setWithdrawForm({ address: '', amount: '' });
                fetchDashboard();
            } else {
                setMessage({ type: 'error', text: data.error || 'Withdrawal failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Withdrawal request failed' });
        } finally {
            setLoading(false);
        }
    };

    const getTransactionIcon = (type) => {
        switch(type) {
            case 'deposit': return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
            case 'escrow_lock': return <Lock className="w-4 h-4 text-amber-600" />;
            case 'income': return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
            case 'withdrawal': return <ArrowUpRight className="w-4 h-4 text-rose-600" />;
            default: return <ArrowRightLeft className="w-4 h-4 text-slate-600" />;
        }
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-indigo-600" /> Web3 Payment Dashboard
                </h3>
                {walletState.isConnected && walletState.walletType === 'managed' && (
                    <button 
                        onClick={fetchDashboard} 
                        className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Sync
                    </button>
                )}
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    <ShieldCheck className="w-4 h-4" />
                    {message.text}
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto text-slate-400 hover:text-slate-600">×</button>
                </div>
            )}

            {!walletState.isConnected ? (
                <div className="space-y-6">
                    <div className="p-8 bg-gradient-to-br from-indigo-50/50 to-white rounded-3xl border-2 border-indigo-100 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200">
                                <Activity className="w-8 h-8" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="text-xl font-black text-indigo-900 mb-1">SkillLink Web3 Wallet</h4>
                                <p className="text-slate-500 font-medium text-sm">
                                    Create a secure blockchain wallet managed directly in your dashboard. This allows you to handle fiat payments, escrow locks, and physical crypto withdrawals directly on the Polygon network.
                                </p>
                            </div>
                            <button
                                onClick={handleCreateManagedWallet}
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Web3 Wallet'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-1">Available Balance</p>
                                <h2 className="text-3xl font-black flex items-baseline gap-2">
                                    {dashboard.available} <span className="text-base text-indigo-300">MATIC</span>
                                </h2>
                            </div>
                            <Wallet className="w-24 h-24 text-indigo-500/30 absolute -bottom-4 -right-4 -rotate-12" />
                        </div>
                        
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Locked in Escrow</p>
                                <h2 className="text-3xl font-black text-slate-800 flex items-baseline gap-2">
                                    {dashboard.locked} <span className="text-base text-slate-400">MATIC</span>
                                </h2>
                            </div>
                            <Lock className="w-24 h-24 text-slate-50 absolute -bottom-4 -right-4 -rotate-12" />
                        </div>

                        <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-emerald-600/70 text-xs font-black uppercase tracking-widest mb-1">Total Earned</p>
                                <h2 className="text-3xl font-black text-emerald-700 flex items-baseline gap-2">
                                    {dashboard.earned} <span className="text-base text-emerald-600/50">MATIC</span>
                                </h2>
                            </div>
                            <ShieldCheck className="w-24 h-24 text-emerald-100 absolute -bottom-4 -right-4 -rotate-12" />
                        </div>
                    </div>

                    {/* Actions and Address */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="font-black text-slate-900 text-xs uppercase tracking-widest">
                                    Polygon Network Active
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowWithdraw(!showWithdraw)}
                                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                                >
                                    <Send className="w-3.5 h-3.5" /> Withdraw MATIC
                                </button>
                                <button
                                    onClick={handleDisconnect}
                                    disabled={loading}
                                    className="px-5 py-2 text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-tighter bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                >
                                    {loading ? 'Removing...' : 'Remove'}
                                </button>
                            </div>
                        </div>
                        
                        {/* Withdraw Form Dropdown */}
                        {showWithdraw && (
                            <div className="p-8 bg-indigo-50/50 border-b border-indigo-100">
                                <h4 className="font-black text-indigo-900 mb-4 flex items-center gap-2 uppercase tracking-wide text-sm">
                                    <ExternalLink className="w-4 h-4" /> Withdraw to External Wallet
                                </h4>
                                <form onSubmit={handleWithdraw} className="flex flex-col md:flex-row gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Polygon target address (0x...)" 
                                        required
                                        className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-0 text-sm font-mono outline-none"
                                        value={withdrawForm.address}
                                        onChange={e => setWithdrawForm({...withdrawForm, address: e.target.value})}
                                    />
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            step="0.0001"
                                            placeholder="Amount" 
                                            required
                                            max={dashboard.available}
                                            className="w-full md:w-32 pl-4 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-0 text-sm outline-none"
                                            value={withdrawForm.amount}
                                            onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                                        />
                                        <span className="absolute right-4 top-3 text-xs font-black text-slate-400 uppercase">MAT</span>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Execute
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="p-8">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Dashboard Address</label>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                <span className="font-mono text-slate-700 font-bold text-sm truncate flex-1">
                                    {walletState.walletAddress}
                                </span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(walletState.walletAddress);
                                        setMessage({ type: 'success', text: 'Address copied to clipboard!' });
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2"
                                >
                                    <Copy className="w-3.5 h-3.5" /> Copy
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Transaction History</h4>
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            {dashboard.history.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {dashboard.history.map((tx) => (
                                        <div key={tx.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                    {getTransactionIcon(tx.type)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 mb-0.5">{tx.description || tx.type}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        {new Date(tx.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-base font-black ${
                                                    tx.type === 'deposit' || tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                                                }`}>
                                                    {tx.type === 'escrow_lock' || tx.type === 'withdrawal' ? '-' : '+'}{tx.amount} <span className="text-[10px] text-slate-500">MATIC</span>
                                                </p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                                                    {tx.tx_hash ? <span className="truncate w-24">{tx.tx_hash}</span> : 'System Transfer'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-400 text-sm font-black uppercase tracking-widest">
                                    <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    No transactions yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default WalletSettings;
