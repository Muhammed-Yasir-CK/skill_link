import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
    Alert,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Header from '../../components/Header';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import JobCard from '../../components/JobCard';
import SearchBar from '../../components/SearchBar';
import { categories } from '../../data/jobs';
import api from '../../api/axios';

const { width } = Dimensions.get('window');

const Dashboard = () => {
    const navigation = useNavigation();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [filters, setFilters] = useState({
        query: '',
        location: '',
        category: '',
        type: '',
        workType: '',
        experience: ''
    });

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserDataAndJobs = async () => {
            try {
                // Fetch User
                const userRes = await api.get("accounts/me/");
                setUser(userRes.data);

                // Fetch Recommendations (Unified Ranked List)
                const jobsRes = await api.get("recommendations/jobs/");
                const data = jobsRes.data;

                // Sync with the backend unified format
                const formattedJobs = (data.results || data).map(item => ({
                    id: `${item.source}_${item.id}`,
                    source: item.source,
                    title: item.title,
                    company: item.company_name || item.company || "Company",
                    company_logo: item.company_logo,
                    location: item.location || "Remote",
                    type: item.source === 'company' ? 'Company' : 'Local Work',
                    workType: item.workType || item.employment_type || "On-site",
                    experience: item.experience || '',
                    salary: item.salary || "Not specified",
                    posted: item.posted
                        ? new Date(item.posted).toLocaleDateString()
                        : "Recently",
                    tags: item.tags || [],
                    raw_id: item.id,
                    score: item.score
                }));

                setJobs(formattedJobs);
                setFilteredJobs(formattedJobs);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                Alert.alert("Error", "Failed to load dashboard data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDataAndJobs();
    }, []);

    // Filtering Logic (Parity with Web)
    useEffect(() => {
        const data = jobs.filter(job => {
             const title = job.title?.toLowerCase() || "";
             const description = job.description?.toLowerCase() || "";
             const companyName = job.company?.toLowerCase() || "";
 
             const matchesQuery =
                 title.includes(filters.query.toLowerCase()) ||
                 description.includes(filters.query.toLowerCase()) ||
                 companyName.includes(filters.query.toLowerCase());

            const matchesLocation = job.location.toLowerCase().includes(filters.location.toLowerCase());
            const matchesCategory = filters.category === '' || (job.tags && job.tags.includes(filters.category));
            const matchesType = filters.type === '' || job.type === filters.type;
            const matchesWorkType = filters.workType === '' || job.workType === filters.workType;
            const matchesExperience = filters.experience === '' || job.experience === filters.experience;

            return matchesQuery && matchesLocation && matchesCategory && matchesType && matchesWorkType && matchesExperience;
        });
        setFilteredJobs(data);
    }, [filters, jobs]);

    if (isLoading) {
        return <Loading message="Loading dashboard..." />;
    }

    return (
        <View style={styles.container}>
            <Header />
            <FlatList
                data={filteredJobs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <JobCard job={item} />}
                ListHeaderComponent={
                    <View>
                        {/* Compact Mobile Hero */}
                        <View style={styles.hero}>
                            <View style={styles.heroContent}>
                                <View style={styles.greetingRow}>
                                    <View>
                                        <Text style={styles.welcomeText}>Hello,</Text>
                                        <Text style={styles.userName}>{user?.full_name?.split(' ')[0] || "User"} 👋</Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.walletButton} 
                                        onPress={() => navigation.navigate('SeekerWallet')}
                                    >
                                        <Feather name="credit-card" size={18} color="#fff" />
                                        <Text style={styles.walletButtonText}>Wallet</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.heroSubText}>
                                    <Text style={styles.highlight}>{jobs.length} recommendations</Text> waiting for you
                                </Text>
                            </View>
                        </View>

                        {/* Search & Listings */}
                        <View style={styles.content}>
                            <SearchBar
                                onSearch={() => { }}
                                filters={filters}
                                setFilters={setFilters}
                                categories={categories}
                            />

                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recommended for You</Text>
                                <Text style={styles.resultsText}>{filteredJobs.length} jobs found</Text>
                            </View>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <EmptyState 
                        icon="search"
                        title="No jobs found"
                        subtitle="No jobs found matching your criteria. Try adjusting your filters."
                    />
                }
                contentContainerStyle={styles.flatListContent}
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
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    flatListContent: {
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    hero: {
        backgroundColor: '#1e1b4b',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    heroContent: {
        zIndex: 1,
    },
    greetingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    welcomeText: {
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '500',
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    heroSubText: {
        fontSize: 14,
        color: '#64748b',
    },
    highlight: {
        color: '#818cf8',
        fontWeight: '700',
    },
    walletButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    walletButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 8,
    },
    content: {
        paddingHorizontal: 20,
        marginTop: -25,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    resultsText: {
        fontSize: 12,
        color: '#64748b',
    },
    emptyContainer: {
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    walletShortcut: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    walletShortcutText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
    }
});

export default Dashboard;
