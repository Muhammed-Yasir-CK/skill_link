import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Platform,
    Dimensions,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../api/axios';
import Notification from '../../components/Notification';

const { width } = Dimensions.get('window');

const SeekerSettings = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState({
        isVisible: false,
        type: 'success',
        message: ''
    });

    const [userData, setUserData] = useState({
        profile_picture: null,
        full_name: "",
        email: "",
        mobile: "",
        profession: "",
        other_profession: "",
        country: "India",
        state: "",
        city: "",
        area: "",
        pincode: "",
        location: "",
        travel_willingness: "Within city",
        availability_status: "Available now",
        work_modes: [],
        experience_level: "",
        skills: [],
        newSkill: "",
        resume: null,
        workProof: null,
        education: {
            qualification: "",
            institution: "",
            year: ""
        },
        summary: ""
    });

    const [paymentSettings, setPaymentSettings] = useState({
        walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        network: 'Polygon Mainnet',
        isConnected: true,
        paymentMode: 'Escrow',
        autoRelease: false,
        preferredToken: 'USDT',
        balance: '450.00',
    });

    const PROFESSIONS = [
        'Software Engineer', 'Designer', 'Data Entry Operator', 'Tutor',
        'Electrician', 'Plumber', 'Carpenter', 'Painter',
        'Delivery Executive', 'Driver', 'Construction Worker', 'Cleaner',
        'Freelance Worker', 'Daily Wage Worker', 'Other'
    ];

    const TRAVEL_OPTIONS = ['Within city', 'Nearby districts', 'Anywhere'];
    const AVAILABILITY_OPTIONS = ['Available now', 'Available part-time', 'Available on weekends', 'Not available currently'];
    const EXPERIENCE_OPTIONS = ['Fresher', '1–3 years', '3–5 years', '5+ years', 'Not applicable'];
    const WORK_MODES = ['Onsite', 'Hybrid', 'Remote'];

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await api.get('/accounts/seeker/profile/');
            const data = res.data;

            setUserData(prev => ({
                ...prev,
                ...data,
                work_modes: Array.isArray(data.work_modes) ? data.work_modes : [],
                skills: Array.isArray(data.skills) ? data.skills : [],
                education: {
                    qualification: data.qualification || '',
                    institution: data.institution || '',
                    year: data.year || ''
                }
            }));
        } catch (err) {
            console.error("Profile load failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const patchData = {
                full_name: userData.full_name,
                mobile: userData.mobile,
                profession: userData.profession,
                other_profession: userData.other_profession,
                country: userData.country,
                state: userData.state,
                city: userData.city,
                area: userData.area,
                pincode: userData.pincode,
                location: userData.location,
                travel_willingness: userData.travel_willingness,
                availability_status: userData.availability_status,
                experience_level: userData.experience_level,
                summary: userData.summary,
                qualification: userData.education.qualification,
                institution: userData.education.institution,
                year: userData.education.year,
                work_modes: userData.work_modes,
                skills: userData.skills
            };

            await api.patch('/accounts/seeker/profile/', patchData);

            setNotification({
                isVisible: true,
                type: 'success',
                message: 'Profile saved successfully'
            });
        } catch (err) {
            setNotification({
                isVisible: true,
                type: 'error',
                message: 'Failed to save profile'
            });
        }
    };

    const toggleWorkMode = (mode) => {
        setUserData(prev => {
            const current = prev.work_modes;
            if (current.includes(mode)) {
                return { ...prev, work_modes: current.filter(m => m !== mode) };
            } else {
                return { ...prev, work_modes: [...current, mode] };
            }
        });
    };

    const addSkill = () => {
        if (userData.newSkill.trim() && !userData.skills.includes(userData.newSkill.trim())) {
            setUserData(prev => ({
                ...prev,
                skills: [...prev.skills, prev.newSkill.trim()],
                newSkill: ''
            }));
        }
    };

    const removeSkill = (skillToRemove) => {
        setUserData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const renderTabContent = () => {
        if (activeTab === 'personal') {
            return (
                <View style={styles.tabPane}>
                    {/* Basic Info */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Feather name="user" size={18} color="#4338ca" />
                            <Text style={styles.sectionTitle}>Basic Profile Information</Text>
                        </View>

                        <View style={styles.avatarRow}>
                            <View style={styles.avatarContainer}>
                                {userData.profile_picture ? (
                                    <Image source={{ uri: userData.profile_picture }} style={styles.avatarImg} />
                                ) : (
                                    <Text style={styles.avatarInitial}>{userData.full_name?.[0] || 'U'}</Text>
                                )}
                            </View>
                            <View style={styles.avatarActions}>
                                <Text style={styles.avatarLabel}>Profile Photo</Text>
                                <Text style={styles.avatarHint}>JPG or PNG. Max 2MB.</Text>
                                <TouchableOpacity onPress={() => Alert.alert("Upload Profile Photo", "File picker not implemented in mobile for this turn.")}>
                                    <Text style={styles.uploadLink}>Upload New</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.inputLabel}>FULL NAME *</Text>
                        <TextInput
                            style={styles.input}
                            value={userData.full_name}
                            onChangeText={(text) => setUserData({ ...userData, full_name: text })}
                            placeholder="Muhammed Yasir"
                        />

                        <Text style={styles.inputLabel}>PHONE NUMBER *</Text>
                        <View style={styles.inputWithIcon}>
                            <Feather name="smartphone" size={16} color="#94a3b8" style={styles.fieldIcon} />
                            <TextInput
                                style={styles.inputIconText}
                                value={userData.mobile}
                                onChangeText={(text) => setUserData({ ...userData, mobile: text })}
                                placeholder="+1 234 567 890"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                        <View style={[styles.inputWithIcon, styles.disabledInput]}>
                            <Feather name="mail" size={16} color="#cbd5e1" style={styles.fieldIcon} />
                            <TextInput
                                style={[styles.inputIconText, styles.disabledText]}
                                value={userData.email}
                                editable={false}
                            />
                        </View>

                        <Text style={styles.inputLabel}>PROFESSION / WORK TYPE *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectionRow}>
                            {PROFESSIONS.map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.pill, userData.profession === p && styles.selectedPill]}
                                    onPress={() => setUserData({ ...userData, profession: p })}
                                >
                                    <Text style={[styles.pillText, userData.profession === p && styles.selectedPillText]}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Location & Availability */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Feather name="map-pin" size={18} color="#4338ca" />
                            <Text style={styles.sectionTitle}>Current Location & Availability</Text>
                        </View>

                        <View style={styles.locationForm}>
                            <View style={styles.formRow}>
                                <View style={styles.halfWidth}>
                                    <Text style={styles.inputLabel}>CITY</Text>
                                    <TextInput style={styles.input} value={userData.city} onChangeText={t => setUserData({ ...userData, city: t })} />
                                </View>
                                <View style={styles.halfWidth}>
                                    <Text style={styles.inputLabel}>AREA</Text>
                                    <TextInput style={styles.input} value={userData.area} onChangeText={t => setUserData({ ...userData, area: t })} />
                                </View>
                            </View>
                            <Text style={styles.inputLabel}>PINCODE</Text>
                            <TextInput style={styles.input} value={userData.pincode} onChangeText={t => setUserData({ ...userData, pincode: t })} keyboardType="numeric" />
                        </View>

                        <Text style={styles.inputLabel}>WORK MODES</Text>
                        <View style={styles.modesGrid}>
                            {WORK_MODES.map(mode => (
                                <TouchableOpacity
                                    key={mode}
                                    style={[styles.modeBtn, userData.work_modes.includes(mode) && styles.selectedMode]}
                                    onPress={() => toggleWorkMode(mode)}
                                >
                                    <Text style={[styles.modeBtnText, userData.work_modes.includes(mode) && styles.selectedModeText]}>{mode}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Professional Details */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Feather name="briefcase" size={18} color="#4338ca" />
                            <Text style={styles.sectionTitle}>Professional Details</Text>
                        </View>

                        <Text style={styles.inputLabel}>EXPERIENCE LEVEL</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectionRow}>
                            {EXPERIENCE_OPTIONS.map(opt => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[styles.pill, userData.experience_level === opt && styles.selectedPill]}
                                    onPress={() => setUserData({ ...userData, experience_level: opt })}
                                >
                                    <Text style={[styles.pillText, userData.experience_level === opt && styles.selectedPillText]}>{opt}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.inputLabel}>SKILLS *</Text>
                        <View style={styles.skillsList}>
                            {userData.skills.map(skill => (
                                <View key={skill} style={styles.skillBadge}>
                                    <Text style={styles.skillBadgeText}>{skill}</Text>
                                    <TouchableOpacity onPress={() => removeSkill(skill)}>
                                        <Feather name="x" size={12} color="#4338ca" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                        <View style={styles.addSkillRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                placeholder="Add skill (e.g. React, Driving)"
                                value={userData.newSkill}
                                onChangeText={t => setUserData({ ...userData, newSkill: t })}
                            />
                            <TouchableOpacity style={styles.addBtn} onPress={addSkill}>
                                <Feather name="plus" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>PROFILE SUMMARY</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            numberOfLines={4}
                            value={userData.summary}
                            onChangeText={t => setUserData({ ...userData, summary: t })}
                            placeholder="Briefly describe who you are..."
                        />
                    </View>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Save Profile</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (activeTab === 'security') {
            return (
                <View style={styles.tabPane}>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Feather name="lock" size={18} color="#4338ca" />
                            <Text style={styles.sectionTitle}>Change Password</Text>
                        </View>

                        <Text style={styles.inputLabel}>CURRENT PASSWORD</Text>
                        <TextInput style={styles.input} secureTextEntry placeholder="••••••••" />

                        <Text style={styles.inputLabel}>NEW PASSWORD</Text>
                        <TextInput style={styles.input} secureTextEntry placeholder="Min. 8 characters" />

                        <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
                        <TextInput style={styles.input} secureTextEntry placeholder="Re-enter password" />

                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#4338ca' }]}>
                            <Text style={styles.saveBtnText}>Update Password</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        if (activeTab === 'payment') {
            return (
                <View style={styles.tabPane}>
                    <View style={styles.paymentCard}>
                        <View style={styles.paymentHeader}>
                            <View style={styles.walletIcon}>
                                <Feather name="shield" size={24} color="#10b981" />
                            </View>
                            <View>
                                <Text style={styles.walletStatus}>MetaMask Connected</Text>
                                <Text style={styles.walletAddress}>{paymentSettings.walletAddress.substring(0, 6)}...{paymentSettings.walletAddress.substring(34)}</Text>
                            </View>
                        </View>
                        <View style={styles.balanceRow}>
                            <Text style={styles.balanceLabel}>Current Balance</Text>
                            <Text style={styles.balanceValue}>${paymentSettings.balance}</Text>
                        </View>
                        <TouchableOpacity style={styles.disconnectBtn}>
                            <Text style={styles.disconnectText}>Disconnect Wallet</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment Preferences</Text>
                        <View style={styles.prefRow}>
                            <Text style={styles.prefLabel}>Preferred Token</Text>
                            <Text style={styles.prefValue}>{paymentSettings.preferredToken}</Text>
                        </View>
                        <View style={styles.prefRow}>
                            <Text style={styles.prefLabel}>Payment Mode</Text>
                            <Text style={styles.prefValue}>{paymentSettings.paymentMode}</Text>
                        </View>
                    </View>
                </View>
            );
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4338ca" />
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <Notification
                isVisible={notification.isVisible}
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification({ ...notification, isVisible: false })}
            />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <View style={styles.tabScrollWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow} contentContainerStyle={styles.tabsContent}>
                    {[
                        { id: 'personal', label: 'Personal', icon: 'user' },
                        { id: 'security', label: 'Security', icon: 'shield' },
                        { id: 'payment', label: 'Payment', icon: 'credit-card' }
                    ].map(tab => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tabBtn, activeTab === tab.id && styles.activeTabBtn]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Feather name={tab.icon} size={16} color={activeTab === tab.id ? '#fff' : '#94a3b8'} />
                            <Text style={[styles.tabBtnText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                {renderTabContent()}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 24,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    tabScrollWrapper: {
        marginBottom: 8,
    },
    tabsRow: {
        paddingHorizontal: 16,
    },
    tabsContent: {
        paddingBottom: 8,
    },
    tabBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 8,
    },
    activeTabBtn: {
        backgroundColor: '#1e1b4b',
        borderColor: '#1e1b4b',
    },
    tabBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748b',
    },
    activeTabText: {
        color: '#fff',
    },
    contentScroll: {
        flex: 1,
    },
    tabPane: {
        padding: 20,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 20,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 2 }
        })
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 24,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    avatarInitial: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#cbd5e1',
    },
    avatarActions: {
        flex: 1,
    },
    avatarLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    avatarHint: {
        fontSize: 12,
        color: '#94a3b8',
        marginVertical: 4,
    },
    uploadLink: {
        color: '#4338ca',
        fontWeight: 'bold',
        fontSize: 14,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 14 : 10,
        fontSize: 15,
        color: '#0f172a',
        marginBottom: 20,
        fontWeight: '500',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    fieldIcon: {
        marginRight: 10,
    },
    inputIconText: {
        flex: 1,
        paddingVertical: Platform.OS === 'ios' ? 14 : 10,
        fontSize: 15,
        color: '#0f172a',
        fontWeight: '500',
    },
    disabledInput: {
        backgroundColor: '#f8fafc',
        borderColor: '#f1f5f9',
    },
    disabledText: {
        color: '#94a3b8',
    },
    selectionRow: {
        marginBottom: 20,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginRight: 8,
    },
    pillText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    selectedPill: {
        backgroundColor: '#e0e7ff',
        borderColor: '#4338ca',
    },
    selectedPillText: {
        color: '#4338ca',
    },
    locationForm: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        marginBottom: 20,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    modesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    modeBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    modeBtnText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#64748b',
    },
    selectedMode: {
        backgroundColor: '#4338ca',
        borderColor: '#4338ca',
    },
    selectedModeText: {
        color: '#fff',
    },
    skillsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    skillBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef2ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e7ff',
        gap: 6,
    },
    skillBadgeText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#4338ca',
    },
    addSkillRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    addBtn: {
        width: 50,
        height: 48,
        backgroundColor: '#4338ca',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveBtn: {
        backgroundColor: '#1e1b4b',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 12,
        ...Platform.select({
            ios: { shadowColor: '#1e1b4b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
            android: { elevation: 6 }
        })
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    paymentCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 24,
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    walletIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#ecfdf5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    walletStatus: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#065f46',
    },
    walletAddress: {
        fontSize: 14,
        color: '#64748b',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    balanceLabel: {
        fontSize: 15,
        color: '#64748b',
        fontWeight: '500',
    },
    balanceValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    disconnectBtn: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    disconnectText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    prefRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    prefLabel: {
        fontSize: 15,
        color: '#64748b',
    },
    prefValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0f172a',
    }
});

export default SeekerSettings;
