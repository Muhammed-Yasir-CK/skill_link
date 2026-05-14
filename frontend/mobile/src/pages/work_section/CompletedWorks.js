import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';
import Loading from '../../components/Loading';
import Header from '../../components/Header';

const CompletedWorks = () => {
    const navigation = useNavigation();
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCompletedWorks = async () => {
        try {
            const res = await api.get('seeker/completed-works/');
            setWorks(res.data.completed_works || []);
        } catch (error) {
            console.error("Failed to fetch completed works:", error);
            Alert.alert("Error", "Could not fetch completed works history.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCompletedWorks();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCompletedWorks();
    }, []);

    const renderCompletedWorkCard = ({ item }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <Feather name="check-circle" size={24} color="#10b981" />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.companyName}>{item.company}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Completed</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statTag}>
                        <Feather name="map-pin" size={12} color="#64748b" />
                        <Text style={styles.statTagText}>{item.location}</Text>
                    </View>
                    <View style={styles.statTag}>
                        <Feather name="calendar" size={12} color="#64748b" />
                        <Text style={styles.statTagText}>Ended {item.posted}</Text>
                    </View>
                </View>

                <View style={styles.amountBox}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <Text style={styles.amountText}>{item.salary}</Text>
                </View>

                <TouchableOpacity 
                    style={styles.detailsBtn}
                    onPress={() => {
                        if (!item.application_id) {
                            Alert.alert("Info", "No agreement record found for this work.");
                            return;
                        }
                        navigation.navigate('AgreementDetails', { applicationId: item.application_id });
                    }}
                >
                    <Text style={styles.detailsBtnText}>View Agreement</Text>
                    <Feather name="arrow-right" size={16} color="#4f46e5" />
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) return <Loading message="Fetching work history..." />;

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <View style={styles.subHeader}>
                <Text style={styles.headerTitle}>Completed Works</Text>
                <Text style={styles.headerSubtitle}>History of your successful gigs</Text>
            </View>

            <FlatList
                contentContainerStyle={styles.listContent}
                data={works}
                keyExtractor={item => item.id.toString()}
                renderItem={renderCompletedWorkCard}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Feather name="award" size={48} color="#cbd5e1" />
                        </View>
                        <Text style={styles.emptyTitle}>No completed works yet</Text>
                        <Text style={styles.emptyDesc}>Works you complete successfully will appear here.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    subHeader: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#f8fafc' },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    headerSubtitle: { fontSize: 13, color: '#64748b', fontWeight: '500' },
    listContent: { padding: 20, gap: 16 },
    card: { backgroundColor: '#fff', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
    iconContainer: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
    headerText: { flex: 1, marginLeft: 16 },
    title: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    companyName: { fontSize: 13, color: '#64748b', fontWeight: '500', marginTop: 2 },
    statusBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#dcfce7' },
    statusText: { fontSize: 10, fontWeight: 'bold', color: '#15803d', textTransform: 'uppercase' },
    statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 20 },
    statTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#f1f5f9', gap: 6 },
    statTagText: { fontSize: 12, color: '#64748b', fontWeight: 'bold' },
    amountBox: { backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#dcfce7', alignSelf: 'flex-start', marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 2 },
    currencySymbol: { fontSize: 12, color: '#15803d', fontWeight: 'black' },
    amountText: { fontSize: 14, color: '#15803d', fontWeight: 'bold' },
    detailsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 8 },
    detailsBtnText: { fontSize: 14, fontWeight: 'bold', color: '#4f46e5' },
    emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    emptyDesc: { fontSize: 14, color: '#64748b', fontWeight: '500', textAlign: 'center', marginTop: 8, lineHeight: 20 }
});

export default CompletedWorks;
