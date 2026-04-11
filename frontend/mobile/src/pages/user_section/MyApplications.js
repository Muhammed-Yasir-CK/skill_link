import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, RefreshControl, TouchableOpacity, FlatList, Alert, Image } from 'react-native';
import api from '../../api/axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Header from '../../components/Header';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { useNavigation } from '@react-navigation/native';

const getStatusColor = (status) => {
    switch (status) {
        case "Pending": return { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" };
        case "Review": return { color: "#9333ea", bg: "#faf5ff", border: "#e9d5ff" };
        case "Shortlist": return { color: "#4f46e5", bg: "#eef2ff", border: "#e0e7ff" };
        case "Interview": return { color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
        case "Selected": return { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
        case "Rejected": return { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
        default: return { color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" };
    }
};

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();

    const fetchApplications = async () => {
        try {
            const res = await api.get('my-applications/');
            setApplications(res.data);
        } catch (error) {
            console.error('Failed to fetch applications', error);
            Alert.alert("Error", "Failed to fetch your applications.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchApplications();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header />
                <Loading message="Loading applications..." />
            </SafeAreaView>
        );
    }

    const renderItem = ({ item: app }) => (
        <TouchableOpacity 
            style={styles.appCard}
            onPress={() => navigation.navigate('JobDetails', { 
                id: `${app.job_source === 'company' ? 'company' : 'work'}_${app.job_source === 'company' ? app.company_job_id : app.user_job_id}` 
            })}
        >
            <View style={styles.cardInfo}>
                {app.company_logo ? (
                    <Image 
                        source={{ uri: app.company_logo }} 
                        style={styles.companyIcon} 
                    />
                ) : (
                    <View style={styles.companyIconFallback}>
                        <Text style={styles.companyInitial}>
                            {app.company_name?.[0] || 'C'}
                        </Text>
                    </View>
                )}
                <View style={styles.textGroup}>
                    <Text style={styles.roleText}>{app.job_title}</Text>
                    <Text style={styles.companyMeta}>
                        {app.company_name} • Applied {new Date(app.applied_at).toLocaleDateString()}
                    </Text>
                </View>
            </View>
            <View style={styles.actionCol}>
                <View
                    style={[
                        styles.statusBadge,
                        { 
                            backgroundColor: getStatusColor(app.status).bg, 
                            borderColor: getStatusColor(app.status).border 
                        }
                    ]}
                >
                    <Text style={[styles.statusText, { color: getStatusColor(app.status).color }]}>
                        {app.status}
                    </Text>
                </View>
                {app.status === "Selected" && app.job_source === "user" && (
                    <TouchableOpacity 
                        style={styles.viewAgreementBtn}
                        onPress={() => navigation.navigate('AgreementDetails', { applicationId: app.id })}
                    >
                        <Feather name="file-text" size={12} color="#fff" />
                        <Text style={styles.viewAgreementText}>Agreement</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <FlatList
                data={applications}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListHeaderComponent={<Text style={styles.headerTitle}>Applications Tracker</Text>}
                ListEmptyComponent={
                    <EmptyState 
                        title="No Applications Yet" 
                        message="You haven't applied to any jobs or gigs yet."
                        icon="file-text"
                    />
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollWrapper: {
        padding: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 20,
    },
    list: {
        gap: 16,
        paddingBottom: 40,
    },
    appCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 1 }
        })
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    companyIcon: {
        width: 48,
        height: 48,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    companyIconFallback: {
        width: 48,
        height: 48,
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    companyInitial: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#475569',
    },
    textGroup: {
        flex: 1,
    },
    roleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 2,
    },
    companyMeta: {
        fontSize: 12,
        color: '#64748b',
    },
    actionCol: {
        alignItems: 'flex-end',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    viewAgreementBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#059669',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    viewAgreementText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    emptyText: {
        marginTop: 12,
        fontSize: 15,
        color: '#64748b',
        fontWeight: '500'
    }
});

export default MyApplications;
