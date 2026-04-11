import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    FlatList
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const { width } = Dimensions.get('window');

const StatusBadge = ({ status }) => {
    const getStyles = () => {
        switch (status) {
            case 'Active':
                return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
            case 'Closed':
                return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
            default: // Paused
                return { bg: '#fffbeb', text: '#d97706', border: '#fde68a' };
        }
    };

    const s = getStyles();

    return (
        <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
            <Text style={[styles.badgeText, { color: s.text }]}>{status}</Text>
        </View>
    );
};

const Jobs = ({ user }) => {
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await api.get('company/jobs/');
            const formatted = res.data.map(job => ({
                id: job.id,
                title: job.title,
                location: job.location,
                type: job.employment_type.replace('_', ' '),
                salary: `${job.salary_currency} ${job.salary_min} - ${job.salary_max}`,
                posted: new Date(job.created_at).toLocaleDateString(),
                description: job.description,
                skills: job.skills || [],
                education: job.education || 'Not specified',
                experience: job.seniority_level || 'Not specified',
                status: job.status,
                applicants: job.applicants_count || 0
            }));
            setJobs(formatted);
        } catch (err) {
            console.error('Error fetching jobs', err);
            Alert.alert("Error", "Failed to fetch job listings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    if (loading) return <Loading message="Syncing job listings..." />;

    const handleJobAction = async (id, action) => {
        try {
            const res = await api.patch(`/company/jobs/${id}/status/`, { status: action });
            const updatedStatus = res.data.status;

            setJobs(prev => prev.map(job => job.id === id ? { ...job, status: updatedStatus } : job));
            if (selectedJob && selectedJob.id === id) {
                setSelectedJob(prev => ({ ...prev, status: updatedStatus }));
            }
            setActiveDropdown(null);
            Alert.alert("Success", `Job ${action.toLowerCase()} successfully`);
        } catch (err) {
            console.error('Failed to update job status', err);
            Alert.alert("Error", "Failed to update status");
        }
    };

    const handleDeleteJob = (id) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this job? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/company/jobs/${id}/delete/`);
                            setJobs(prev => prev.filter(job => job.id !== id));
                            if (selectedJob && selectedJob.id === id) setSelectedJob(null);
                            setActiveDropdown(null);
                        } catch (err) {
                            console.error("Failed to delete job", err);
                            Alert.alert("Error", "Failed to delete job");
                        }
                    }
                }
            ]
        );
    };

    const JobDetailView = ({ job }) => (
        <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={() => setSelectedJob(null)} style={styles.backBtn}>
                <Feather name="arrow-left" size={20} color="#64748b" />
                <Text style={styles.backBtnText}>Back to All Jobs</Text>
            </TouchableOpacity>

            <View style={styles.detailHeader}>
                <View style={styles.headerTop}>
                    <StatusBadge status={job.status} />
                    <View style={styles.actionButtons}>
                        {job.status === 'Active' ? (
                            <TouchableOpacity onPress={() => handleJobAction(job.id, 'Paused')} style={[styles.miniBtn, styles.pauseBtn]}>
                                <Text style={styles.miniBtnText}>Pause</Text>
                            </TouchableOpacity>
                        ) : job.status === 'Paused' ? (
                            <TouchableOpacity onPress={() => handleJobAction(job.id, 'Active')} style={[styles.miniBtn, styles.activateBtn]}>
                                <Text style={styles.miniBtnText}>Activate</Text>
                            </TouchableOpacity>
                        ) : null}
                        {job.status !== 'Closed' && (
                            <TouchableOpacity onPress={() => handleJobAction(job.id, 'Closed')} style={[styles.miniBtn, styles.closeBtn]}>
                                <Text style={styles.miniBtnText}>Close</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <Text style={styles.detailTitle}>{job.title}</Text>
                <View style={styles.detailMeta}>
                    <View style={styles.metaItem}><Feather name="map-pin" size={12} color="#94a3b8" /><Text style={styles.metaLabel}>{job.location}</Text></View>
                    <View style={styles.metaItem}><Feather name="dollar-sign" size={12} color="#94a3b8" /><Text style={styles.metaLabel}>{job.salary}</Text></View>
                    <View style={styles.metaItem}><Feather name="briefcase" size={12} color="#94a3b8" /><Text style={styles.metaLabel}>{job.type}</Text></View>
                </View>

                <View style={styles.statsCard}>
                    <View>
                        <Text style={styles.statsLabel}>TOTAL APPLICANTS</Text>
                        <Text style={styles.statsValue}>{job.applicants}</Text>
                    </View>
                    <TouchableOpacity style={styles.candidatesBtn}>
                        <Feather name="users" size={18} color="#fff" />
                        <Text style={styles.candidatesBtnText}>View Candidates</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.detailSection}>
                <View style={styles.sectionHeader}>
                    <Feather name="file-text" size={18} color="#4338ca" />
                    <Text style={styles.sectionTitle}>Job Description</Text>
                </View>
                <Text style={styles.descriptionText}>{job.description}</Text>
            </View>

            <View style={styles.detailSection}>
                <Text style={styles.sectionTitleSmall}>Requirements</Text>
                <View style={styles.reqGrid}>
                    <View style={styles.reqItem}>
                        <Text style={styles.reqLabel}>Experience</Text>
                        <Text style={styles.reqValue}>{job.experience}</Text>
                    </View>
                    <View style={styles.reqItem}>
                        <Text style={styles.reqLabel}>Education</Text>
                        <Text style={styles.reqValue}>{job.education}</Text>
                    </View>
                </View>
                <Text style={styles.reqLabel}>Skills</Text>
                <View style={styles.skillTags}>
                    {job.skills.map((skill, i) => (
                        <View key={i} style={styles.skillTag}>
                            <Text style={styles.skillText}>{skill}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={[styles.detailSection, { marginBottom: 40 }]}>
                <Text style={styles.sectionTitleSmall}>Meta Data</Text>
                <View style={styles.metaRowDetail}>
                    <Text style={styles.metaRowLabel}>Posted on</Text>
                    <Text style={styles.metaRowValue}>{job.posted}</Text>
                </View>
                <View style={styles.metaRowDetail}>
                    <Text style={styles.metaRowLabel}>Job ID</Text>
                    <Text style={[styles.metaRowValue, styles.mono]}>REQ-{1000 + job.id}</Text>
                </View>
            </View>
        </ScrollView>
    );

    if (selectedJob) return <JobDetailView job={selectedJob} />;

    return (
        <View style={styles.container}>
            <View style={styles.listHeader}>
                <View>
                    <Text style={styles.title}>Manage Job Listings</Text>
                    <Text style={styles.subtitle}>Track performance and manage posts</Text>
                </View>
                <TouchableOpacity
                    style={styles.postBtn}
                    onPress={() => navigation.navigate('CompanyPostJob')}
                >
                    <Feather name="plus-circle" size={18} color="#fff" />
                    <Text style={styles.postBtnText}>Post Job</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
                <Feather name="search" size={18} color="#94a3b8" />
                <TextInput
                    placeholder="Search your jobs..."
                    placeholderTextColor="#94a3b8"
                    style={styles.searchInput}
                />
            </View>

            {jobs.length === 0 ? (
                <EmptyState 
                    title="No Jobs Posted"
                    message="You haven't posted any job listings yet."
                    icon="briefcase"
                    action={{
                        label: "Post Your First Job",
                        onPress: () => navigation.navigate('CompanyPostJob')
                    }}
                />
            ) : (
                <ScrollView contentContainerStyle={styles.jobList} showsVerticalScrollIndicator={false}>
                    {jobs.map(job => (
                        <TouchableOpacity 
                            key={job.id} 
                            style={styles.jobCard}
                            onPress={() => setSelectedJob(job)}
                        >
                            <View style={styles.cardInfo}>
                                <View style={styles.iconBg}>
                                    <View style={styles.iconCircle}>
                                        <Feather name="briefcase" size={18} color="#1e1b4b" />
                                    </View>
                                </View>
                                <View style={styles.titleGroup}>
                                    <Text style={styles.cardTitle} numberOfLines={1}>{job.title}</Text>
                                    <View style={styles.cardMeta}>
                                        <Feather name="map-pin" size={12} color="#94a3b8" />
                                        <Text style={styles.cardMetaText}>{job.location}</Text>
                                        <Text style={styles.cardMetaText}>•</Text>
                                        <Text style={styles.cardMetaText}>{job.posted}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardRight}>
                                <StatusBadge status={job.status} />
                                <View style={styles.applicantsRow}>
                                    <Feather name="users" size={12} color="#64748b" />
                                    <Text style={styles.applicantsText}>{job.applicants} applicants</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.moreIcon}
                                    onPress={() => setActiveDropdown(activeDropdown === job.id ? null : job.id)}
                                >
                                    <Feather name="more-horizontal" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            {activeDropdown === job.id && (
                                <View style={styles.dropdown}>
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => handleDeleteJob(job.id)}
                                    >
                                        <Feather name="trash-2" size={14} color="#ef4444" />
                                        <Text style={[styles.dropdownText, { color: '#ef4444' }]}>Delete Job</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => handleJobAction(job.id, job.status === 'Active' ? 'Paused' : 'Active')}
                                    >
                                        <Feather name={job.status === 'Active' ? "pause-circle" : "check-circle"} size={14} color="#475569" />
                                        <Text style={styles.dropdownText}>
                                            {job.status === 'Active' ? 'Pause Job' : 'Activate'}
                                        </Text>
                                    </TouchableOpacity>
                                    {job.status !== 'Closed' && (
                                        <TouchableOpacity
                                            style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                                            onPress={() => handleJobAction(job.id, 'Closed')}
                                        >
                                            <Feather name="x-circle" size={14} color="#dc2626" />
                                            <Text style={[styles.dropdownText, { color: '#dc2626' }]}>Close Job</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
    postBtn: { backgroundColor: '#1e1b4b', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 8 },
    postBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 20, paddingHorizontal: 16, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#1e293b' },
    jobList: { paddingHorizontal: 20, paddingBottom: 40 },
    jobCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-between', zIndex: 1, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }, android: { elevation: 2 } }) },
    cardInfo: { flex: 1, flexDirection: 'row', gap: 12 },
    iconBg: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#f1f5f9', padding: 2 },
    iconCircle: { flex: 1, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    titleGroup: { flex: 1, justifyContent: 'center' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    cardMetaText: { fontSize: 12, color: '#94a3b8' },
    cardRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
    applicantsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
    applicantsText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    moreIcon: { padding: 4, marginTop: 4 },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
    dropdown: { position: 'absolute', right: 16, top: 40, width: 140, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', zIndex: 10, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12 }, android: { elevation: 8 } }) },
    dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    dropdownText: { fontSize: 13, fontWeight: '600', color: '#475569' },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    loadingText: { marginTop: 12, color: '#64748b', fontSize: 14 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginTop: 16 },
    emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8, marginBottom: 24 },
    emptyPostBtn: { backgroundColor: '#1e1b4b', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
    emptyPostBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Details Styles
    detailContainer: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
    backBtnText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
    detailHeader: { backgroundColor: '#fff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    actionButtons: { flexDirection: 'row', gap: 8 },
    miniBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
    miniBtnText: { fontSize: 12, fontWeight: 'bold' },
    pauseBtn: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
    activateBtn: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
    closeBtn: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
    detailTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
    detailMeta: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaLabel: { fontSize: 13, color: '#94a3b8' },
    statsCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    statsLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1 },
    statsValue: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginTop: 4 },
    candidatesBtn: { backgroundColor: '#1e1b4b', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, gap: 8 },
    candidatesBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    detailSection: { backgroundColor: '#fff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    descriptionText: { fontSize: 15, color: '#475569', lineHeight: 24 },
    sectionTitleSmall: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
    reqGrid: { flexDirection: 'row', gap: 20, marginBottom: 20 },
    reqItem: { flex: 1 },
    reqLabel: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', marginBottom: 4 },
    reqValue: { fontSize: 14, color: '#475569', fontWeight: '500' },
    skillTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    skillTag: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    skillText: { fontSize: 12, color: '#475569', fontWeight: '600' },
    metaRowDetail: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    metaRowLabel: { fontSize: 14, color: '#64748b' },
    metaRowValue: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
    mono: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 12 }
});

export default Jobs;
