import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Switch, Modal, Image, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../api/axios';
import Loading from '../../components/Loading';
import { blockchainService } from '../../api/blockchainService';

// --- Sub-components (Simplified for Mobile) ---

const StatusTimeline = ({ currentStatus }) => {
    const steps = [
        { id: 'Selected', label: 'Selected', icon: 'check' },
        { id: 'Agreement Pending', label: 'Contract', icon: 'file-text' },
        { id: 'InProgress', label: 'Work', icon: 'clock' },
        { id: 'Completed', label: 'Done', icon: 'award' }
    ];

    const getActiveIndex = () => {
        const statusMap = {
            'Selected': 0,
            'Agreement Pending': 1,
            'Accepted': 2,
            'InProgress': 2,
            'Submitted': 3,
            'Payment Released': 3,
            'Completed': 3
        };
        return statusMap[currentStatus] ?? 0;
    };

    const activeIndex = getActiveIndex();

    return (
        <View style={styles.timelineContainer}>
            {steps.map((step, index) => {
                const isActive = index <= activeIndex;
                const isCurrent = index === activeIndex;
                return (
                    <View key={step.id} style={styles.timelineStep}>
                        <View style={[styles.timelineIcon, isActive && styles.timelineIconActive, isCurrent && styles.timelineIconCurrent]}>
                            <Feather name={step.icon} size={14} color={isActive ? '#fff' : '#cbd5e1'} />
                        </View>
                        <Text style={[styles.timelineLabel, isActive && styles.timelineLabelActive]}>{step.label}</Text>
                        {index < steps.length - 1 && <View style={[styles.timelineLine, index < activeIndex && styles.timelineLineActive]} />}
                    </View>
                );
            })}
        </View>
    );
};

const AgreementDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { applicationId } = route.params;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [role, setRole] = useState(null); // 'provider' or 'seeker'
    const [agreementData, setAgreementData] = useState(null);
    const [agreementId, setAgreementId] = useState(null);
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    
    // Form States (for provider editing)
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [deliverables, setDeliverables] = useState([]);
    
    // Submission State (for seeker)
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submissionNotes, setSubmissionNotes] = useState('');

    const fetchData = async () => {
        try {
            // First determine role and get agreement
            // Try provider endpoint first
            let res;
            let currentRole = 'seeker';
            try {
                res = await api.get(`/provider/get-agreement/${applicationId}/`);
                currentRole = 'provider';
            } catch (e) {
                res = await api.get(`/seeker/get-agreement/${applicationId}/`);
            }
            
            setRole(currentRole);
            const data = res.data;

            if (data.agreement) {
                setAgreementId(data.agreement.id);
                setAgreementData(data.agreement);
                setDescription(data.agreement.description || '');
                setAmount(data.agreement.amount?.toString() || '');
                setDeadline(data.agreement.deadline || '');
                setDeliverables(data.agreement.deliverables || []);
                if (data.agreement.status !== 'pending' && data.agreement.status !== 'Selected') {
                    setIsTermsAccepted(true);
                }
            } else if (data.default_data) {
                // Formatting default data for a new agreement
                setAgreementData({
                    status: 'Selected',
                    job_title: data.default_data.job_title,
                    seeker_name: data.default_data.seeker_name,
                    employer_name: data.default_data.employer_name,
                });
                setDescription(data.default_data.description || '');
            }
        } catch (error) {
            console.error("Error fetching agreement:", error);
            Alert.alert("Error", "Failed to load agreement details.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [applicationId]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const handleProviderAction = async (action) => {
        try {
            if (action === 'create' || action === 'update') {
               const payload = {
                   description,
                   amount,
                   deadline,
                   deliverables,
                   currency: 'INR',
                   method: 'Blockchain Escrow',
                   terms: agreementData.terms || []
               };
               
               let res;
               if (agreementId) {
                   res = await api.put(`/provider/update-agreement/${agreementId}/`, payload);
               } else {
                   res = await api.post(`/provider/create-agreement/${applicationId}/`, payload);
               }
               
               Alert.alert("Success", "Agreement sent to seeker.");
               fetchData();
            } else if (action === 'deposit') {
                // In mobile, we might redirect to a web view for Razorpay or handle via backend
                Alert.alert("Deposit", "In this mobile version, please use the web dashboard to complete the Fiat-to-Escrow deposit. We are currently integrating native Razorpay.");
            } else if (action === 'approve') {
                setLoading(true);
                const res = await api.post(`/provider/approve-work/${agreementId}/`);
                if (res.data.status) {
                    Alert.alert("Success", "Work approved and payment released!");
                    fetchData();
                }
            }
        } catch (error) {
            Alert.alert("Error", error.response?.data?.detail || "Action failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSeekerAction = async (action) => {
        try {
            if (action === 'accept' || action === 'reject') {
                const res = await api.post(`/seeker/respond-agreement/${applicationId}/`, { action });
                Alert.alert("Success", `Agreement ${action}ed.`);
                fetchData();
            } else if (action === 'submit_work') {
                setLoading(true);
                const formData = new FormData();
                formData.append('submission_notes', submissionNotes);
                // In a real app, we'd add file upload here
                
                await api.post(`/seeker/submit-work/${applicationId}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                setShowSubmitModal(false);
                Alert.alert("Success", "Work submitted for review.");
                fetchData();
            } else if (action === 'complete') {
                 const res = await api.post(`/seeker/respond-agreement/${applicationId}/`, { action: "complete" });
                 Alert.alert("Success", "Contract completed! Funds should be in your wallet.");
                 fetchData();
            }
        } catch (error) {
            Alert.alert("Error", "Action failed.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading message="Syncing agreement details..." />;

    const isEditable = role === 'provider' && (agreementData?.status === 'Selected' || agreementData?.status === 'pending');
    const statusIdx = {
        'Selected': 0,
        'pending': 1,
        'Agreement Pending': 1,
        'Accepted': 2,
        'InProgress': 2,
        'Submitted': 3,
        'Payment Released': 4,
        'Completed': 5
    }[agreementData?.status] || 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{agreementData?.job_title || 'Work Agreement'}</Text>
                    <Text style={styles.headerSubtitle}>
                        {role === 'provider' ? `Worker: ${agreementData?.seeker_name}` : `Client: ${agreementData?.employer_name || agreementData?.provider_name}`}
                    </Text>
                </View>
            </View>

            <ScrollView 
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <StatusTimeline currentStatus={agreementData?.status} />

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Feather name="briefcase" size={18} color="#4f46e5" />
                        <Text style={styles.cardTitle}>WORK DEFINITION</Text>
                    </View>
                    
                    <Text style={styles.label}>Description</Text>
                    {isEditable ? (
                        <TextInput 
                            style={styles.textArea}
                            multiline
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Enter work details..."
                        />
                    ) : (
                        <View style={styles.readOnlyBox}>
                            <Text style={styles.readOnlyText}>{description || 'No description provided.'}</Text>
                        </View>
                    )}

                    <Text style={styles.label}>Deliverables</Text>
                    {deliverables.map((item, idx) => (
                        <View key={idx} style={styles.deliverableRow}>
                            <View style={styles.bullet} />
                            <Text style={styles.deliverableText}>{item}</Text>
                        </View>
                    ))}
                    {isEditable && (
                        <TouchableOpacity 
                            style={styles.addBtn}
                            onPress={() => Alert.alert("Deliverables", "Mobile edit for deliverables list coming soon.")}
                        >
                            <Feather name="plus" size={14} color="#4f46e5" />
                            <Text style={styles.addBtnText}>Add Deliverable</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Feather name="dollar-sign" size={18} color="#10b981" />
                        <Text style={styles.cardTitle}>FINANCIAL TERMS</Text>
                    </View>
                    
                    <View style={styles.paymentRow}>
                        <View style={styles.paymentCol}>
                            <Text style={styles.label}>Contract Value</Text>
                            {isEditable ? (
                                <TextInput 
                                    style={styles.amountInput}
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                />
                            ) : (
                                <Text style={styles.amountText}>{amount} <Text style={styles.currencyText}>INR</Text></Text>
                            )}
                        </View>
                        <View style={styles.paymentCol}>
                            <Text style={styles.label}>Deadline</Text>
                            {isEditable ? (
                                <TextInput 
                                    style={styles.amountInput}
                                    value={deadline}
                                    onChangeText={setDeadline}
                                    placeholder="YYYY-MM-DD"
                                />
                            ) : (
                                <Text style={styles.deadlineText}>{deadline || 'Flexible'}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {agreementData?.submission_notes && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Feather name="upload-cloud" size={18} color="#4f46e5" />
                            <Text style={styles.cardTitle}>WORK SUBMISSION</Text>
                        </View>
                        <View style={styles.readOnlyBox}>
                            <Text style={styles.readOnlyText}>{agreementData.submission_notes}</Text>
                        </View>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                {role === 'provider' ? (
                    <>
                        {statusIdx === 0 || statusIdx === 1 ? (
                            <TouchableOpacity style={styles.primaryBtn} onPress={() => handleProviderAction(agreementId ? 'update' : 'create')}>
                                <Text style={styles.primaryBtnText}>{agreementId ? 'Update Contract' : 'Send Agreement'}</Text>
                            </TouchableOpacity>
                        ) : statusIdx === 2 ? (
                            <TouchableOpacity style={styles.accentBtn} onPress={() => handleProviderAction('deposit')}>
                                <Feather name="lock" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.primaryBtnText}>Deposit Funds</Text>
                            </TouchableOpacity>
                        ) : statusIdx === 3 ? (
                            <TouchableOpacity style={styles.successBtn} onPress={() => handleProviderAction('approve')}>
                                <Feather name="check-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.primaryBtnText}>Approve & Release</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.statusInfoBox}>
                                <Text style={styles.statusInfoText}>Current Status: {agreementData?.status}</Text>
                            </View>
                        )}
                    </>
                ) : (
                    <>
                        {statusIdx === 1 ? (
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.outlineBtn} onPress={() => handleSeekerAction('reject')}>
                                    <Text style={styles.outlineBtnText}>Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.primaryBtn, { flex: 2 }]} onPress={() => handleSeekerAction('accept')}>
                                    <Text style={styles.primaryBtnText}>Accept Agreement</Text>
                                </TouchableOpacity>
                            </View>
                        ) : statusIdx === 2 ? (
                            <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowSubmitModal(true)}>
                                <Feather name="upload" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.primaryBtnText}>Submit Work</Text>
                            </TouchableOpacity>
                        ) : statusIdx === 4 ? (
                            <TouchableOpacity style={styles.successBtn} onPress={() => handleSeekerAction('complete')}>
                                <Text style={styles.primaryBtnText}>Confirm Funds Received</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.statusInfoBox}>
                                <Text style={styles.statusInfoText}>Waiting for client action...</Text>
                            </View>
                        )}
                    </>
                )}
            </View>

            <Modal visible={showSubmitModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Submit Your Work</Text>
                        <Text style={styles.modalDesc}>Provide a short note or link to your work for the client to review.</Text>
                        
                        <TextInput 
                            style={styles.modalInput}
                            multiline
                            placeholder="Type your notes here..."
                            value={submissionNotes}
                            onChangeText={setSubmissionNotes}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowSubmitModal(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalSubmit} onPress={() => handleSeekerAction('submit_work')}>
                                <Text style={styles.modalSubmitText}>Submit Work</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    backBtn: { padding: 8, marginRight: 8 },
    headerTitleContainer: { flex: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
    headerSubtitle: { fontSize: 12, color: '#64748b', fontWeight: 'bold' },
    content: { flex: 1, padding: 20 },
    timelineContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 10 },
    timelineStep: { alignItems: 'center', flex: 1 },
    timelineIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
    timelineIconActive: { backgroundColor: '#4f46e5' },
    timelineIconCurrent: { transform: [{ scale: 1.2 }], borderWidth: 2, borderColor: '#fff' },
    timelineLabel: { fontSize: 9, fontWeight: 'bold', color: '#cbd5e1', marginTop: 8, textTransform: 'uppercase' },
    timelineLabelActive: { color: '#4f46e5' },
    timelineLine: { position: 'absolute', top: 16, left: '50%', right: '-50%', height: 2, backgroundColor: '#f1f5f9', zIndex: 1 },
    timelineLineActive: { backgroundColor: '#4f46e5' },
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    cardTitle: { fontSize: 11, fontWeight: '900', color: '#64748b', marginLeft: 8, letterSpacing: 1 },
    label: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 },
    textArea: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 14, color: '#334155', minHeight: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e2e8f0' },
    readOnlyBox: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16 },
    readOnlyText: { fontSize: 14, color: '#334155', lineHeight: 22 },
    deliverableRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4f46e5', marginRight: 12 },
    deliverableText: { fontSize: 14, color: '#475569', fontWeight: '500' },
    addBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    addBtnText: { fontSize: 13, fontWeight: 'bold', color: '#4f46e5', marginLeft: 6 },
    paymentRow: { flexDirection: 'row', justifyContent: 'space-between' },
    paymentCol: { flex: 1 },
    amountInput: { fontSize: 24, fontWeight: '900', color: '#0f172a', borderBottomWidth: 2, borderBottomColor: '#4f46e5', paddingBottom: 4 },
    amountText: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    currencyText: { fontSize: 14, color: '#10b981' },
    deadlineText: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    actionRow: { flexDirection: 'row', gap: 12 },
    primaryBtn: { backgroundColor: '#4f46e5', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    accentBtn: { backgroundColor: '#0f172a', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    successBtn: { backgroundColor: '#10b981', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    outlineBtn: { flex: 1, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
    outlineBtnText: { color: '#64748b', fontSize: 15, fontWeight: '800' },
    statusInfoBox: { padding: 12, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center' },
    statusInfoText: { color: '#64748b', fontSize: 13, fontWeight: 'bold', fontStyle: 'italic' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 32, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    modalDesc: { fontSize: 14, color: '#64748b', marginTop: 8, lineHeight: 20 },
    modalInput: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, height: 120, textAlignVertical: 'top', marginTop: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    modalCancel: { flex: 1, padding: 16, alignItems: 'center' },
    modalCancelText: { color: '#64748b', fontWeight: 'bold' },
    modalSubmit: { flex: 2, backgroundColor: '#4f46e5', padding: 16, borderRadius: 16, alignItems: 'center' },
    modalSubmitText: { color: '#fff', fontWeight: 'bold' }
});

export default AgreementDetails;
