import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert, Modal, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../api/axios';

const CompanyItem = ({ company, onVerify, onViewDetails }) => (
    <View style={styles.companyCard}>
        <View style={styles.companyMain}>
            <View style={styles.logoWrapper}>
                {company.brand_logo ? (
                    <Image source={{ uri: company.brand_logo }} style={styles.logo} />
                ) : (
                    <Text style={styles.logoPlaceholder}>{company.company_name?.[0]}</Text>
                )}
            </View>
            <View style={styles.companyInfo}>
                <Text style={styles.companyName} numberOfLines={1}>{company.company_name}</Text>
                <Text style={styles.companyEmail} numberOfLines={1}>{company.email}</Text>
                <View style={styles.statsRow}>
                    <Text style={styles.statsText}>{company.posted_jobs_count} Jobs</Text>
                </View>
            </View>
        </View>
        
        <View style={styles.companyActions}>
            <View style={[styles.statusBadge, getStatusStyle(company.verification_status)]}>
                <Text style={[styles.statusText, getStatusTextStyle(company.verification_status)]}>
                    {company.verification_status}
                </Text>
            </View>
            <View style={styles.btnRow}>
                {company.verification_status !== 'verified' && (
                    <TouchableOpacity 
                        style={[styles.miniBtn, { backgroundColor: '#dcfce7' }]}
                        onPress={() => onVerify(company.id, 'verified')}
                    >
                        <Feather name="check" size={14} color="#15803d" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity 
                    style={styles.miniBtn}
                    onPress={() => onViewDetails(company.id)}
                >
                    <Feather name="eye" size={14} color="#3b82f6" />
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

const getStatusStyle = (status) => {
    switch(status) {
        case 'verified': return { backgroundColor: '#dcfce7' };
        case 'pending': return { backgroundColor: '#fef9c3' };
        case 'rejected': return { backgroundColor: '#fee2e2' };
        default: return { backgroundColor: '#f1f5f9' };
    }
}

const getStatusTextStyle = (status) => {
    switch(status) {
        case 'verified': return { color: '#15803d' };
        case 'pending': return { color: '#a16207' };
        case 'rejected': return { color: '#b91c1c' };
        default: return { color: '#64748b' };
    }
}

const DetailItem = ({ label, value }) => (
    <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'N/A'}</Text>
    </View>
);

const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchCompanies = async () => {
        try {
            const res = await api.get('accounts/admin/companies/');
            setCompanies(res.data);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to load companies");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchCompanyDetail = async (id) => {
        try {
            const res = await api.get(`accounts/admin/companies/${id}/`);
            setSelectedCompany(res.data);
            setModalVisible(true);
        } catch (err) {
            Alert.alert("Error", "Failed to load company details");
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCompanies();
    }, []);

    const handleVerify = async (id, status, reason = "") => {
        try {
            await api.post(`accounts/admin/companies/${id}/verify/`, { status, rejection_reason: reason });
            fetchCompanies();
            setModalVisible(false);
            Alert.alert("Success", `Company ${status} successfully`);
        } catch (err) {
            Alert.alert("Error", "Action failed");
        }
    };

    const confirmVerify = (id, status) => {
        if (status === 'rejected') {
            // Need a way to input reason, for now just simple confirm or prompt emulation
            Alert.alert("Reject?", "Are you sure you want to reject this company?", [
                { text: "Cancel" },
                { text: "Reject", onPress: () => handleVerify(id, 'rejected', "Incomplete data") }
            ]);
        } else {
            Alert.alert("Verify?", "Approve this company for the platform?", [
                { text: "Cancel" },
                { text: "Approve", onPress: () => handleVerify(id, 'verified') }
            ]);
        }
    }

    const filteredCompanies = companies.filter(company =>
        company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0f172a" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Company Management</Text>
                <View style={styles.searchBox}>
                    <Feather name="search" size={18} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                </View>
            </View>

            <FlatList
                data={filteredCompanies}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <CompanyItem 
                        company={item} 
                        onVerify={confirmVerify}
                        onViewDetails={fetchCompanyDetail}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Company Profile</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {selectedCompany && (
                                <View style={styles.profileSection}>
                                    <View style={styles.profileTop}>
                                        <View style={styles.largeLogoBox}>
                                            {selectedCompany.brand_logo ? (
                                                <Image source={{ uri: selectedCompany.brand_logo }} style={styles.largeLogo} />
                                            ) : (
                                                <Text style={styles.largeLogoPlaceholder}>{selectedCompany.company_name?.[0]}</Text>
                                            )}
                                        </View>
                                        <Text style={styles.profileName}>{selectedCompany.company_name}</Text>
                                        <Text style={styles.profileEmail}>{selectedCompany.official_email || selectedCompany.email}</Text>
                                    </View>

                                    <View style={styles.detailsGrid}>
                                        <DetailItem label="Legal Name" value={selectedCompany.company_legal_name} />
                                        <DetailItem label="Industry" value={selectedCompany.industry} />
                                        <DetailItem label="Size" value={selectedCompany.company_size} />
                                        <DetailItem label="Founded" value={selectedCompany.founded_year} />
                                        <DetailItem label="HQ" value={selectedCompany.headquarters} />
                                        <DetailItem label="Status" value={selectedCompany.verification_status} />
                                    </View>

                                    <View style={styles.docsHeader}>
                                        <Feather name="file-text" size={16} color="#0f172a" />
                                        <Text style={styles.docsTitle}>Verification Documents</Text>
                                    </View>
                                    
                                    {selectedCompany.documents?.map(doc => (
                                        <TouchableOpacity key={doc.id} style={styles.docItem} onPress={() => Alert.alert("View", "Open document in browser URL: " + doc.file)}>
                                            <Feather name="external-link" size={16} color="#3b82f6" />
                                            <Text style={styles.docName}>{doc.document_key.replace('_', ' ').toUpperCase()}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    {!selectedCompany.documents?.length && <Text style={styles.noDocs}>No documents uploaded</Text>}
                                </View>
                            )}
                        </ScrollView>

                        {selectedCompany?.verification_status !== 'verified' && (
                            <View style={styles.modalFooter}>
                                <TouchableOpacity 
                                    style={[styles.modalBtn, styles.rejectBtn]}
                                    onPress={() => confirmVerify(selectedCompany.id, 'rejected')}
                                >
                                    <Text style={styles.rejectBtnText}>Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalBtn, styles.approveBtn]}
                                    onPress={() => confirmVerify(selectedCompany.id, 'verified')}
                                >
                                    <Text style={styles.approveBtnText}>Approve</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 24, paddingTop: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 16 },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, height: 44 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1e293b' },
    listContent: { padding: 16, paddingBottom: 40 },
    companyCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    companyMain: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    logoWrapper: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    logo: { width: '100%', height: '100%' },
    logoPlaceholder: { fontSize: 18, fontWeight: 'bold', color: '#cbd5e1' },
    companyInfo: { flex: 1, marginLeft: 12 },
    companyName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    companyEmail: { fontSize: 12, color: '#64748b', marginTop: 2 },
    statsRow: { marginTop: 4 },
    statsText: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
    companyActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f8fafc', paddingTop: 12 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'capitalize' },
    btnRow: { flexDirection: 'row', gap: 8 },
    miniBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '85%', paddingBottom: 30 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
    modalBody: { flex: 1 },
    profileSection: { padding: 24 },
    profileTop: { alignItems: 'center', marginBottom: 32 },
    largeLogoBox: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
    largeLogo: { width: '100%', height: '100%' },
    largeLogoPlaceholder: { fontSize: 32, fontWeight: 'bold', color: '#cbd5e1' },
    profileName: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
    profileEmail: { fontSize: 14, color: '#64748b', marginTop: 4 },
    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
    detailItem: { width: '45%' },
    detailLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
    detailValue: { fontSize: 14, color: '#1e293b', fontWeight: '500' },
    docsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    docsTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    docItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#f8fafc', borderRadius: 12, marginBottom: 10 },
    docName: { fontSize: 13, color: '#334155', fontWeight: '600' },
    noDocs: { color: '#94a3b8', fontSize: 13, fontStyle: 'italic' },
    modalFooter: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingTop: 16 },
    modalBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    rejectBtn: { backgroundColor: '#fee2e2' },
    rejectBtnText: { color: '#b91c1c', fontWeight: 'bold' },
    approveBtn: { backgroundColor: '#0f172a' },
    approveBtnText: { color: '#fff', fontWeight: 'bold' }
});

export default CompanyManagement;
