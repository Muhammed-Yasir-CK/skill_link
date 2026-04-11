import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Header from '../components/Header';


const COMPANIES_DATA = [
    {
        id: 1,
        name: "TechFlow Systems",
        logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=100&h=100&q=80",
        industry: "SaaS / Enterprise",
        location: "San Francisco, CA",
        description: "Building the next generation of workflow automation tools for enterprise teams.",
        openJobs: 12,
        tags: ["React", "Node.js", "AI"]
    },
    {
        id: 2,
        name: "Creative Pulse",
        logo: "https://images.unsplash.com/photo-1572044162444-ad6021194360?auto=format&fit=crop&w=100&h=100&q=80",
        industry: "Design Agency",
        location: "London, UK (Remote)",
        description: "Award-winning digital agency crafting immersive brand experiences.",
        openJobs: 4,
        tags: ["UI/UX", "Figma", "Branding"]
    },
    {
        id: 3,
        name: "GreenLeaf Energy",
        logo: "https://images.unsplash.com/photo-1516876437184-593fda40c7ce?auto=format&fit=crop&w=100&h=100&q=80",
        industry: "CleanTech",
        location: "Berlin, Germany",
        description: "Innovating sustainable energy solutions for a greener planet.",
        openJobs: 8,
        tags: ["Engineering", "IoT", "Solar"]
    },
    {
        id: 4,
        name: "FinSecure",
        logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=100&h=100&q=80",
        industry: "Fintech",
        location: "New York, NY",
        description: "Secure and seamless payment infrastructure for modern businesses.",
        openJobs: 15,
        tags: ["Cybersecurity", "Blockchain", "Python"]
    },
    {
        id: 5,
        name: "EduSphere",
        logo: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=100&h=100&q=80",
        industry: "EdTech",
        location: "Toronto, Canada",
        description: "Democratizing education through accessible online learning platforms.",
        openJobs: 6,
        tags: ["Education", "Video", "Community"]
    },
    {
        id: 6,
        name: "HealthConnect",
        logo: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=100&h=100&q=80",
        industry: "Healthcare",
        location: "Austin, TX",
        description: "Connecting patients with specialists through telemedicine.",
        openJobs: 9,
        tags: ["Mobile App", "React Native", "Health"]
    }
];

const Company = ({ navigation }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCompanies = COMPANIES_DATA.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1e1b4b" />
            <Header />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>Discover Top Companies</Text>
                    <Text style={styles.heroSubtitle}>
                        Explore the best workplaces, from fast-growing startups to industry leaders. Find your next dream team.
                    </Text>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Feather name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by company name or industry..."
                            placeholderTextColor="#94a3b8"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.contentSection}>
                    {filteredCompanies.length > 0 ? (
                        filteredCompanies.map(company => (
                            <View key={company.id} style={styles.companyCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.logoContainer}>
                                        <Image source={{ uri: company.logo }} style={styles.logo} />
                                    </View>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{company.openJobs} Open Jobs</Text>
                                    </View>
                                </View>

                                <Text style={styles.companyName}>{company.name}</Text>
                                <View style={styles.industryRow}>
                                    <Feather name="briefcase" size={14} color="#64748b" />
                                    <Text style={styles.industryText}>{company.industry}</Text>
                                </View>

                                <Text style={styles.description} numberOfLines={3}>
                                    {company.description}
                                </Text>

                                <View style={styles.tagContainer}>
                                    {company.tags.map(tag => (
                                        <View key={tag} style={styles.tag}>
                                            <Text style={styles.tagText}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.cardFooter}>
                                    <View style={styles.locationRow}>
                                        <Feather name="map-pin" size={14} color="#64748b" />
                                        <Text style={styles.locationText}>{company.location.split(',')[0]}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.viewButton}
                                        onPress={() => navigation.navigate('JobDetails')} // Simplified for now
                                    >
                                        <Text style={styles.viewButtonText}>View Opportunities</Text>
                                        <Feather name="external-link" size={14} color="#1e1b4b" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Feather name="search" size={48} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>No companies found</Text>
                            <Text style={styles.emptySubtitle}>Try adjusting your search terms to find what you're looking for.</Text>
                        </View>
                    )}
                </View>


            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContent: { flexGrow: 1 },
    heroSection: { backgroundColor: '#1e1b4b', padding: 24, paddingBottom: 60, alignItems: 'center' },
    heroTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
    heroSubtitle: { color: '#94a3b8', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12, paddingHorizontal: 16, width: '100%', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)'
    },
    searchIcon: { marginRight: 12 },
    searchInput: { flex: 1, color: 'white', paddingVertical: 14, fontSize: 16 },
    contentSection: { padding: 20, marginTop: -32 },
    companyCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    logoContainer: { width: 64, height: 64, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' },
    logo: { width: '100%', height: '100%' },
    badge: { backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#f59e0b', fontSize: 12, fontWeight: 'bold' },
    companyName: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
    industryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    industryText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
    description: { color: '#475569', fontSize: 14, lineHeight: 20, marginBottom: 16 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    tag: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    tagText: { color: '#64748b', fontSize: 12, fontWeight: '500' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    locationText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
    viewButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    viewButtonText: { color: '#1e1b4b', fontSize: 14, fontWeight: 'bold' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, backgroundColor: 'white', borderRadius: 16 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginTop: 16, marginBottom: 8 },
    emptySubtitle: { color: '#64748b', fontSize: 14, textAlign: 'center', paddingHorizontal: 40 }
});

export default Company;
