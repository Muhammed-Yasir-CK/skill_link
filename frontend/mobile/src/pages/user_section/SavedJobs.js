import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import JobCard from '../../components/JobCard';
import Header from '../../components/Header';
import api from '../../api/axios';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const SavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSavedJobs = async () => {
        try {
            const res = await api.get('saved-jobs/');
            const data = res.data;

            const formattedJobs = data.map(item => {
                const raw = item.job_source === "company" ? item.company_job : item.user_job;
                if (!raw) return null;

                if (item.job_source === "company") {
                    return {
                        id: `company_${raw.id}`,
                        title: raw.title || "Untitled Job",
                        company: raw.company_name || "Company",
                        location: raw.location || "Not specified",
                        workType: raw.work_mode || raw.employment_type || "Full-time",
                        salary: raw.salary_min && raw.salary_max
                            ? `${raw.salary_currency || '$'} ${raw.salary_min} - ${raw.salary_max}`
                            : "Not specified",
                        posted: raw.created_at ? new Date(raw.created_at).toLocaleDateString() : "Recently",
                        tags: raw.skills || [],
                        is_saved: true,
                        saved_id: item.id,
                        source: "company",
                        raw_id: raw.id
                    };
                } else {
                    return {
                        id: `work_${raw.id}`,
                        title: raw.title || "Untitled Work",
                        company: "Local Work",
                        location: raw.city || raw.area
                            ? `${raw.city || ""} ${raw.area || ""}`.trim()
                            : "Not specified",
                        workType: raw.work_nature || "Work",
                        salary: raw.budget_min && raw.budget_max
                            ? `${raw.currency || '$'} ${raw.budget_min} - ${raw.budget_max}`
                            : "Not specified",
                        posted: raw.created_at ? new Date(raw.created_at).toLocaleDateString() : "Recently",
                        tags: raw.category ? [raw.category] : [],
                        is_saved: true,
                        saved_id: item.id,
                        source: "local",
                        raw_id: raw.id
                    };
                }
            }).filter(Boolean);

            setSavedJobs(formattedJobs);
        } catch (error) {
            console.error("Failed to fetch saved jobs:", error);
            Alert.alert("Error", "Could not fetch your saved items.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSavedJobs();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header />
                <Loading message="Fetching saved jobs..." />
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <Header />
            <FlatList
                data={savedJobs}
                keyExtractor={item => item.saved_id.toString()}
                renderItem={({ item }) => <JobCard job={item} />}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.title}>Saved Jobs ({savedJobs.length})</Text>
                    </View>
                }
                ListEmptyComponent={
                    <EmptyState 
                        title="No Saved Jobs" 
                        message="Items you bookmark will appear here."
                        icon="bookmark"
                    />
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollWrapper: {
        padding: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    list: {
        gap: 16,
        paddingBottom: 40,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: 20
    },
    emptyText: {
        marginTop: 12,
        fontSize: 15,
        color: '#64748b',
        fontWeight: '500'
    }
});

export default SavedJobs;
