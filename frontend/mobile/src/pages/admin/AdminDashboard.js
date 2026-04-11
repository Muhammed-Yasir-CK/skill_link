import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../api/axios';
import Loading from '../../components/Loading';

const StatCard = ({ title, value, icon, color }) => (
    <View style={styles.statCard}>
        <View style={[styles.statIconWrapper, { backgroundColor: color }]}>
            <Feather name={icon} size={24} color="#fff" />
        </View>
        <View style={styles.statInfo}>
            <Text style={styles.statLabel}>{title}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </View>
    </View>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await api.get('accounts/admin/stats/');
            const data = res.data;
            setStats([
                { title: 'Job Seekers', value: data.seekers.toLocaleString(), icon: 'users', color: '#3b82f6' },
                { title: 'Companies', value: data.companies.toLocaleString(), icon: 'briefcase', color: '#a855f7' },
                { title: 'Active Jobs', value: data.jobs.toLocaleString(), icon: 'list', color: '#10b981' },
                { title: 'Pending', value: data.pending.toLocaleString(), icon: 'alert-triangle', color: '#ef4444' },
            ]);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
            Alert.alert("Error", "Failed to load dashboard statistics.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchStats();
    }, []);

    if (loading) {
        return <Loading message="Loading admin dashboard..." />;
    }

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Dashboard Overview</Text>
                <Text style={styles.subtitle}>Real-time platform metrics</Text>
            </View>

            <View style={styles.statsGrid}>
                {stats?.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.activityCard}>
                    <View style={styles.activityItem}>
                        <View style={styles.activityDot} />
                        <View style={styles.activityMain}>
                            <Text style={styles.activityUser}>System</Text>
                            <Text style={styles.activityAction}>Dashboard synchronized with database</Text>
                        </View>
                        <Text style={styles.activityTime}>Just now</Text>
                    </View>
                    {/* Parity with web: only one mock activity shown */}
                </View>
            </View>

            <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Quick Management</Text>
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionItem}>
                        <Feather name="shield" size={20} color="#0f172a" />
                        <Text style={styles.actionText}>SecurityAudit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem}>
                        <Feather name="database" size={20} color="#0f172a" />
                        <Text style={styles.actionText}>Backup</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    header: {
        padding: 24,
        paddingTop: 40,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
    },
    statCard: {
        width: '50%',
        padding: 12,
    },
    statIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    statInfo: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
    },
    section: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 16,
    },
    activityCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3b82f6',
        marginRight: 16,
    },
    activityMain: {
        flex: 1,
    },
    activityUser: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    activityAction: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    activityTime: {
        fontSize: 11,
        color: '#94a3b8',
    },
    quickActions: {
        paddingHorizontal: 24,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    actionItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        gap: 8,
    },
    actionText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#0f172a',
    }
});

export default AdminDashboard;
