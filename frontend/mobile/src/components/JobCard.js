import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const JobCard = ({ job }) => {
    const navigation = useNavigation();
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        setIsSaved(!isSaved);
    };

    const handlePress = () => {
        navigation.navigate('JobDetails', { id: job.id });
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            style={styles.card}
        >
            <View style={styles.headerRow}>
                <View style={styles.leftGroup}>
                    <View style={styles.companyIconBg}>
                        {job.company_logo ? (
                            <Image 
                                source={{ uri: job.company_logo }} 
                                style={styles.companyLogo}
                                resizeMode="contain"
                            />
                        ) : (
                            <Text style={styles.companyInitial}>
                                {job.company?.charAt(0)}
                            </Text>
                        )}
                    </View>
                    <View style={styles.titleInfo}>
                        <Text style={styles.jobTitle} numberOfLines={1}>
                            {job.title}
                        </Text>
                        <View style={styles.subInfoRow}>
                            <Text style={styles.brandName}>{job.company}</Text>
                            <View style={styles.dot} />
                            <View style={styles.locationGroup}>
                                <Feather name="map-pin" size={12} color="#64748b" style={{ marginRight: 4 }} />
                                <Text style={styles.metaText}>{job.location}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleSave}
                    style={styles.saveBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather
                        name="heart"
                        size={20}
                        color={isSaved ? '#ef4444' : '#94a3b8'}
                        style={isSaved ? styles.heartFilled : null}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.middleMeta}>
                <View style={styles.metaBadge}>
                    <Feather name="briefcase" size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                    <Text style={styles.metaLabelText}>{job.workType || 'Full-time'}</Text>
                </View>
                <View style={styles.metaBadge}>
                    <Feather name="dollar-sign" size={14} color="#94a3b8" style={{ marginRight: 4 }} />
                    <Text style={styles.metaLabelText}>{job.salary}</Text>
                </View>
                <View style={styles.metaBadge}>
                    <Feather name="clock" size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                    <Text style={styles.metaLabelText}>{job.posted}</Text>
                </View>
            </View>

            <View style={styles.actionRow}>
                <View style={styles.tagWrapper}>
                    {job.tags?.slice(0, 2).map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={styles.detailsBtn}
                        onPress={handlePress}
                    >
                        <Text style={styles.detailsBtnText}>Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.applyBtn}
                        onPress={() => alert('Application flow coming soon!')}
                    >
                        <Text style={styles.applyBtnText}>Apply</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    leftGroup: {
        flexDirection: 'row',
        flex: 1,
        gap: 12,
    },
    companyIconBg: {
        width: 48,
        height: 48,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    companyInitial: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#475569',
    },
    companyLogo: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    titleInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 4,
    },
    subInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e1b4b',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#cbd5e1',
        marginHorizontal: 8,
    },
    locationGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 13,
        color: '#64748b',
    },
    saveBtn: {
        padding: 4,
    },
    heartFilled: {
        // Style handled by color prop, but can add shadow if needed
    },
    middleMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 16,
    },
    metaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaLabelText: {
        fontSize: 13,
        color: '#64748b',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        gap: 12,
    },
    tagWrapper: {
        flexDirection: 'row',
        gap: 6,
        flex: 1,
    },
    tag: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 8,
    },
    detailsBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#ffffff',
    },
    detailsBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1e1b4b',
    },
    applyBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f59e0b',
    },
    applyBtnText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#ffffff',
    },
});

export default JobCard;
