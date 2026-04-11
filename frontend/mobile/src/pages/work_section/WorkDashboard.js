import React, { useState, useEffect, useCallback } from 'react';
import Loading from '../../components/Loading';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import Header from '../../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';

const WorkDashboard = () => {
    const navigation = useNavigation();
    const [stats, setStats] = useState([
        { label: 'Active Works', value: '0', color: '#3b82f6', key: 'active' },
        { label: 'Applicants', value: '0', color: '#f59e0b', key: 'applicants' },
        { label: 'In Progress', value: '0', color: '#6366f1', key: 'in_progress' },
        { label: 'Completed', value: '0', color: '#10b981', key: 'completed' },
    ]);
    const [activities, setActivities] = useState([]);

    const fetchData = async () => {
        try {
            // Fetch Stats
            const statsRes = await api.get('work-stats/');
            const s = statsRes.data;
            setStats(prev => prev.map(item => ({
                ...item,
                value: String(s[item.key] || 0)
            })));

            // Fetch Recent Activities
            const activityRes = await api.get('work-activity/');
            setActivities(activityRes.data.slice(0, 5));

            // Fetch Recent Works
            const workRes = await api.get('work-posts/');
            setRecentWorks(workRes.data.slice(0, 3));
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            Alert.alert("Error", "Failed to fetch dashboard data.");
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
        return <Loading message="Loading work dashboard..." />;
    }

    const totalApplicants = stats.find(s => s.key === 'applicants')?.value || '0';

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
            >
                {/* Hero Section */}
                <View style={styles.hero}>
                    <Text style={styles.heroTitle}>Manage your works</Text>
                    <Text style={styles.heroSub}>
                        {totalApplicants > 0 
                            ? `You have ${totalApplicants} applicants waiting for review. Check them out or post a new requirement.`
                            : "Track your job postings and applicants in real-time."
                        }
                    </Text>
                    <TouchableOpacity 
                        style={styles.postBtn}
                        onPress={() => navigation.navigate('PostWork')}
                    >
                        <Feather name="plus" size={18} color="#4f46e5" />
                        <Text style={styles.postBtnText}>Post New Work</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        {stats.map((stat, idx) => (
                            <View key={idx} style={styles.statCard}>
                                <View style={[styles.statDot, { backgroundColor: stat.color }]} />
                                <Text style={styles.statLabel}>{stat.label}</Text>
                                <Text style={styles.statValue}>{stat.value}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Recent Updates */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Feather name="clock" size={18} color="#4f46e5" />
                            <Text style={styles.sectionTitle}>Recent Updates</Text>
                        </View>
                        <View style={styles.updateCardList}>
                            {activities.length === 0 ? (
                                <Text style={styles.emptyText}>No recent updates.</Text>
                            ) : (
                                activities.map((activity, idx) => (
                                    <View key={idx} style={[styles.updateItem, { 
                                        backgroundColor: activity.type === 'application' ? '#fffbeb' : '#ecfdf5', 
                                        borderColor: activity.type === 'application' ? '#fef3c7' : '#d1fae5' 
                                    }]}>
                                        <View style={[styles.updateIcon, { 
                                            backgroundColor: activity.type === 'application' ? '#fde68a' : '#a7f3d0' 
                                        }]}>
                                            {activity.type === 'application' ? (
                                                <Text style={[styles.updateIconText, { color: '#b45309' }]}>+</Text>
                                            ) : (
                                                <Feather name="check-circle" size={16} color="#047857" />
                                            )}
                                        </View>
                                        <View style={styles.updateContent}>
                                            <Text style={styles.updateText}>{activity.description}</Text>
                                            <Text style={styles.updateTime}>{activity.time_ago}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>

                    {/* Quick Actions / Recent Works */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Recent Works</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('MyWorks')}>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.worksList}>
                            {recentWorks.length === 0 ? (
                                <Text style={styles.emptyText}>No recent works found.</Text>
                            ) : (
                                recentWorks.map(work => (
                                    <View key={work.id} style={styles.workItem}>
                                        <View style={styles.workMain}>
                                            <Text style={styles.workTitle}>{work.title}</Text>
                                            <View style={styles.workMeta}>
                                                <View style={[styles.statusBadge, 
                                                    work.status === 'Active' ? { backgroundColor: '#dbeafe' } :
                                                    work.status === 'In Progress' ? { backgroundColor: '#e0e7ff' } :
                                                    { backgroundColor: '#d1fae5' }
                                                ]}>
                                                    <Text style={[styles.statusText,
                                                        work.status === 'Active' ? { color: '#1d4ed8' } :
                                                        work.status === 'In Progress' ? { color: '#4338ca' } :
                                                        { color: '#047857' }
                                                    ]}>{work.status || 'Active'}</Text>
                                                </View>
                                                <Text style={styles.postedTime}>• Posted {new Date(work.created_at).toLocaleDateString()}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.applicantBadge}>
                                            <Feather name="users" size={12} color="#d97706" />
                                            <Text style={styles.applicantCount}>{work.applicant_count || 0}</Text>
                                        </View>
                                    </View>
                                ))
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
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    hero: {
        backgroundColor: '#4f46e5',
        padding: 24,
        paddingTop: 32,
        paddingBottom: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    heroSub: { fontSize: 14, color: '#e0e7ff', lineHeight: 20, marginBottom: 20 },
    postBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
        alignSelf: 'flex-start',
    },
    postBtnText: { color: '#4f46e5', fontWeight: 'bold', fontSize: 15 },
    content: { padding: 20, marginTop: -20 },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    statDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 12 },
    statLabel: { fontSize: 11, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
    section: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    viewAllText: { fontSize: 13, fontWeight: 'bold', color: '#4f46e5' },
    updateCardList: { gap: 12 },
    updateItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    updateIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    updateIconText: { fontWeight: 'bold', fontSize: 13 },
    updateContent: { flex: 1 },
    updateText: { fontSize: 13, color: '#1e293b', lineHeight: 20 },
    updateBold: { fontWeight: 'bold' },
    updateTime: { fontSize: 11, color: '#64748b', marginTop: 4 },
    worksList: { gap: 12 },
    workItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    workMain: { flex: 1 },
    workTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 6 },
    workMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    postedTime: { fontSize: 11, color: '#94a3b8' },
    applicantBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#fffbeb',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    applicantCount: { fontSize: 12, fontWeight: 'bold', color: '#b45309' },
    emptyText: { fontSize: 14, color: '#64748b', fontStyle: 'italic' }
});

export default WorkDashboard;
