import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const MyWorks = () => {
    const navigation = useNavigation();
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWorks = async () => {
        try {
            const res = await api.get('/work-posts/');
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
                            await api.delete(`/work-posts/${id}/delete/`);
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
            onPress={() => navigation.navigate('AgreementDetails', { id: work.id })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{work.title}</Text>
                <View style={[styles.statusBadge, 
                    work.status === 'Active' ? { backgroundColor: '#eff6ff' } : { backgroundColor: '#f0fdf4' }
                ]}>
                    <Text style={[styles.statusText, 
                        work.status === 'Active' ? { color: '#3b82f6' } : { color: '#16a34a' }
                    ]}>{work.status}</Text>
                </View>
            </View>
            
            <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                    <Feather name="map-pin" size={12} color="#64748b" />
                    <Text style={styles.metaText}>{work.location}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Feather name="clock" size={12} color="#64748b" />
                    <Text style={styles.metaText}>{new Date(work.created_at).toLocaleDateString()}</Text>
                </View>
            </View>
            
            <View style={styles.cardFooter}>
                <View style={styles.budgetBox}>
                    <Text style={styles.budgetLabel}>Budget</Text>
                    <Text style={styles.budgetValue}>{work.budget_currency} {work.budget_amount}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#cbd5e1" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
                    <Feather name="arrow-left" size={24} color="#0f172a" />
                </TouchableOpacity>
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
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
    listContent: { padding: 20, gap: 16 },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', flex: 1, marginRight: 12 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    cardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    tag: { backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    tagText: { fontSize: 12, fontWeight: 'bold', color: '#4f46e5' },
    tagPlain: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    tagTextPlain: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
    applicantsContainer: { backgroundColor: '#fffbeb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    applicantsText: { fontSize: 12, fontWeight: 'bold', color: '#b45309' },
    actions: { flexDirection: 'row', gap: 12 },
    iconBtn: { padding: 6, backgroundColor: '#f8fafc', borderRadius: 8 },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { marginTop: 16, fontSize: 15, color: '#64748b', fontWeight: '500' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
    closeBtn: { padding: 4 },
    modalScroll: { padding: 20 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    statBox: { width: '47%', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    statLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
    statVal: { fontSize: 14, fontWeight: 'bold', color: '#334155' },
    sectionHeader: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
    descText: { fontSize: 14, color: '#475569', lineHeight: 22 },
    reqItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    reqText: { fontSize: 14, color: '#475569' }
});

export default MyWorks;
