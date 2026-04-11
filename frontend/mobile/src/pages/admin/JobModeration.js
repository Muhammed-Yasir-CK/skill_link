import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';

const JobModeration = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Mock Data parity with web
    const [jobs, setJobs] = useState([
        { id: 1, title: 'Senior Frontend Developer', company: 'Tech Innovations', postedDate: '2024-03-20', status: 'Pending' },
        { id: 2, title: 'Marketing Manager', company: 'Creative Studio', postedDate: '2024-03-19', status: 'Approved' },
        { id: 3, title: 'Data Entry Clerk', company: 'Fast Cash Ltd', postedDate: '2024-03-21', status: 'Pending' },
        { id: 4, title: 'Backend Engineer', company: 'Global Logistics', postedDate: '2024-03-18', status: 'Rejected' },
    ]);

    const handleAction = (id, action) => {
        if (action === 'Remove') {
            Alert.alert(
                "Remove Job",
                "Are you sure you want to remove this job post as Scam?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Remove", style: "destructive", onPress: () => setJobs(prev => prev.filter(job => job.id !== id)) }
                ]
            );
            return;
        }

        setJobs(prev => prev.map(job =>
            job.id === id ? { ...job, status: action } : job
        ));
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate fetch
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderJob = ({ item }) => (
        <View style={styles.jobCard}>
            <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.jobCompany}>{item.company}</Text>
                <Text style={styles.jobDate}>{item.postedDate}</Text>
            </View>
            <View style={styles.statusSection}>
                <View style={[styles.statusBadge, getBadgeStyle(item.status)]}>
                    <Text style={[styles.statusText, getBadgeTextStyle(item.status)]}>{item.status}</Text>
                </View>
                <View style={styles.actionRow}>
                    {item.status === 'Pending' && (
                        <>
                            <TouchableOpacity style={styles.miniBtn} onPress={() => handleAction(item.id, 'Approved')}>
                                <Feather name="check" size={16} color="#15803d" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.miniBtn} onPress={() => handleAction(item.id, 'Rejected')}>
                                <Feather name="x" size={16} color="#b91c1c" />
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity style={styles.miniBtn} onPress={() => handleAction(item.id, 'Remove')}>
                        <Feather name="trash-2" size={16} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Job Moderation</Text>
                <View style={styles.searchBox}>
                    <Feather name="search" size={18} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                </View>
            </View>

            <FlatList
                data={filteredJobs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderJob}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
        </View>
    );
};

const getBadgeStyle = (status) => {
    switch(status) {
        case 'Approved': return { backgroundColor: '#dcfce7' };
        case 'Pending': return { backgroundColor: '#fef9c3' };
        case 'Rejected': return { backgroundColor: '#fee2e2' };
        default: return { backgroundColor: '#f1f5f9' };
    }
}

const getBadgeTextStyle = (status) => {
    switch(status) {
        case 'Approved': return { color: '#15803d' };
        case 'Pending': return { color: '#a16207' };
        case 'Rejected': return { color: '#b91c1c' };
        default: return { color: '#64748b' };
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 24, paddingTop: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 16 },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, height: 44 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1e293b' },
    listContent: { padding: 16 },
    jobCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between' },
    jobInfo: { flex: 1 },
    jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    jobCompany: { fontSize: 13, color: '#64748b', marginTop: 4 },
    jobDate: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
    statusSection: { alignItems: 'flex-end', gap: 12 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    actionRow: { flexDirection: 'row', gap: 8 },
    miniBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' }
});

export default JobModeration;
