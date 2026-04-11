import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Clipboard, Share } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../api/axios';
import Loading from '../../components/Loading';

const Wallet = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [walletData, setWalletData] = useState(null);
    const [creatingWallet, setCreatingWallet] = useState(false);

    const fetchWalletData = async () => {
        try {
            const response = await api.get('/accounts/wallet-dashboard/');
            setWalletData(response.data);
        } catch (error) {
            console.error("Error fetching wallet data:", error);
            Alert.alert("Error", "Failed to load wallet information.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchWalletData();
    }, []);

    const handleCreateWallet = async () => {
        setCreatingWallet(true);
        try {
            const response = await api.post('/accounts/create-managed-wallet/');
            Alert.alert("Success", "Managed wallet created successfully!");
            fetchWalletData();
        } catch (error) {
            console.error("Error creating wallet:", error);
            Alert.alert("Error", error.response?.data?.detail || "Failed to create wallet.");
        } finally {
            setCreatingWallet(false);
        }
    };

    const copyToClipboard = (text) => {
        // Expo doesn't have a built-in Clipboard in core anymore, but we can use Alert for demo or assuming user has it
        // For now, let's just alert
        Alert.alert("Address Copied", text);
    };

    const StatusBadge = ({ type }) => {
        const getStyle = () => {
            switch (type) {
                case 'income': return { bg: '#ecfdf5', text: '#059669', icon: 'trending-up' };
                case 'escrow_lock': return { bg: '#fef3c7', text: '#d97706', icon: 'lock' };
                case 'escrow_release': return { bg: '#eff6ff', text: '#2563eb', icon: 'unlock' };
                case 'deposit': return { bg: '#f0fdf4', text: '#16a34a', icon: 'plus-circle' };
                case 'withdrawal': return { bg: '#fef2f2', text: '#dc2626', icon: 'arrow-up-right' };
                default: return { bg: '#f1f5f9', text: '#64748b', icon: 'help-circle' };
            }
        };
        const style = getStyle();
        return (
            <View style={[styles.badge, { backgroundColor: style.bg }]}>
                <Feather name={style.icon} size={10} color={style.text} style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { color: style.text }]}>{type.replace('_', ' ').toUpperCase()}</Text>
            </View>
        );
    };

    if (loading) return <Loading message="Accessing secure wallet..." />;

    if (!walletData?.wallet_address) {
        return (
            <View style={styles.container}>
                <View style={styles.hero}>
                    <Text style={styles.heroTitle}>Your Wallet</Text>
                    <Text style={styles.heroSubtitle}>Secure your payments on the blockchain</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <View style={styles.iconCircle}>
                        <Feather name="shield" size={40} color="#4f46e5" />
                    </View>
                    <Text style={styles.emptyTitle}>Manage Your Funds</Text>
                    <Text style={styles.emptyDesc}>
                        Create a managed wallet to start accepting and sending secure blockchain payments. We handle the security while you focus on work.
                    </Text>
                    <TouchableOpacity 
                        style={styles.createButton} 
                        onPress={handleCreateWallet}
                        disabled={creatingWallet}
                    >
                        {creatingWallet ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Feather name="plus" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.createButtonText}>Create Managed Wallet</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.hero}>
                <View style={styles.heroHeader}>
                    <View>
                        <Text style={styles.heroTitle}>Wallet Balance</Text>
                        <Text style={styles.balanceText}>{walletData.available_balance} <Text style={styles.currencyCode}>MATIC</Text></Text>
                    </View>
                    <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
                        <Feather name="refresh-cw" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.addressContainer}>
                    <Text style={styles.addressLabel}>Your Address</Text>
                    <TouchableOpacity style={styles.addressRow} onPress={() => copyToClipboard(walletData.wallet_address)}>
                        <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                            {walletData.wallet_address}
                        </Text>
                        <Feather name="copy" size={14} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Locked Escrow</Text>
                    <Text style={[styles.statValue, { color: '#d97706' }]}>{walletData.locked_escrow} MATIC</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Earned</Text>
                    <Text style={[styles.statValue, { color: '#059669' }]}>{walletData.total_earned} MATIC</Text>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Transaction History</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            {walletData.history?.length > 0 ? (
                walletData.history.map((tx, index) => (
                    <View key={tx.id || index} style={styles.txCard}>
                        <View style={styles.txIcon}>
                            <Feather 
                                name={tx.type === 'income' || tx.type === 'deposit' ? 'arrow-down-left' : 'arrow-up-right'} 
                                size={20} 
                                color={tx.type === 'income' || tx.type === 'deposit' ? '#059669' : '#dc2626'} 
                            />
                        </View>
                        <View style={styles.txMain}>
                            <View style={styles.txHeader}>
                                <Text style={styles.txTitle} numberOfLines={1}>{tx.description || tx.type.replace('_', ' ')}</Text>
                                <Text style={[styles.txAmount, { color: tx.type === 'income' || tx.type === 'deposit' ? '#059669' : '#1e293b' }]}>
                                    {tx.type === 'income' || tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                                </Text>
                            </View>
                            <View style={styles.txFooter}>
                                <Text style={styles.txDate}>
                                    {new Date(tx.timestamp).toLocaleDateString()}
                                </Text>
                                <StatusBadge type={tx.type} />
                            </View>
                            {tx.tx_hash && (
                                <TouchableOpacity style={styles.txHashRow} onPress={() => Alert.alert("TX Hash", tx.tx_hash)}>
                                    <Feather name="hash" size={10} color="#94a3b8" />
                                    <Text style={styles.txHashText} numberOfLines={1}>
                                        {tx.tx_hash}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))
            ) : (
                <View style={styles.emptyTransactions}>
                    <Feather name="list" size={40} color="#cbd5e1" />
                    <Text style={styles.emptyTransactionsText}>No transactions yet</Text>
                </View>
            )}
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hero: {
        backgroundColor: '#4f46e5',
        padding: 24,
        paddingTop: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    heroTitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 4,
    },
    balanceText: {
        color: '#ffffff',
        fontSize: 36,
        fontWeight: '900',
        marginTop: 4,
    },
    currencyCode: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.6)',
    },
    refreshBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    addressContainer: {
        marginTop: 8,
    },
    addressLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        padding: 10,
        borderRadius: 12,
    },
    addressText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'monospace',
        flex: 1,
        marginRight: 8,
    },
    statsRow: {
        flexDirection: 'row',
        padding: 16,
        marginTop: -20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        margin: 8,
        padding: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statLabel: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
    },
    viewAllText: {
        color: '#4f46e5',
        fontSize: 13,
        fontWeight: '700',
    },
    txCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
    },
    txIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    txMain: {
        flex: 1,
    },
    txHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    txTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
        flex: 1,
        marginRight: 8,
    },
    txAmount: {
        fontSize: 15,
        fontWeight: '800',
    },
    txFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    txDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '900',
    },
    txHashRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    txHashText: {
        fontSize: 10,
        color: '#94a3b8',
        marginLeft: 4,
        fontFamily: 'monospace',
    },
    emptyContainer: {
        flex: 1,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1e293b',
        textAlign: 'center',
    },
    emptyDesc: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 22,
        marginBottom: 32,
    },
    createButton: {
        backgroundColor: '#4f46e5',
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    emptyTransactions: {
        padding: 60,
        alignItems: 'center',
    },
    emptyTransactionsText: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 12,
    }
});

export default Wallet;
