import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Modal, Dimensions, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../api/axios';

const { width } = Dimensions.get('window');

const Signup = ({ navigation }) => {
    const [userType, setUserType] = useState('seeker'); // 'seeker' or 'employer'
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Animation for toggle sliding
    const [slideAnim] = useState(new Animated.Value(0));

    const handleToggle = (type) => {
        setUserType(type);
        Animated.spring(slideAnim, {
            toValue: type === 'employer' ? 1 : 0,
            useNativeDriver: false,
            tension: 40,
            friction: 7
        }).start();
    };

    const handleSubmit = async () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            let url = '';
            let payload = {};

            if (userType === 'seeker') {
                url = 'accounts/register/seeker/';
                payload = {
                    username: email.split('@')[0],   // auto username
                    email: email,
                    password: password,
                    password2: confirmPassword
                };
            } else {
                url = 'accounts/register/company/';
                payload = {
                    username: username,
                    email: email,
                    password: password,
                    password2: confirmPassword,
                    company_name: name
                };
            }

            await api.post(url, payload);

            // Show success notification
            setShowSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                setShowSuccess(false);
                navigation.navigate('Login');
            }, 2000);

        } catch (error) {
            console.error("Signup error:", error.response?.data || error.message);
            if (error.response) {
                alert(JSON.stringify(error.response.data));
            } else {
                alert("Server error. Please check your connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    const benefits = userType === 'seeker' ? [
        "Apply to top tech companies",
        "Get salary insights",
        "Showcase your portfolio"
    ] : [
        "Post unlimited jobs",
        "Access powerful candidate search",
        "Manage applications easily"
    ];

    const translateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, (width - 60) / 2] // Adjust based on toggle padding/width
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1e1b4b" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Visual/Branding Section */}
                    <View style={[styles.brandingSection, userType === 'seeker' ? styles.bgSeeker : styles.bgEmployer]}>
                        <View style={styles.orb1} />
                        <View style={styles.orb2} />

                        <View style={[styles.badge, userType === 'seeker' ? styles.badgeSeeker : styles.badgeEmployer]}>
                            {userType === 'seeker' ? <Feather name="star" size={14} color="#3b82f6" /> : <Feather name="briefcase" size={14} color="#f59e0b" />}
                            <Text style={[styles.badgeText, userType === 'seeker' ? styles.textSeeker : styles.textEmployer]}>
                                {userType === 'seeker' ? 'For Professionals' : 'For Companies'}
                            </Text>
                        </View>

                        <Text style={styles.heroTitle}>
                            {userType === 'seeker' ? (
                                <>
                                    Accelerate your{"\n"}
                                    <Text style={styles.heroTitleAccentSeeker}>career growth</Text>
                                </>
                            ) : (
                                <>
                                    Build your dream{"\n"}
                                    <Text style={styles.heroTitleAccentEmployer}>team today</Text>
                                </>
                            )}
                        </Text>

                        <View style={styles.benefitsContainer}>
                            {benefits.map((benefit, index) => (
                                <View key={index} style={styles.benefitRow}>
                                    <View style={[styles.checkCircle, userType === 'seeker' ? styles.checkSeeker : styles.checkEmployer]}>
                                        <Feather name="check" size={12} color={userType === 'seeker' ? "#3b82f6" : "#f59e0b"} />
                                    </View>
                                    <Text style={styles.benefitText}>{benefit}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <View style={styles.formHeader}>
                            <Text style={styles.formTitle}>Create Account</Text>
                            <Text style={styles.formSubtitle}>Choose your account type to get started.</Text>
                        </View>

                        {/* Account Type Toggle */}
                        <View style={styles.toggleContainer}>
                            <Animated.View style={[styles.slidingBackground, { transform: [{ translateX }] }]} />
                            <TouchableOpacity
                                onPress={() => handleToggle('seeker')}
                                style={styles.toggleButton}
                            >
                                <Feather name="user" size={16} color={userType === 'seeker' ? "#3b82f6" : "#475569"} />
                                <Text style={[styles.toggleText, userType === 'seeker' && styles.toggleTextActive]}>Job Seeker</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleToggle('employer')}
                                style={styles.toggleButton}
                            >
                                <Feather name="briefcase" size={16} color={userType === 'employer' ? "#f59e0b" : "#475569"} />
                                <Text style={[styles.toggleText, userType === 'employer' && styles.toggleTextActive]}>Company</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                {userType === 'seeker' ? 'Full Name' : 'Company Name'}
                            </Text>
                            <View style={styles.inputContainer}>
                                <Feather name={userType === 'seeker' ? "user" : "briefcase"} size={18} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={userType === 'seeker' ? "John Doe" : "Acme Inc."}
                                    placeholderTextColor="#475569"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        {userType === 'employer' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Username</Text>
                                <View style={styles.inputContainer}>
                                    <Feather name="user" size={18} color="#64748b" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="company_username"
                                        placeholderTextColor="#475569"
                                        value={username}
                                        onChangeText={setUsername}
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Work Email</Text>
                            <View style={styles.inputContainer}>
                                <Feather name="mail" size={18} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="name@company.com"
                                    placeholderTextColor="#475569"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputContainer}>
                                <Feather name="lock" size={18} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Create a password"
                                    placeholderTextColor="#475569"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.inputContainer}>
                                <Feather name="lock" size={18} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#475569"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                userType === 'seeker' ? styles.btnSeeker : styles.btnEmployer,
                                loading && styles.disabledButton
                            ]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={[styles.submitButtonText, userType === 'seeker' && { color: 'white' }]}>
                                {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
                            </Text>
                            <Feather name="arrow-right" size={20} color={userType === 'seeker' ? "white" : "#1e1b4b"} />
                        </TouchableOpacity>

                        {userType === 'seeker' && (
                            <>
                                <View style={styles.dividerContainer}>
                                    <View style={styles.divider} />
                                    <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                                    <View style={styles.divider} />
                                </View>

                                <View style={styles.socialGrid}>
                                    <TouchableOpacity style={styles.socialButton}>
                                        <Feather name="github" size={20} color="#cbd5e1" />
                                        <Text style={styles.socialButtonText}>GitHub</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialButton}>
                                        <Feather name="chrome" size={20} color="#cbd5e1" />
                                        <Text style={styles.socialButtonText}>Google</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.footerLink}>Sign in</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Success Modal */}
            <Modal visible={showSuccess} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.successIconContainer}>
                            <Feather name="check" size={40} color="#10b981" />
                        </View>
                        <Text style={styles.modalTitle}>Account Created!</Text>
                        <Text style={styles.modalSubtitle}>Your account has been successfully created. Redirecting to login...</Text>
                        <View style={styles.progressBarContainer}>
                            <Animated.View style={styles.progressBar} />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1b4b' },
    scrollContent: { flexGrow: 1 },
    brandingSection: { padding: 24, paddingTop: 40, paddingBottom: 40, position: 'relative', overflow: 'hidden' },
    bgSeeker: { backgroundColor: 'rgba(59, 130, 246, 0.05)' },
    bgEmployer: { backgroundColor: 'rgba(245, 158, 11, 0.05)' },
    orb1: { position: 'absolute', top: -100, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(59, 130, 246, 0.1)', blur: 100 },
    orb2: { position: 'absolute', bottom: -50, right: -100, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(168, 85, 247, 0.05)', blur: 80 },
    badge: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20,
        borderWidth: 1
    },
    badgeSeeker: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' },
    badgeEmployer: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' },
    badgeText: { fontSize: 11, fontWeight: 'bold', marginLeft: 6, textTransform: 'uppercase' },
    textSeeker: { color: '#3b82f6' },
    textEmployer: { color: '#f59e0b' },
    heroTitle: { color: 'white', fontSize: 32, fontWeight: 'bold', lineHeight: 40, marginBottom: 20 },
    heroTitleAccentSeeker: { color: '#60a5fa' },
    heroTitleAccentEmployer: { color: '#f59e0b' },
    benefitsContainer: { gap: 12 },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    checkCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    checkSeeker: { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
    checkEmployer: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
    benefitText: { color: '#94a3b8', fontSize: 16 },
    formSection: { padding: 24, flex: 1 },
    formHeader: { marginBottom: 24 },
    formTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    formSubtitle: { color: '#64748b', fontSize: 15 },
    toggleContainer: {
        flexDirection: 'row', backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: 4,
        borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: '#334155', height: 50, position: 'relative'
    },
    slidingBackground: {
        position: 'absolute', top: 4, left: 4, width: '50%', height: 40, backgroundColor: 'rgba(51, 65, 85, 0.6)', borderRadius: 12
    },
    toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 1 },
    toggleText: { color: '#64748b', fontSize: 14, fontWeight: 'bold' },
    toggleTextActive: { color: 'white' },
    inputGroup: { marginBottom: 20 },
    label: { color: '#94a3b8', fontSize: 14, fontWeight: '500', marginBottom: 8, marginLeft: 4 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 16
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: 'white', paddingVertical: 14, fontSize: 16 },
    submitButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, borderRadius: 12, marginTop: 12, gap: 10,
        elevation: 5, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8
    },
    btnSeeker: { backgroundColor: '#2563eb', shadowColor: '#2563eb' },
    btnEmployer: { backgroundColor: '#f59e0b', shadowColor: '#f59e0b' },
    disabledButton: { opacity: 0.7 },
    submitButtonText: { fontSize: 16, fontWeight: 'bold' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
    divider: { flex: 1, height: 1, backgroundColor: '#334155' },
    dividerText: { color: '#475569', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 16, letterSpacing: 1 },
    socialGrid: { flexDirection: 'row', gap: 12 },
    socialButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.4)', borderWidth: 1, borderColor: '#334155',
        borderRadius: 12, paddingVertical: 14, gap: 10
    },
    socialButtonText: { color: '#cbd5e1', fontSize: 14, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, paddingBottom: 20 },
    footerText: { color: '#64748b', fontSize: 14 },
    footerLink: { color: '#f59e0b', fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#1e293b', padding: 32, borderRadius: 24, alignItems: 'center', width: '85%', borderWith: 1, borderColor: '#334155' },
    successIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    modalTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
    modalSubtitle: { color: '#94a3b8', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    progressBarContainer: { width: '100%', height: 4, backgroundColor: '#334155', borderRadius: 2, overflow: 'hidden' },
    progressBar: { width: '100%', height: '100%', backgroundColor: '#f59e0b' }
});

export default Signup;
