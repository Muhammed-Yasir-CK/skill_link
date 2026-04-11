import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Loading from '../components/Loading';
import Header from '../components/Header';

import Overview from './company_sections/Overview';
import Jobs from './company_sections/Jobs';
import Candidates from './company_sections/Candidates';
import CompanySettings from './company_sections/CompanySettings';

// Mock Data exactly as provided in web code (adapted for RN styles)
const stats = [
    { label: 'Active Jobs', value: '12', change: '+2', icon: 'briefcase', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { label: 'Total Applications', value: '843', change: '+124', icon: 'users', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
    { label: 'Interviews Scheduled', value: '18', change: '+4', icon: 'calendar', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Shortlisted', value: '45', change: '+12', icon: 'check-circle', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
];

const activeJobs = [
    { id: 1, title: 'Senior Frontend Developer', location: 'Remote', applicants: 142, status: 'Active', posted: '2 days ago' },
    { id: 2, title: 'UX Designer', location: 'San Francisco, CA', applicants: 89, status: 'Active', posted: '5 days ago' },
    { id: 3, title: 'Product Manager', location: 'New York, NY', applicants: 215, status: 'Paused', posted: '2 weeks ago' },
];

const recentCandidates = [
    { id: 1, name: 'Alex Johnson', role: 'Senior Frontend Developer', exp: '5 Years', status: 'New', avatar: null },
    { id: 2, name: 'Sarah Wilson', role: 'UX Designer', exp: '3 Years', status: 'Reviewing', avatar: null },
    { id: 3, name: 'Mike Brown', role: 'Product Manager', exp: '7 Years', status: 'Interview', avatar: null },
];

const pipeline = [
    { stage: 'New Applied', count: 145, color: '#3b82f6' },
    { stage: 'Screening', count: 68, color: '#6366f1' },
    { stage: 'Interview', count: 24, color: '#a855f7' },
    { stage: 'Offer Sent', count: 8, color: '#ec4899' },
    { stage: 'Hired', count: 3, color: '#10b981' },
];

const CompanyDashboard = () => {
    const { user: company, loading } = useAuth();
    // 1. Mobile-friendly Tab Handling (replacing useSearchParams)
    const [activeTab, setActiveTab] = useState('overview');

    if (loading) return <Loading message="Syncing dashboard data..." />;

    if (!company) return (
        <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Unauthorized. Please log in as a company.</Text>
        </View>
    );

    // 5. Page content
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <Overview company={company} stats={stats} pipeline={pipeline} onNavigate={setActiveTab} />;
            case 'jobs':
                return <Jobs jobs={activeJobs} />;
            case 'candidates':
                return <Candidates candidates={recentCandidates} />;
            case 'settings':
                return <CompanySettings />;
            default:
                return (
                    <View style={styles.wipContainer}>
                        <View style={styles.wipIconBg}>
                            <Feather name="settings" size={40} color="#94a3b8" />
                        </View>
                        <Text style={styles.wipTitle}>Work in Progress</Text>
                        <Text style={styles.wipSubtitle}>This section ({activeTab}) is coming soon.</Text>
                    </View>
                );
        }
    };

    // 6. Final render
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1e1b4b" />
            <Header />

            <View style={{ flex: 1 }}>
                <View style={styles.heroSection}>
                    <View style={styles.heroHeader}>
                        <View>
                            <Text style={styles.heroTitle}>Company Dashboard</Text>
                            <Text style={styles.heroSubtitle}>Manage your jobs, pipeline, and team all in one place.</Text>
                        </View>
                    </View>

                    {/* Tab Navigation (Mobile Adapted) */}
                    <View style={styles.tabBar}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarScroll}>
                            {[
                                { id: 'overview', label: 'Overview', icon: 'grid' },
                                { id: 'jobs', label: 'Jobs', icon: 'briefcase' },
                                { id: 'candidates', label: 'Candidates', icon: 'users' },
                                { id: 'settings', label: 'Settings', icon: 'settings' }
                            ].map(tab => (
                                <TouchableOpacity
                                    key={tab.id}
                                    onPress={() => setActiveTab(tab.id)}
                                    style={[
                                        styles.tabItem,
                                        activeTab === tab.id
                                            ? styles.tabItemActive
                                            : styles.tabItemInactive
                                    ]}
                                >
                                    <Feather
                                        name={tab.icon}
                                        size={16}
                                        color={activeTab === tab.id ? '#1e1b4b' : '#cbd5e1'}
                                    />
                                    <Text style={[
                                        styles.tabLabel,
                                        activeTab === tab.id
                                            ? styles.tabLabelActive
                                            : styles.tabLabelInactive
                                    ]}>{tab.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                <View style={styles.mainContent}>
                    {renderContent()}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContent: { flexGrow: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    loadingText: { color: '#64748b', fontSize: 16 },
    errorText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
    heroSection: { backgroundColor: '#1e1b4b', padding: 20, paddingTop: 30, paddingBottom: 60 },
    heroHeader: { marginBottom: 20 },
    heroTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    heroSubtitle: { color: '#94a3b8', fontSize: 14 },
    tabBar: { marginTop: 10 },
    tabBarScroll: { gap: 8 },
    tabItem: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
        paddingVertical: 10, borderRadius: 12, gap: 8, borderWidth: 1
    },
    tabItemActive: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
    tabItemInactive: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.05)' },
    tabLabel: { fontSize: 14, fontWeight: '500' },
    tabLabelActive: { color: '#1e1b4b', fontWeight: 'bold' },
    tabLabelInactive: { color: '#cbd5e1' },
    mainContent: { marginTop: -30, paddingHorizontal: 20, paddingBottom: 30 },
    wipContainer: { flex: 1, padding: 48, alignItems: 'center', backgroundColor: 'white', borderRadius: 24, elevation: 2 },
    wipIconBg: { width: 80, height: 80, backgroundColor: '#f1f5f9', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    wipTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
    wipSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center' }
});

export default CompanyDashboard;
