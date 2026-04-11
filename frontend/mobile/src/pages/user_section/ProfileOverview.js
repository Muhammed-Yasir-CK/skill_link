import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../api/axios';
import { useNavigation } from '@react-navigation/native';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const { width } = Dimensions.get('window');

const ProfileOverview = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/accounts/seeker/profile/');
                setProfile(res.data);
            } catch (err) {
                console.error('Failed to load profile', err);
                Alert.alert("Error", "Could not load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <Loading message="Syncing profile..." />;

    if (!profile) {
        return (
            <View style={styles.centerContainer}>
                <EmptyState 
                    title="Profile Not Found"
                    message="We couldn't retrieve your profile information."
                    icon="user-x"
                />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
                {/* Header Section */}
                <View style={styles.headerRow}>
                    <View style={styles.profileMain}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={
                                    profile.profile_picture
                                        ? { uri: profile.profile_picture }
                                        : require('../../assets/favicon.png') // Fallback
                                }
                                style={styles.avatar}
                                defaultSource={require('../../assets/favicon.png')}
                            />
                        </View>
                        <View style={styles.infoCol}>
                            <Text style={styles.name}>{profile.full_name}</Text>
                            <Text style={styles.profession}>{profile.profession || 'Profession not set'}</Text>

                            <View style={styles.metaRow}>
                                {profile.location ? (
                                    <View style={styles.metaItem}>
                                        <Feather name="map-pin" size={14} color="#64748b" />
                                        <Text style={styles.metaText}>{profile.location}</Text>
                                    </View>
                                ) : null}

                                {profile.experience_level !== null ? (
                                    <View style={styles.metaItem}>
                                        <Feather name="briefcase" size={14} color="#64748b" />
                                        <Text style={styles.metaText}>{profile.experience_level} Years Exp</Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => navigation.navigate('SeekerSettings')}
                    >
                        <Text style={styles.editBtnText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Content Grid (About & Skills) */}
                <View style={styles.detailsGrid}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About Me</Text>
                        <Text style={styles.aboutText}>
                            {profile.summary || 'No description added yet.'}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillsContainer}>
                            {profile.skills?.length > 0 ? (
                                profile.skills.map(skill => (
                                    <View key={skill} style={styles.skillTag}>
                                        <Text style={styles.skillText}>{skill}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptySkills}>No skills added</Text>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 12,
        color: '#64748b',
        fontSize: 14,
    },
    errorText: {
        marginTop: 12,
        color: '#64748b',
        fontSize: 16,
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 24,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 2 }
        })
    },
    headerRow: {
        marginBottom: 32,
    },
    profileMain: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    avatarWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f5f9',
        borderWidth: 4,
        borderColor: '#fff',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 4 }
        }),
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    infoCol: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    profession: {
        fontSize: 16,
        color: '#3b82f6',
        fontWeight: '600',
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        color: '#64748b',
    },
    editBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    editBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    detailsGrid: {
        gap: 24,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    aboutText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillTag: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    skillText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#475569',
    },
    emptySkills: {
        fontSize: 13,
        color: '#94a3b8',
        fontStyle: 'italic',
    }
});

export default ProfileOverview;
