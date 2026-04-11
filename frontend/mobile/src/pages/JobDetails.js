import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../api/axios';
import Header from '../components/Header';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

const JobDetails = ({ route, navigation }) => {
    const { id } = route?.params || {};
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState(false);
    const { user } = useAuth();

    const fetchJobDetails = async () => {
        if (!id) return;
        try {
            // Parse ID since it format is "company_1" or "work_1"
            const [type, rawId] = typeof id === 'string' ? id.split('_') : ['', ''];

            if (!type || !rawId) {
                setError(true);
                setLoading(false);
                return;
            }

            let fetchedData = null;

            if (type === 'company') {
                const response = await api.get(`jobs/${rawId}/`);
                const data = response.data;
                fetchedData = {
                    id: `company_${data.id}`,
                    title: data.title,
                    company: data.company_name || 'Company',
                    location: data.location,
                    type: 'Company',
                    workType: data.work_mode || 'On-site',
                    experience: data.experience || '',
                    salary: data.salary_min && data.salary_max 
                        ? `${data.salary_currency || '$'}${data.salary_min} - ${data.salary_max}`
                        : 'Not specified',
                    posted: new Date(data.created_at).toLocaleDateString(),
                    tags: data.skills || [],
                    description: data.description || 'No description provided.',
                    requirements: data.requirements || [],
                    raw_id: data.id,
                    isCompanyJob: true,
                    company_logo: data.company_logo,
                    is_applied: data.is_applied
                };
            } else if (type === 'work') {
                const response = await api.get(`work-posts/${rawId}/`);
                const data = response.data;
                
                // Determine "Company Name" for individual posters
                let posterName = 'Individual';
                let posterLogo = null;
                if (data.user_details) {
                    posterName = data.user_details.full_name || data.user_details.company_name || 'Individual';
                    posterLogo = data.user_details.profile_picture || data.user_details.brand_logo || null;
                }

                fetchedData = {
                    id: `work_${data.id}`,
                    title: data.title,
                    company: posterName,
                    company_logo: posterLogo,
                    location: data.city || 'Remote',
                    type: 'Local Work',
                    workType: data.work_nature || 'Contract',
                    experience: data.experience_level || '',
                    salary: data.budget_min && data.budget_max
                        ? `${data.currency || '$'}${data.budget_min} - ${data.budget_max}`
                        : 'Not specified',
                    posted: new Date(data.created_at).toLocaleDateString(),
                    tags: data.category ? [data.category] : [],
                    description: data.description || 'No description provided.',
                    raw_id: data.id,
                    isCompanyJob: false,
                    is_applied: data.is_applied
                };
            }

            setJob(fetchedData);
        } catch (err) {
            console.error("Error fetching job details:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    const handleApply = async () => {
        if (!user) {
            Alert.alert("Login Required", "Please log in to apply for this position.", [
                { text: "Cancel", style: "cancel" },
                { text: "Login", onPress: () => navigation.navigate('Login') }
            ]);
            return;
        }

        if (user.role !== 'seeker') {
            Alert.alert("Restricted Action", "Only Job Seekers can apply for positions.");
            return;
        }

        if (job.is_applied) return;

        setApplying(true);
        try {
            await api.post('applications/', {
                job_id: job.raw_id,
                job_source: job.isCompanyJob ? "company" : "user"
            });
            
            Alert.alert("Success", "Your application has been submitted successfully!");
            // Refresh details to show "Applied" state
            fetchJobDetails();
        } catch (err) {
            console.error("Application failed:", err);
            const errMsg = err.response?.data?.error || "Failed to submit application. Please try again.";
            Alert.alert("Application Error", errMsg);
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <Header />
                <Loading message="Fetching job details..." />
            </SafeAreaView>
        );
    }

    if (error || !job) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <Header />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <EmptyState 
                        icon="alert-circle"
                        title="Job not found"
                        subtitle="This job may have been removed or is no longer available."
                    />
                    <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ alignSelf: 'center', marginTop: -20, padding: 20 }}>
                        <Text style={styles.backLink}>Back to Jobs</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const isSeeker = user?.role === 'seeker';
    const canApply = isSeeker && !job.is_applied;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Header />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.main}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Feather name="arrow-left" size={18} color="#64748b" />
                        <Text style={styles.backButtonText}>Back to Jobs</Text>
                    </TouchableOpacity>

                    <View style={styles.card}>
                        {/* Improved Header Structure */}
                        <View style={styles.cardHeader}>
                            <View style={styles.companyProfile}>
                                <View style={styles.companyIcon}>
                                    {job.company_logo ? (
                                        <Image 
                                            source={{ uri: job.company_logo }} 
                                            style={styles.companyLogo}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <Text style={styles.companyIconText}>{job.company?.charAt(0)}</Text>
                                    )}
                                </View>
                                <View style={styles.companyInfo}>
                                    <Text style={styles.companyName}>{job.company}</Text>
                                    <View style={styles.typeBadge}>
                                        <Text style={styles.typeBadgeText}>{job.type}</Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.jobTitle}>{job.title}</Text>
                            
                            <View style={styles.metaList}>
                                <View style={styles.metaItem}>
                                    <View style={styles.metaIconBg}>
                                        <Feather name="map-pin" size={14} color="#6366f1" />
                                    </View>
                                    <View>
                                        <Text style={styles.metaLabel}>Location</Text>
                                        <Text style={styles.metaValue}>{job.location} ({job.workType})</Text>
                                    </View>
                                </View>
                                <View style={styles.metaItem}>
                                    <View style={styles.metaIconBg}>
                                        <Feather name="dollar-sign" size={14} color="#10b981" />
                                    </View>
                                    <View>
                                        <Text style={styles.metaLabel}>Salary Range</Text>
                                        <Text style={styles.metaValue}>{job.salary}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.cardBody}>
                            <View style={styles.section}>
                                <Text style={styles.sectionHeading}>About the Role</Text>
                                <Text style={styles.description}>
                                    {job.description}
                                </Text>
                            </View>

                            {job.isCompanyJob && job.requirements && job.requirements.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionHeading}>Requirements</Text>
                                    <View style={styles.bulletList}>
                                        {job.requirements.map((req, i) => (
                                            <View key={i} style={styles.bulletItem}>
                                                <Feather name="check-circle" size={14} color="#10b981" style={{ marginTop: 4 }} />
                                                <Text style={styles.bulletText}>{req}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            <View style={styles.tagSection}>
                                <Text style={styles.tagHeading}>Skills & Tags</Text>
                                <View style={styles.tagContainer}>
                                    {job.tags?.map((tag, idx) => (
                                        <View key={idx} style={styles.tag}>
                                            <Text style={styles.tagText}>{tag}</Text>
                                        </View>
                                    ))}
                                    {job.experience ? (
                                        <View style={[styles.tag, { backgroundColor: '#eff6ff' }]}>
                                            <Text style={[styles.tagText, { color: '#2563eb' }]}>{job.experience}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Action Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.shareButton}>
                    <Feather name="share-2" size={20} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[
                        styles.applyButton, 
                        !canApply && { backgroundColor: job.is_applied ? '#10b981' : '#94a3b8' }
                    ]} 
                    onPress={handleApply}
                    disabled={applying || (user && !canApply && !job.is_applied)}
                >
                    {applying ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Text style={styles.applyButtonText}>
                                {job.is_applied ? "Already Applied" : "Apply for this position"}
                            </Text>
                            <Feather name={job.is_applied ? "check" : "chevron-right"} size={18} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    backLink: { color: '#3b82f6', fontWeight: 'bold', marginTop: 12, fontSize: 16 },
    scrollContent: { paddingBottom: 100 }, // Space for sticky footer
    main: { padding: 16 },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingLeft: 4 },
    backButtonText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
    card: { backgroundColor: 'white', borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5 },
    cardHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    companyProfile: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    companyIcon: { width: 44, height: 44, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' },
    companyLogo: { width: '100%', height: '100%' },
    companyIconText: { fontSize: 20, fontWeight: 'bold', color: '#64748b' },
    companyInfo: { flex: 1 },
    companyName: { fontSize: 14, color: '#64748b', fontWeight: '600' },
    typeBadge: { backgroundColor: '#f1f5f9', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 2 },
    typeBadgeText: { fontSize: 10, color: '#475569', fontWeight: 'bold', textTransform: 'uppercase' },
    jobTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', lineHeight: 32, marginBottom: 20 },
    metaList: { gap: 16 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    metaIconBg: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
    metaLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
    metaValue: { fontSize: 14, color: '#1e293b', fontWeight: '700' },
    cardBody: { padding: 20 },
    section: { marginBottom: 24 },
    sectionHeading: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
    description: { fontSize: 15, color: '#475569', lineHeight: 24 },
    bulletList: { gap: 10 },
    bulletItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    bulletText: { flex: 1, fontSize: 15, color: '#475569', lineHeight: 24 },
    tagSection: { marginTop: 8, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    tagHeading: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: { backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    tagText: { color: '#475569', fontSize: 13, fontWeight: '600' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20, flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    shareButton: { width: 50, height: 50, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
    applyButton: { flex: 1, height: 50, backgroundColor: '#4338ca', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    applyButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default JobDetails;
