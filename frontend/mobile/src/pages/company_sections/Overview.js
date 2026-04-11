import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';
import Loading from '../../components/Loading';

const { width } = Dimensions.get('window');

const Overview = ({ company: initialCompany, onNavigate }) => {
    const navigation = useNavigation();
    const [stats, setStats] = useState([
        { label: 'Active Jobs', value: '0', icon: 'briefcase', color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Total Applications', value: '0', icon: 'users', color: '#a855f7', bg: '#f3e8ff' },
        { label: 'Interviews Scheduled', value: '0', icon: 'calendar', color: '#f59e0b', bg: '#fffbeb' },
        { label: 'Shortlisted', value: '0', icon: 'check-circle', color: '#10b981', bg: '#f0fdf4' },
    ]);
    const [logo, setLogo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [detailedCompany, setDetailedCompany] = useState(initialCompany);

    const fetchData = async () => {
        try {
            const [profileRes, statsRes] = await Promise.all([
                api.get('accounts/company/profile/'),
                api.get('accounts/company/stats/')
            ]);

            setDetailedCompany(prev => ({ ...prev, ...profileRes.data }));
            setLogo(profileRes.data.brand_logo);
            
            setStats([
                { label: 'Active Jobs', value: statsRes.data.active_jobs, icon: 'briefcase', color: '#3b82f6', bg: '#eff6ff' },
                { label: 'Total Applications', value: statsRes.data.total_applications, icon: 'users', color: '#a855f7', bg: '#f3e8ff' },
                { label: 'Interviews Scheduled', value: statsRes.data.interviews, icon: 'calendar', color: '#f59e0b', bg: '#fffbeb' },
                { label: 'Shortlisted', value: statsRes.data.shortlisted, icon: 'check-circle', color: '#10b981', bg: '#f0fdf4' },
            ]);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            Alert.alert("Error", "Failed to load company dashboard data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    if (loading) {
        return <Loading message="Loading dashboard..." />;
    }

    return (
        <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4338ca']} />}
        >
            {/* Verification Status Banner */}
            {detailedCompany.verification_status === 'unverified' && (
                <View style={[styles.banner, styles.bannerAmber]}>
                    <Feather name="alert-triangle" size={20} color="#92400e" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.bannerTitleAmber}>Complete Your Profile</Text>
                        <Text style={styles.bannerTextAmber}>Complete business details to request verification.</Text>
                    </View>
                </View>
            )}

            {/* Company Header Card */}
            <View style={styles.headerCard}>
                <View style={styles.profileSection}>
                    <View style={styles.logoContainer}>
                        {logo ? (
                            <Image source={{ uri: logo }} style={styles.logoImage} />
                        ) : (
                            <Text style={styles.logoInitial}>
                                {detailedCompany.company_name?.[0]}
                            </Text>
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.companyName} numberOfLines={1}>
                                {detailedCompany.company_name}
                            </Text>
                            {detailedCompany.verification_status === 'verified' && (
                                <Feather name="shield" size={16} color="#10b981" />
                            )}
                        </View>
                        <View style={styles.metaRow}>
                            <Feather name="mail" size={12} color="#64748b" />
                            <Text style={styles.emailText} numberOfLines={1}>{detailedCompany.email}</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>COMPANY ACCOUNT</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.manageBtn}
                        onPress={() => onNavigate('settings')}
                    >
                        <Feather name="settings" size={16} color="#64748b" />
                        <Text style={styles.manageBtnText}>Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.postBtn}
                        onPress={() => navigation.navigate('CompanyPostJob')}
                    >
                        <Feather name="plus" size={18} color="#fff" />
                        <Text style={styles.postBtnText}>Post Job</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <View key={index} style={styles.statCard}>
                        <View style={styles.statTop}>
                            <View style={[styles.iconBg, { backgroundColor: stat.bg || '#f1f5f9' }]}>
                                <Feather name={stat.icon} size={20} color={stat.color} />
                            </View>
                        </View>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                        <Text style={styles.statValue}>{stat.value}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 400 },
    container: { flex: 1 },
    banner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1 },
    bannerAmber: { backgroundColor: '#fffbeb', borderColor: '#fef3c7' },
    bannerTitleAmber: { fontSize: 14, fontWeight: 'bold', color: '#92400e' },
    bannerTextAmber: { fontSize: 13, color: '#b45309', marginTop: 2 },
    headerCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 24,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 2 }
        })
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    logoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    logoInitial: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#cbd5e1',
    },
    profileInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    companyName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
        maxWidth: width * 0.45,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    emailText: {
        fontSize: 14,
        color: '#64748b',
    },
    badge: {
        backgroundColor: 'rgba(67, 56, 202, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4338ca',
        letterSpacing: 0.5,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    manageBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
        gap: 8,
    },
    manageBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    postBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#1e1b4b',
        gap: 8,
    },
    postBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        paddingBottom: 24,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: (width - 56) / 2, // 2 columns with gaps
        borderWidth: 1,
        borderColor: '#f1f5f9',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4 },
            android: { elevation: 1 }
        })
    },
    statTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconBg: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeBadge: {
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    changeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#16a34a',
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748b',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 4,
    }
});

export default Overview;
