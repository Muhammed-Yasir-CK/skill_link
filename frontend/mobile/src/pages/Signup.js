import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Modal, Dimensions, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../api/axios';

const { width } = Dimensions.get('window');

const Signup = ({ navigation }) => {
    const [userType, setUserType] = useState('seeker');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
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
            let url = userType === 'seeker' ? 'accounts/register/seeker/' : 'accounts/register/company/';
            let payload = userType === 'seeker' 
                ? { username: email.split('@')[0], email, password, password2: confirmPassword }
                : { username, email, password, password2: confirmPassword, company_name: name };
            await api.post(url, payload);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                navigation.navigate('Login');
            }, 2000);
        } catch (error) {
            console.error("Signup error:", error.response?.data || error.message);
            alert("Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const translateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, (width - 64) / 2]
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Feather name="arrow-left" size={24} color="#ffffff" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join our community of professionals and growth-minded companies</Text>
                    </View>

                    <View style={styles.toggleContainer}>
                        <Animated.View style={[styles.slidingBg, { transform: [{ translateX }] }]} />
                        <TouchableOpacity onPress={() => handleToggle('seeker')} style={styles.toggleBtn}>
                            <Text style={[styles.toggleText, userType === 'seeker' && styles.toggleTextActive]}>Job Seeker</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleToggle('employer')} style={styles.toggleBtn}>
                            <Text style={[styles.toggleText, userType === 'employer' && styles.toggleTextActive]}>Company</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{userType === 'seeker' ? 'Full Name' : 'Company Name'}</Text>
                            <View style={styles.inputWrapper}>
                                <Feather name={userType === 'seeker' ? "user" : "briefcase"} size={20} color="#64748b" />
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
                                <View style={styles.inputWrapper}>
                                    <Feather name="at-sign" size={20} color="#64748b" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="company_name"
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
                            <View style={styles.inputWrapper}>
                                <Feather name="mail" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="name@company.com"
                                    placeholderTextColor="#475569"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Feather name="lock" size={20} color="#64748b" />
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

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.inputWrapper}>
                                <Feather name="shield" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor="#475569"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, loading && styles.disabledBtn, userType === 'employer' && { backgroundColor: '#f59e0b' }]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={[styles.submitBtnText, userType === 'employer' && { color: '#0f172a' }]}>
                                {loading ? 'Creating...' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.footerLink, userType === 'employer' && { color: '#f59e0b' }]}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal visible={showSuccess} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.successIcon}>
                            <Feather name="check" size={40} color="#10b981" />
                        </View>
                        <Text style={styles.modalTitle}>Success!</Text>
                        <Text style={styles.modalSubtitle}>Your account is ready. Redirecting...</Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    scrollContent: { flexGrow: 1, padding: 24 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    header: { marginBottom: 32 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
    subtitle: { fontSize: 15, color: '#94a3b8', lineHeight: 22 },
    toggleContainer: { flexDirection: 'row', backgroundColor: '#1e293b', padding: 4, borderRadius: 16, marginBottom: 32, position: 'relative', height: 56 },
    slidingBg: { position: 'absolute', top: 4, left: 4, width: '50%', height: 48, backgroundColor: '#334155', borderRadius: 12 },
    toggleBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
    toggleText: { color: '#64748b', fontSize: 14, fontWeight: 'bold' },
    toggleTextActive: { color: '#ffffff' },
    form: { flex: 1 },
    inputGroup: { marginBottom: 20 },
    label: { color: '#94a3b8', fontSize: 14, fontWeight: '600', marginBottom: 10, marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 16, paddingHorizontal: 16, height: 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    input: { flex: 1, color: '#ffffff', fontSize: 16, marginLeft: 12 },
    submitBtn: { backgroundColor: '#3b82f6', height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    disabledBtn: { opacity: 0.7 },
    submitBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, paddingBottom: 20 },
    footerText: { color: '#94a3b8', fontSize: 15 },
    footerLink: { color: '#3b82f6', fontSize: 15, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#1e293b', padding: 40, borderRadius: 32, alignItems: 'center', width: '80%' },
    successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    modalTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    modalSubtitle: { color: '#94a3b8', fontSize: 15, textAlign: 'center' }
});

export default Signup;
