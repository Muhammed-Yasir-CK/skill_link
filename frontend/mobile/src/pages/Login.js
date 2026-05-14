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
        try {
            const response = await api.post("accounts/login/", {
                username: email.split('@')[0],
                password: password
            });
            await AsyncStorage.setItem("access", response.data.access);
            await AsyncStorage.setItem("refresh", response.data.refresh);
            await AsyncStorage.setItem("user_type", response.data.user_type);
            api.defaults.headers.common.Authorization = `Bearer ${response.data.access}`;
            await loadUser();
        } catch (error) {
            console.error("Login error:", error.response?.data || error.message);
            alert("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Feather name="arrow-left" size={24} color="#ffffff" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue your professional journey</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputWrapper}>
                                <Feather name="mail" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="your@email.com"
                                    placeholderTextColor="#475569"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Password</Text>
                                <TouchableOpacity>
                                    <Text style={styles.forgotPass}>Forgot?</Text>
                                </TouchableOpacity>
                            </View>
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

                        <TouchableOpacity
                            style={[styles.loginBtn, loading && styles.disabledBtn]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.loginBtnText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.line} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.line} />
                        </View>

                        <View style={styles.socialRow}>
                            <TouchableOpacity style={styles.socialBtn}>
                                <Feather name="github" size={20} color="#ffffff" />
                                <Text style={styles.socialBtnText}>GitHub</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialBtn}>
                                <Feather name="chrome" size={20} color="#ffffff" />
                                <Text style={styles.socialBtnText}>Google</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>New here? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.footerLink}>Create Account</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    scrollContent: { flexGrow: 1, padding: 24 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    header: { marginBottom: 40 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#94a3b8', lineHeight: 24 },
    form: { flex: 1 },
    inputGroup: { marginBottom: 24 },
    label: { color: '#94a3b8', fontSize: 14, fontWeight: '600', marginBottom: 10, marginLeft: 4 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    forgotPass: { color: '#f59e0b', fontSize: 14, fontWeight: 'bold' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 16, paddingHorizontal: 16, height: 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    input: { flex: 1, color: '#ffffff', fontSize: 16, marginLeft: 12 },
    loginBtn: { backgroundColor: '#f59e0b', height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12, shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    disabledBtn: { opacity: 0.7 },
    loginBtnText: { color: '#0f172a', fontSize: 18, fontWeight: 'bold' },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
    line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
    dividerText: { color: '#475569', fontSize: 12, fontWeight: 'bold', paddingHorizontal: 16, textTransform: 'uppercase' },
    socialRow: { flexDirection: 'row', gap: 12 },
    socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', height: 56, borderRadius: 16, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    socialBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, paddingBottom: 20 },
    footerText: { color: '#94a3b8', fontSize: 15 },
    footerLink: { color: '#f59e0b', fontSize: 15, fontWeight: 'bold' }
});

export default Login;
