import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Header from '../../components/Header';

const ReceivedApplications = () => {
    const navigation = useNavigation();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchApplications = async () => {
        try {
            const res = await api.get('/worker/received-applications/');
            setApplications(res.data);
        } catch (error) {
            console.error("Failed to fetch applications:", error);
            Alert.alert("Error", "Failed to fetch gig applications.");
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

    const handleAction = async (id, action) => {
        const newStatus = action === 'accept' ? 'Selected' : 'Rejected';
        try {
            setLoading(true);
            const res = await api.patch(`/company/update-application-status/${id}/`, { status: newStatus });
            
            setApplications(prev =>
                prev.map(app => app.id === id ? { ...app, status: res.data.status } : app)
            );
            
            if (selectedApp?.id === id) {
                setSelectedApp({ ...selectedApp, status: res.data.status });
            }
            
            Alert.alert("Success", `Application ${newStatus.toLowerCase()} successfully.`);
        } catch (error) {
            console.error("Status update failed:", error);
            Alert.alert("Error", "Failed to update application status.");
        } finally {
            setLoading(false);
        }
    };

    const openDetails = (app) => {
        setSelectedApp(app);
        setIsModalVisible(true);
    };

    const renderApplicationCard = ({ item: app }) => (
        <TouchableOpacity style={styles.card} onPress={() => openDetails(app)}>
            <View style={styles.cardTop}>
                <Image 
                    source={{ uri: app.avatar || 'https://via.placeholder.com/100' }} 
                    style={styles.avatar} 
                />
                <View style={styles.userInfo}>
                    <Text style={styles.applicantName}>{app.applicantName}</Text>
                    <Text style={styles.applicantRole}>{app.applicantRole}</Text>
                    <Text style={styles.experienceText}>{app.experience} Experience</Text>
                </View>
                <View style={[styles.statusBadge, getStatusStyles(app.status)]}>
                    <Text style={[styles.statusText, { color: getStatusStyles(app.status).color }]}>{app.status}</Text>
                </View>
            </View>
            
            <View style={styles.workInfo}>
                <Text style={styles.workLabel}>Request Reference</Text>
                <Text style={styles.workTitle} numberOfLines={1}>{app.workTitle}</Text>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.dateText}>Applied: {app.date ? new Date(app.date).toLocaleDateString() : 'N/A'}</Text>
                <Feather name="chevron-right" size={16} color="#94a3b8" />
            </View>
        </TouchableOpacity>
    );

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Pending': return { backgroundColor: '#fef3c7', borderColor: '#fcd34d', color: '#b45309' };
            case 'Selected': return { backgroundColor: '#dcfce7', borderColor: '#86efac', color: '#15803d' };
            case 'Rejected': return { backgroundColor: '#fee2e2', borderColor: '#fecaca', color: '#b91c1c' };
            default: return { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', color: '#64748b' };
        }
    };

    const renderDetailModal = () => (
        <Modal
            visible={isModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalHeaderTitle}>Applicant Details</Text>
                        <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeBtn}>
                            <Feather name="x" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                        {selectedApp && (
                            <>
                                <View style={styles.modalHero}>
                                    <View style={styles.avatarWrapper}>
                                        <Image 
                                            source={{ uri: selectedApp.avatar || 'https://via.placeholder.com/150' }} 
                                            style={styles.modalAvatar} 
                                        />
                                        <View style={styles.verifiedBadge}>
                                            <Feather name="shield" size={12} color="#fff" />
                                        </View>
                                    </View>
                                    <Text style={styles.modalName}>{selectedApp.applicantName}</Text>
                                    <Text style={styles.modalRole}>{selectedApp.applicantRole}</Text>
                                </View>

                                <View style={styles.modalSection}>
                                    <Text style={styles.sectionTitle}>WORK REFERENCE</Text>
                                    <Text style={styles.modalWorkTitle}>{selectedApp.workTitle}</Text>
                                </View>

                                <View style={styles.modalSection}>
                                    <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
                                    <View style={styles.summaryBox}>
                                        <Text style={styles.summaryText}>"{selectedApp.profileSummary || 'No summary provided.'}"</Text>
                                    </View>
                                </View>

                                <View style={styles.modalSection}>
                                    <Text style={styles.sectionTitle}>EXPERIENCE</Text>
                                    <Text style={styles.modalInfoText}>{selectedApp.experience}</Text>
                                </View>

                                <View style={styles.modalSection}>
                                    <Text style={styles.sectionTitle}>CONTACT INFO</Text>
                                    <View style={styles.contactRow}>
                                        <Feather name="phone" size={14} color="#94a3b8" />
                                        <Text style={styles.contactText}>{selectedApp.phone || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.contactRow}>
                                        <Feather name="mail" size={14} color="#94a3b8" />
                                        <Text style={styles.contactText}>{selectedApp.email || 'N/A'}</Text>
                                    </View>
                                </View>
                            </>
                        )}
                        <View style={{ height: 40 }} />
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        {selectedApp?.status === 'Pending' ? (
                            <View style={styles.actionRow}>
                                <TouchableOpacity 
                                    style={styles.rejectBtn} 
                                    onPress={() => handleAction(selectedApp.id, 'reject')}
                                >
                                    <Text style={styles.rejectBtnText}>Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.acceptBtn}
                                    onPress={() => handleAction(selectedApp.id, 'accept')}
                                >
                                    <Text style={styles.acceptBtnText}>Accept & Hire</Text>
                                </TouchableOpacity>
                            </View>
                        ) : selectedApp?.status === 'Selected' ? (
                            <TouchableOpacity 
                                style={styles.agreementBtn}
                                onPress={() => {
                                    setIsModalVisible(false);
                                    navigation.navigate('AgreementDetails', { applicationId: selectedApp.id });
                                }}
                            >
                                <Feather name="file-text" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.agreementBtnText}>Setup Work Agreement</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.disabledBtn}>
                                <Text style={styles.disabledBtnText}>Status: {selectedApp?.status}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (loading && !refreshing) return <Loading message="Syncing applications..." />;

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.headerPadding}>
                <Text style={styles.mainTitle}>Received Applications</Text>
                <Text style={styles.mainSubtitle}>Review and hire talent for your gigs</Text>
            </View>

            <FlatList
                data={applications}
                keyExtractor={item => item.id.toString()}
                renderItem={renderApplicationCard}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />
                }
                ListEmptyComponent={
                    <EmptyState 
                        title="No Applicants Yet" 
                        message="Your posted gigs are waiting for talent."
                        icon="users"
                    />
                }
                showsVerticalScrollIndicator={false}
            />

            {renderDetailModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerPadding: { paddingHorizontal: 20, paddingVertical: 10 },
    mainTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    mainSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: '500' },
    list: { padding: 20, paddingBottom: 100 },
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#f1f5f9' },
    userInfo: { flex: 1, marginLeft: 12 },
    applicantName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    applicantRole: { fontSize: 12, color: '#4f46e5', fontWeight: 'bold', marginTop: 2 },
    experienceText: { fontSize: 11, color: '#64748b', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
    statusText: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
    workInfo: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 16, marginTop: 14, borderWidth: 1, borderColor: '#f1f5f9' },
    workLabel: { fontSize: 9, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 },
    workTitle: { fontSize: 13, fontWeight: 'bold', color: '#334155' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    dateText: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, height: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    modalHeaderTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
    closeBtn: { padding: 4 },
    modalScroll: { flex: 1 },
    modalHero: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#f8fafc' },
    avatarWrapper: { position: 'relative' },
    modalAvatar: { width: 100, height: 100, borderRadius: 30, backgroundColor: '#fff', borderWidth: 4, borderColor: '#fff' },
    verifiedBadge: { position: 'absolute', bottom: -5, right: -5, width: 24, height: 24, borderRadius: 12, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    modalName: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginTop: 16 },
    modalRole: { fontSize: 16, color: '#4f46e5', fontWeight: 'bold', marginTop: 4 },
    modalSection: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    sectionTitle: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 12 },
    modalWorkTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    modalInfoText: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
    summaryBox: { backgroundColor: '#f8fafc', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' },
    summaryText: { fontSize: 14, color: '#475569', lineHeight: 22, fontStyle: 'italic' },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    contactText: { fontSize: 14, fontWeight: '700', color: '#334155' },
    modalFooter: { padding: 24, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    actionRow: { flexDirection: 'row', gap: 12 },
    rejectBtn: { flex: 1, paddingVertical: 18, borderRadius: 20, borderWidth: 1, borderColor: '#fee2e2', alignItems: 'center', backgroundColor: '#fef2f2' },
    rejectBtnText: { color: '#ef4444', fontWeight: 'bold' },
    acceptBtn: { flex: 2, paddingVertical: 18, borderRadius: 20, backgroundColor: '#4f46e5', alignItems: 'center' },
    acceptBtnText: { color: '#fff', fontWeight: 'bold' },
    agreementBtn: { backgroundColor: '#0f172a', paddingVertical: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    agreementBtnText: { color: '#fff', fontWeight: 'bold' },
    disabledBtn: { backgroundColor: '#f1f5f9', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
    disabledBtnText: { color: '#94a3b8', fontWeight: 'bold' }
});

export default ReceivedApplications;
