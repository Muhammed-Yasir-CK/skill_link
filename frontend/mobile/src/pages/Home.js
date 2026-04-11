import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, RefreshControl, Alert, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { categories } from '../data/jobs';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Home = ({ navigation }) => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        if (user) {
            if (user.role === 'company') {
                navigation.replace('CompanyDashboard');
            } else {
                navigation.replace('Seeker');
            }
        }
    }, [user]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filters, setFilters] = useState({
        query: '',
        location: '',
        category: '',
        type: '',
        workType: '',
        experience: ''
    });

    const fetchJobs = async () => {
        try {
            const response = await api.get('seeker-jobs/');
            const rawCompanyJobs = response.data.company_jobs || [];
            const rawUserWorks = response.data.common_user_works || [];

            // Map Company Jobs
            const formattedCompanyJobs = rawCompanyJobs.map(job => ({
                id: `company_${job.id}`,
                title: job.title,
                company: job.company_name || 'Company',
                location: job.location,
                type: 'Company',
                workType: job.work_mode || 'On-site',
                experience: job.experience || '',
                salary: job.salary_min && job.salary_max 
                    ? `${job.salary_currency || '$'}${job.salary_min} - ${job.salary_max}`
                    : 'Not specified',
                posted: new Date(job.created_at).toLocaleDateString(),
                tags: job.skills || [],
                raw_id: job.id
            }));

            // Map Local Works
            const formattedUserWorks = rawUserWorks.map(work => ({
                id: `work_${work.id}`,
                title: work.title,
                company: 'Individual', // Indicates it's an individual post
                location: work.city || 'Remote',
                type: 'Local Work',
                workType: work.work_nature || 'Contract',
                experience: work.experience_level || '',
                salary: work.budget_min && work.budget_max
                    ? `${work.currency || '$'}${work.budget_min} - ${work.budget_max}`
                    : 'Not specified',
                posted: new Date(work.created_at).toLocaleDateString(),
                tags: work.category ? [work.category] : [],
                raw_id: work.id
            }));

            const allJobs = [...formattedCompanyJobs, ...formattedUserWorks];
            setJobs(allJobs);
            setFilteredJobs(allJobs);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            Alert.alert("Error", "Failed to fetch jobs. Please check your connection.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchJobs();
    }, []);

    useEffect(() => {
        const data = jobs.filter(job => {
            // Search Query
            const matchesQuery = job.title.toLowerCase().includes(filters.query.toLowerCase()) ||
                job.company.toLowerCase().includes(filters.query.toLowerCase()) ||
                (job.tags && job.tags.some(tag => tag.toLowerCase().includes(filters.query.toLowerCase())));

            // Location
            const matchesLocation = job.location.toLowerCase().includes(filters.location.toLowerCase());

            // Dropdowns
            const matchesCategory = filters.category === '' || (job.tags && job.tags.includes(filters.category));
            const matchesType = filters.type === '' || job.type === filters.type;
            const matchesWorkType = filters.workType === '' || job.workType === filters.workType;
            const matchesExperience = filters.experience === '' || job.experience === filters.experience;

            return matchesQuery && matchesLocation && matchesCategory && matchesType && matchesWorkType && matchesExperience;
        });
        setFilteredJobs(data);
    }, [filters, jobs]);

    return (
        <View style={styles.container}>
            <Header />

            <FlatList
                data={filteredJobs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <JobCard job={item} />}
                ListHeaderComponent={
                    <View style={styles.headerComponent}>
                        {/* Hero Section */}
                        <View style={styles.heroSection}>
                            <View style={styles.heroBgShape1} />
                            <View style={styles.heroContent}>
                                <Text style={styles.heroTitle}>
                                    Find your next <Text style={styles.accentText}>chapter</Text>.
                                </Text>
                                <Text style={styles.heroSubtitle}>
                                    Connect with top-tier companies and startups.
                                </Text>
                            </View>
                        </View>

                        {/* Content Section */}
                        <View style={styles.contentSection}>
                            <SearchBar
                                onSearch={() => { }}
                                filters={filters}
                                setFilters={setFilters}
                                categories={categories}
                            />

                            <View style={styles.resultsHeader}>
                                <View>
                                    <Text style={styles.sectionTitle}>Latest Opportunities</Text>
                                    <Text style={styles.sectionSubtitle}>Tailored specifically for you.</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{filteredJobs.length} results</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    loading && !refreshing ? (
                        <View style={{ height: 200 }}>
                            <Loading message="Finding jobs..." />
                        </View>
                    ) : (
                        <EmptyState 
                            icon="search"
                            title="No matching jobs found"
                            subtitle="Try adjusting your filters or search keywords."
                        />
                    )
                }
                contentContainerStyle={styles.flatListContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={Platform.OS === 'android'}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    flatListContent: { paddingBottom: 40 },
    headerComponent: { marginBottom: 16 },
    heroSection: {
        backgroundColor: '#1e1b4b',
        paddingTop: 30,
        paddingBottom: 40,
        paddingHorizontal: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    heroBgShape1: {
        position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: 75,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    heroContent: { alignItems: 'flex-start', zIndex: 10 },
    heroTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'left', marginBottom: 8, lineHeight: 34 },
    accentText: { color: '#f59e0b' },
    heroSubtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'left', lineHeight: 22, fontWeight: '400' },
    contentSection: { paddingHorizontal: 16, marginTop: 16 },
    resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, marginTop: 24 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e1b4b' },
    sectionSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
    badge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    badgeText: { fontSize: 11, fontWeight: '600', color: '#64748b' },
});

export default Home;
