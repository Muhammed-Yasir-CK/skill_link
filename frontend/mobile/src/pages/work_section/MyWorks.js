import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

import Header from '../../components/Header';

const MyWorks = () => {
    const navigation = useNavigation();
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWorks = async () => {
        try {
            const res = await api.get('work-posts/');
            setWorks(res.data);
        } catch (error) {
            console.error("Failed to fetch works:", error);
            Alert.alert("Error", "Failed to fetch your works.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWorks();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchWorks();
    }, []);

    const handleDelete = async (id) => {
        Alert.alert(
            "Delete Work",
            "Are you sure you want to delete this work post?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`work-posts/${id}/delete/`);
                            setWorks(prev => prev.filter(w => w.id !== id));
                        } catch (err) {
                            Alert.alert("Error", "Failed to delete the post.");
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <Loading message="Loading your works..." />;

    const renderWorkCard = ({ item: work }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('JobDetails', { id: `work_${work.id}` })}
        >
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{work.title}</Text>
                    <Text style={styles.cardSubtitle}>{work.category}</Text>
                </View>
                <View style={[styles.statusBadge, 
                    work.status === 'active' ? { backgroundColor: '#f0fdf4' } : { backgroundColor: '#f1f5f9' }
                ]}>
                    <Text style={[styles.statusText, 
                        work.status === 'active' ? { color: '#16a34a' } : { color: '#64748b' }
                    ]}>{work.status}</Text>
                </View>
            </View>
            
            <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                    <Feather name="map-pin" size={12} color="#64748b" />
                    <Text style={styles.metaText}>{work.city || work.work_nature}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Feather name="clock" size={12} color="#64748b" />
                    <Text style={styles.metaText}>{new Date(work.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Feather name="users" size={12} color="#64748b" />
                    <Text style={styles.metaText}>{work.applicant_count || 0} Apps</Text>
                </View>
            </View>

            {/* Show Agreement Status if it exists */}
            {work.agreement_status && (
                <View style={styles.agreementInfo}>
                    <View style={styles.agreementDot} />
                    <Text style={styles.agreementLabel}>Contract: </Text>
                    <Text style={styles.agreementVal}>{work.agreement_status.replace('_', ' ').toUpperCase()}</Text>
                </View>
            )}
            
            <View style={styles.cardFooter}>
                <View style={styles.budgetBox}>
                    <Text style={styles.budgetLabel}>Budget Range</Text>
                    <Text style={styles.budgetValue}>{work.currency} {work.budget_min} - {work.budget_max}</Text>
                </View>
                <View style={styles.viewDetailsBtn}>
                    <Text style={styles.viewDetailsText}>Details</Text>
                    <Feather name="arrow-right" size={14} color="#4f46e5" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.subHeader}>
                <Text style={styles.headerTitle}>My Works</Text>
            </View>

            <FlatList
                contentContainerStyle={styles.listContent}
                data={works}
                keyExtractor={item => item.id.toString()}
                renderItem={renderWorkCard}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="briefcase" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>You haven't posted any works yet.</Text>
                    </View>
                }
            />


        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    subHeader: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#f8fafc' },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    listContent: { padding: 20, gap: 16 },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    cardTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
    cardSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    agreementInfo: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#f8fafc', 
        padding: 10, 
        borderRadius: 10, 
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    agreementDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4f46e5', marginRight: 8 },
    agreementLabel: { fontSize: 11, fontWeight: 'bold', color: '#64748b' },
    agreementVal: { fontSize: 11, fontWeight: '900', color: '#0f172a' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
    budgetBox: { flex: 1 },
    budgetLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
    budgetValue: { fontSize: 15, fontWeight: '900', color: '#0f172a' },
    viewDetailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    viewDetailsText: { fontSize: 12, fontWeight: 'bold', color: '#4f46e5' },
    emptyContainer: { alignItems: 'center', marginTop: 80, gap: 16 },
    emptyText: { fontSize: 15, color: '#94a3b8', fontWeight: '500' }
});

export default MyWorks;
