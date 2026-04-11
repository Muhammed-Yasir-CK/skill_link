import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Modal, ScrollView, Linking, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/axios';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const Candidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchCandidates = async () => {
        try {
            const res = await api.get('company/received-applications/');
            setCandidates(res.data);
        } catch (error) {
            console.error("Failed to fetch candidates", error);
            Alert.alert("Error", "Failed to fetch candidate pipeline.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCandidates();
    }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await api.patch(`/company/update-application-status/${id}/`, { status: newStatus });
            const updated = res.data.status;
            
            setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: updated } : c));
            if (selectedCandidate && selectedCandidate.id === id) {
                setSelectedCandidate(prev => ({ ...prev, status: updated }));
            }
            Alert.alert("Success", `Status updated to ${updated}`);
        } catch (error) {
            console.error("Failed to update status", error);
            Alert.alert("Error", "Failed to update application status");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Interview': return { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' };
            case 'Selected': return { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' };
            case 'Shortlist': return { bg: '#eef2ff', text: '#4338ca', border: '#e0e7ff' };
            case 'Review': return { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe' };
            case 'Rejected': return { bg: '#fef2f2', text: '#dc2626', border: '#fee2e2' };
            default: return { bg: '#f8fafc', text: '#64748b', border: '#f1f5f9' };
        }
    };

    const renderCandidateCard = ({ item }) => {
        const s = getStatusStyle(item.status);
        return (
            <TouchableOpacity 
                style={styles.card} 
                onPress={() => {
                    setSelectedCandidate(item);
                    setModalVisible(true);
                }}
            >
                <View style={styles.cardRow}>
                    <View style={styles.avatarContainer}>
                        {item.avatar ? (
                            <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Feather name="user" size={24} color="#94a3b8" />
                            </View>
                        )}
                    </View>
                    <View style={styles.cardMain}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.name} numberOfLines={1}>{item.candidateName}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
                                <Text style={[styles.statusText, { color: s.text }]}>{item.status}</Text>
                            </View>
                        </View>
                        <Text style={styles.jobTitle} numberOfLines={1}>For: {item.jobTitle}</Text>
                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <Feather name="map-pin" size={12} color="#94a3b8" />
                                <Text style={styles.metaText}>{item.location}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Feather name="clock" size={12} color="#94a3b8" />
                                <Text style={styles.metaText}>{new Date(item.appliedDate).toLocaleDateString()}</Text>
                            </View>
                        </View>
                    </View>
                    <Feather name="chevron-right" size={20} color="#cbd5e1" />
                </View>
                <View style={styles.skillsRow}>
                    {(item.skills || []).slice(0, 3).map((skill, i) => (
                        <View key={i} style={styles.skillTag}>
                            <Text style={styles.skillTagText}>{skill}</Text>
                        </View>
                    ))}
                    {(item.skills || []).length > 3 && (
                        <View style={styles.skillTagMore}>
                            <Text style={styles.skillTagMoreText}>+{(item.skills || []).length - 3}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Candidate Pipeline</Text>
                <Text style={styles.subtitle}>Manage and track your incoming talent pool</Text>
            </View>

            {loading ? (
                <Loading message="Loading candidates..." />
            ) : (
                <FlatList
                    data={candidates}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderCandidateCard}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
                    ListEmptyComponent={
                        <EmptyState 
                            title="No Applications Yet"
                            message="Manage and track your incoming talent pool here."
                            icon="users"
                        />
                    }
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <Feather name="x" size={24} color="#64748b" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Candidate Details</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {selectedCandidate && (
                            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                                <View style={styles.candidateProfile}>
                                    <View style={styles.modalAvatarContainer}>
                                        {selectedCandidate.avatar ? (
                                            <Image source={{ uri: selectedCandidate.avatar }} style={styles.modalAvatar} />
                                        ) : (
                                            <View style={styles.modalAvatarPlaceholder}>
                                                <Feather name="user" size={40} color="#94a3b8" />
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.profileInfo}>
                                        <Text style={styles.modalName}>{selectedCandidate.candidateName}</Text>
                                        <Text style={styles.modalRole}>{selectedCandidate.role}</Text>
                                        <View style={styles.modalLocation}>
                                            <Feather name="map-pin" size={14} color="#64748b" />
                                            <Text style={styles.modalLocationText}>{selectedCandidate.location}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.statusSection}>
                                    <Text style={styles.sectionTitle}>Application Status</Text>
                                    <View style={styles.statusSelector}>
                                        {['Review', 'Shortlist', 'Interview', 'Selected', 'Rejected'].map(status => (
                                            <TouchableOpacity 
                                                key={status}
                                                style={[
                                                    styles.statusOption, 
                                                    selectedCandidate.status === status && styles.statusOptionActive,
                                                    { borderColor: getStatusStyle(status).border }
                                                ]}
                                                onPress={() => updateStatus(selectedCandidate.id, status)}
                                            >
                                                <Text style={[
                                                    styles.statusOptionText,
                                                    selectedCandidate.status === status && styles.statusOptionTextActive,
                                                    selectedCandidate.status === status && { color: getStatusStyle(status).text }
                                                ]}>{status}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Professional Summary</Text>
                                    <Text style={styles.bioText}>{selectedCandidate.bio || "No summary provided."}</Text>
                                </View>

                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Skills</Text>
                                    <View style={styles.fullSkillsRow}>
                                        {(selectedCandidate.skills || []).map((skill, i) => (
                                            <View key={i} style={styles.fullSkillTag}>
                                                <Text style={styles.fullSkillText}>{skill}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Contact Detail</Text>
                                    <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL(`mailto:${selectedCandidate.email}`)}>
                                        <Feather name="mail" size={18} color="#4f46e5" />
                                        <Text style={styles.contactText}>{selectedCandidate.email}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL(`tel:${selectedCandidate.phone}`)}>
                                        <Feather name="phone" size={18} color="#4f46e5" />
                                        <Text style={styles.contactText}>{selectedCandidate.phone}</Text>
                                    </TouchableOpacity>
                                </View>

                                {selectedCandidate.resume && (
                                    <TouchableOpacity 
                                        style={styles.resumeBtn}
                                        onPress={() => Linking.openURL(selectedCandidate.resume)}
                                    >
                                        <Feather name="file-text" size={20} color="#fff" />
                                        <Text style={styles.resumeBtnText}>View Resume</Text>
                                    </TouchableOpacity>
                                )}
                                
                                <View style={{ height: 40 }} />
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20 },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
    cardRow: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#f1f5f9', overflow: 'hidden' },
    avatar: { width: '100%', height: '100%' },
    avatarPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    cardMain: { flex: 1, marginLeft: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', flex: 1 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    jobTitle: { fontSize: 12, color: '#4f46e5', fontWeight: 'bold', marginTop: 4 },
    metaRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 11, color: '#94a3b8' },
    skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    skillTag: { backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#f1f5f9' },
    skillTagText: { fontSize: 10, color: '#64748b', fontWeight: 'bold' },
    skillTagMore: { backgroundColor: '#1e1b4b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    skillTagMoreText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, color: '#94a3b8', fontWeight: '500' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '90%', width: '100%' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    closeBtn: { padding: 4 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    modalBody: { padding: 24 },
    candidateProfile: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    modalAvatarContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#f1f5f9', overflow: 'hidden' },
    modalAvatar: { width: '100%', height: '100%' },
    modalAvatarPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    profileInfo: { flex: 1, marginLeft: 20 },
    modalName: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
    modalRole: { fontSize: 15, color: '#4f46e5', fontWeight: '600', marginTop: 2 },
    modalLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    modalLocationText: { fontSize: 13, color: '#64748b' },
    statusSection: { marginBottom: 24 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    statusSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    statusOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, backgroundColor: '#fff' },
    statusOptionActive: { backgroundColor: '#f8fafc' },
    statusOptionText: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8' },
    statusOptionTextActive: { color: '#0f172a' },
    section: { marginBottom: 24 },
    bioText: { fontSize: 15, color: '#475569', lineHeight: 24 },
    fullSkillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    fullSkillTag: { backgroundColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
    fullSkillText: { fontSize: 13, color: '#475569', fontWeight: '600' },
    contactItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, backgroundColor: '#f8fafc', padding: 12, borderRadius: 12 },
    contactText: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
    resumeBtn: { backgroundColor: '#1e1b4b', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 10, marginTop: 8 },
    resumeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default Candidates;
