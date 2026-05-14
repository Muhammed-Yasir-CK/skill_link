import React, { useState, useEffect, useCallback } from 'react';
import Loading from '../../components/Loading';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import Header from '../../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../../api/axios';

const WorkDashboard = () => {
    const navigation = useNavigation();
    const [stats, setStats] = useState([
        { label: 'Active', value: '0', color: '#3b82f6', key: 'active_works', icon: 'briefcase' },
        { label: 'Applicants', value: '0', color: '#f59e0b', key: 'pending_applicants', icon: 'users' },
        { label: 'In Progress', value: '0', color: '#6366f1', key: 'in_progress', icon: 'activity' },
        { label: 'Completed', value: '0', color: '#10b981', key: 'completed', icon: 'check-circle' },
    ]);
    const [activities, setActivities] = useState([]);
    const [recentWorks, setRecentWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return '';
        try {
            const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
            if (seconds < 60) return 'Just now';
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes}m ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            return new Date(timestamp).toLocaleDateString();
        } catch (e) { return ''; }
    };

    const fetchData = async () => {
        try {
            const statsRes = await api.get('work-stats/');
            const s = statsRes.data;
            setStats(prev => prev.map(item => ({
                ...item,
                value: String(s[item.key] ?? 0)
            })));

            const activityRes = await api.get('work-activity/');
            const validActivities = (activityRes.data || []).filter(a => a.title || a.detail);
            setActivities(validActivities.slice(0, 5));

            const workRes = await api.get('work-posts/');
            setRecentWorks(workRes.data.slice(0, 3));
        } catch (error) {
            console.error("Dashboard sync failed:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Real-time refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    if (loading) {
        return <Loading message="Loading work dashboard..." />;
    }

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
            >
                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>Work Manager</Text>
                        <Text style={styles.heroSub}>Track your gigs and applicants in real-time.</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.postBtn}
                        onPress={() => navigation.navigate('PostWork')}
                    >
                        <Feather name="plus" size={18} color="#fff" />
                        <Text style={styles.postBtnText}>Post Gig</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        {stats.map((stat, idx) => (
                            <View key={idx} style={styles.statCard}>
                                <View style={[styles.statDot, { backgroundColor: stat.color }]} />
                                <View>
                                    <Text style={styles.statValue}>{stat.value}</Text>
                                    <Text style={styles.statLabel}>{stat.label}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Recent Updates - Header always visible, content conditional */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Feather name="clock" size={18} color="#4f46e5" />
                            <Text style={styles.sectionTitle}>Recent Updates</Text>
                        </View>
                        {activities.length > 0 && (
                            <View style={styles.updateCardList}>
                                {activities.map((activity, idx) => (
                                    <View key={idx} style={[styles.updateItem, { 
                                        backgroundColor: activity.type === 'new_applicant' ? '#fffbeb' : '#ecfdf5', 
                                        borderColor: activity.type === 'new_applicant' ? '#fef3c7' : '#d1fae5' 
                                    }]}>
                                        <View style={[styles.updateIcon, { 
                                            backgroundColor: activity.type === 'new_applicant' ? '#fde68a' : '#a7f3d0' 
                                        }]}>
                                            {activity.type === 'new_applicant' ? (
                                                <Feather name="user-plus" size={14} color="#b45309" />
                                            ) : (
                                                <Feather name="file-text" size={14} color="#047857" />
                                            )}
                                        </View>
                                        <View style={styles.updateContent}>
                                            <Text style={styles.updateText} numberOfLines={1}>{activity.title}</Text>
                                            <View style={styles.updateMeta}>
                                                <Text style={styles.updateDetail}>{activity.detail}</Text>
                                                <View style={styles.statusDotSmall} />
                                                <Text style={styles.updateTime}>{formatTimeAgo(activity.timestamp)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                        {activities.length === 0 && (
                            <Text style={styles.emptyLabel}>No recent activity</Text>
                        )}
                    </View>

                    {/* Quick Actions / Recent Works */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Active Gigs</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('MyWorks')}>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.worksList}>
                            {recentWorks.length > 0 ? (
                                recentWorks.map(work => (
                                    <TouchableOpacity 
                                        key={work.id} 
                                        style={styles.workItem}
                                        onPress={() => navigation.navigate('MyWorks')}
                                    >
                                        <View style={styles.workMain}>
                                            <Text style={styles.workTitle} numberOfLines={1}>{work.title}</Text>
                                            <View style={styles.workMeta}>
                                                <Text style={styles.postedTime}>{work.created_at ? new Date(work.created_at).toLocaleDateString() : 'N/A'}</Text>
                                                <View style={styles.statusDotSmall} />
                                                <Text style={styles.workStatusText}>{work.status || 'Active'}</Text>
                                            </View>
                                        </View>
                                        {work.applicant_count > 0 && (
                                            <View style={styles.applicantBadge}>
                                                <Text style={styles.applicantCount}>{work.applicant_count}</Text>
                                                <Feather name="users" size={10} color="#d97706" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.emptyLabel}>No active gigs found</Text>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    hero: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 32,
        backgroundColor: '#fff',
    },
    heroContent: { flex: 1 },
    heroTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
    heroSub: { fontSize: 13, color: '#64748b', marginTop: 4 },
    postBtn: {
        backgroundColor: '#4f46e5',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        gap: 6,
        elevation: 4,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    postBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    content: { paddingHorizontal: 20 },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    statDot: { width: 6, height: 6, borderRadius: 3 },
    statValue: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    statLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
    section: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    sectionTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
    updateCardList: { gap: 12 },
    updateItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    updateIcon: {
        width: 32,
        height: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    updateIconText: { fontWeight: 'bold', fontSize: 13 },
    updateContent: { flex: 1 },
    updateText: { fontSize: 13, color: '#1e293b', lineHeight: 20, fontWeight: '500' },
    updateMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    updateDetail: { fontSize: 11, color: '#64748b', fontWeight: 'bold' },
    updateTime: { fontSize: 11, color: '#94a3b8' },
    viewAllText: { fontSize: 13, fontWeight: 'bold', color: '#4f46e5' },
    worksList: { gap: 4 },
    workItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    workMain: { flex: 1 },
    workTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
    workMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    postedTime: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
    statusDotSmall: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#cbd5e1' },
    workStatusText: { fontSize: 12, color: '#10b981', fontWeight: 'bold' },
    applicantBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    applicantCount: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
    emptyLabel: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic', paddingVertical: 10 },
    emptyContainer: { alignItems: 'center', paddingVertical: 30, gap: 12 },
    emptyText: { fontSize: 14, color: '#94a3b8', fontWeight: '500' }
});

export default WorkDashboard;
