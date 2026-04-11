import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const { width } = Dimensions.get('window');

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loadUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password) return;
        setLoading(true);
        console.log("HANDLE SUBMIT TRIGGERED");

        try {
            const response = await api.post("accounts/login/", {
                username: email.split('@')[0],
                password: password
            });
            console.log("LOGIN RESPONSE:", response.data);

            // Mirroring web pattern: Save to storage then loadUser
            await AsyncStorage.setItem("access", response.data.access);
            await AsyncStorage.setItem("refresh", response.data.refresh);
            await AsyncStorage.setItem("user_type", response.data.user_type);

            // Set auth header immediately for the loadUser call
            api.defaults.headers.common.Authorization = `Bearer ${response.data.access}`;

            await loadUser();

            // AuthContext state update will automatically re-render AppNavigator
            // and switch to the correct stack based on user role.

        } catch (error) {
            console.error("Login error:", error.response?.data || error.message);
            if (error.response) {
                alert(JSON.stringify(error.response.data));
            } else {
                alert("Server error. Please check your connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1e1b4b" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.brandingSection}>
                        <View style={styles.orb1} />
                        <View style={styles.orb2} />

                        <View style={styles.badge}>
                            <Feather name="briefcase" size={14} color="#f59e0b" />
                            <Text style={styles.badgeText}>#1 Job Platform</Text>
                        </View>

                        <Text style={styles.heroTitle}>
                            Find the job that{"\n"}
                            <Text style={styles.heroTitleAccent}>defines your future</Text>
                        </Text>

                        <Text style={styles.heroSubtitle}>
                            Join millions of professionals who have taken the next step in their careers.
                        </Text>

                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>10k+</Text>
                                <Text style={styles.statLabel}>ACTIVE JOBS</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>500+</Text>
                                <Text style={styles.statLabel}>COMPANIES</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.formHeader}>
                            <Text style={styles.formTitle}>Welcome back</Text>
                            <Text style={styles.formSubtitle}>Please enter your details to sign in.</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputContainer}>
                                <Feather name="mail" size={18} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#475569"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Password</Text>
                                <TouchableOpacity>
                                    <Text style={styles.forgotText}>Forgot password?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.inputContainer}>
                                <Feather name="lock" size={18} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor="#475569"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.loginButtonText}>{loading ? 'LOGGING IN...' : 'LOG IN'}</Text>
                            <Feather name="arrow-right" size={20} color="#1e1b4b" />
                        </TouchableOpacity>

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
                                <View style={styles.googleIconContainer}>
                                    <Feather name="chrome" size={18} color="#cbd5e1" />
                                </View>
                                <Text style={styles.socialButtonText}>Google</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.footerLink}>Sign up for free</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            style={styles.adminLink} 
                            onPress={() => navigation.navigate('AdminLogin')}
                        >
                            <Text style={styles.adminLinkText}>Admin Portal</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1b4b' },
    scrollContent: { flexGrow: 1 },
    brandingSection: { padding: 24, paddingTop: 40, paddingBottom: 40, position: 'relative', overflow: 'hidden' },
    orb1: { position: 'absolute', top: -100, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(245, 158, 11, 0.15)', blur: 100 },
    orb2: { position: 'absolute', bottom: -50, right: -100, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(59, 130, 246, 0.1)', blur: 80 },
    badge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20,
        borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)'
    },
    badgeText: { color: '#f59e0b', fontSize: 11, fontWeight: 'bold', marginLeft: 6, textTransform: 'uppercase' },
    heroTitle: { color: 'white', fontSize: 32, fontWeight: 'bold', lineHeight: 40, marginBottom: 12 },
    heroTitleAccent: { color: '#f59e0b' },
    heroSubtitle: { color: '#94a3b8', fontSize: 15, lineHeight: 22, maxWidth: '90%', marginBottom: 32 },
    statsGrid: { flexDirection: 'row', gap: 40, paddingTop: 24, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
    statItem: { gap: 4 },
    statValue: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    statLabel: { color: '#475569', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    formSection: { padding: 24, flex: 1 },
    formHeader: { marginBottom: 32 },
    formTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    formSubtitle: { color: '#64748b', fontSize: 15 },
    inputGroup: { marginBottom: 20 },
    label: { color: '#94a3b8', fontSize: 14, fontWeight: '500', marginBottom: 8, marginLeft: 4 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    forgotText: { color: '#f59e0b', fontSize: 14, fontWeight: 'bold' },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 16
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: 'white', paddingVertical: 14, fontSize: 16 },
    loginButton: {
        backgroundColor: '#f59e0b', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, borderRadius: 12, marginTop: 12, gap: 10,
        shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
    },
    disabledButton: { opacity: 0.7 },
    loginButtonText: { color: '#1e1b4b', fontSize: 16, fontWeight: 'bold' },
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
    googleIconContainer: { opacity: 0.8 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, paddingBottom: 20 },
    footerText: { color: '#64748b', fontSize: 14 },
    footerLink: { color: '#f59e0b', fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' },
    adminLink: {
        marginTop: 20,
        alignItems: 'center',
        paddingVertical: 10,
    },
    adminLinkText: {
        color: '#475569',
        fontSize: 12,
        fontWeight: '600',
        textDecorationLine: 'underline',
    }
});

export default Login;
