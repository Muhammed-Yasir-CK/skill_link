import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../api/axios';

const Settings = () => {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [announcement, setAnnouncement] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

    const handlePasswordChange = async () => {
        if (!passwords.old || !passwords.new || !passwords.confirm) {
            Alert.alert("Error", "All fields are required");
            return;
        }
        if (passwords.new !== passwords.confirm) {
            Alert.alert("Error", "Passwords don't match");
            return;
        }

        setUpdatingPassword(true);
        try {
            await api.post('accounts/change-password/', {
                old_password: passwords.old,
                new_password: passwords.new
            });
            Alert.alert("Success", "Password updated successfully");
            setPasswords({ old: '', new: '', confirm: '' });
        } catch (err) {
            Alert.alert("Error", "Failed to update password");
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handlePostAnnouncement = () => {
        if (!announcement) return;
        Alert.alert("Success", "System announcement posted!");
        setAnnouncement('');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Platform Settings</Text>
            </View>

            <View style={styles.content}>
                {/* Password Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="lock" size={18} color="#0f172a" />
                        <Text style={styles.sectionTitle}>Change Password</Text>
                    </View>
                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Old Password"
                            secureTextEntry
                            value={passwords.old}
                            onChangeText={(val) => setPasswords({...passwords, old: val})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
                            secureTextEntry
                            value={passwords.new}
                            onChangeText={(val) => setPasswords({...passwords, new: val})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm New Password"
                            secureTextEntry
                            value={passwords.confirm}
                            onChangeText={(val) => setPasswords({...passwords, confirm: val})}
                        />
                        <TouchableOpacity style={styles.primaryBtn} onPress={handlePasswordChange} disabled={updatingPassword}>
                            {updatingPassword ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Update Password</Text>}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Maintenance Mode */}
                <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                        <Feather name="power" size={20} color={maintenanceMode ? "#f97316" : "#64748b"} />
                        <View style={styles.itemLabels}>
                            <Text style={styles.itemTitle}>Maintenance Mode</Text>
                            <Text style={styles.itemSubtitle}>Disable frontend access</Text>
                        </View>
                    </View>
                    <Switch
                        value={maintenanceMode}
                        onValueChange={setMaintenanceMode}
                        trackColor={{ false: "#e2e8f0", true: "#0f172a" }}
                    />
                </View>

                {/* Announcement Section */}
                <View style={[styles.section, { marginTop: 24 }]}>
                    <View style={styles.sectionHeader}>
                        <Feather name="megaphone" size={18} color="#0f172a" />
                        <Text style={styles.sectionTitle}>System Announcement</Text>
                    </View>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Write announcement..."
                        multiline
                        numberOfLines={4}
                        value={announcement}
                        onChangeText={setAnnouncement}
                    />
                    <TouchableOpacity style={styles.secondaryBtn} onPress={handlePostAnnouncement}>
                        <Text style={styles.secondaryBtnText}>Post Announcement</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ height: 60 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 24, paddingTop: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    content: { padding: 20 },
    section: { backgroundColor: '#fff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#f1f5f9' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    formContainer: { gap: 12 },
    input: { backgroundColor: '#f8fafc', borderRadius: 12, height: 48, paddingHorizontal: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
    primaryBtn: { backgroundColor: '#0f172a', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
    primaryBtnText: { color: '#fff', fontWeight: 'bold' },
    secondaryBtn: { backgroundColor: '#f1f5f9', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
    secondaryBtnText: { color: '#0f172a', fontWeight: 'bold' },
    itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 20, borderRadius: 24, marginTop: 24, borderWidth: 1, borderColor: '#f1f5f9' },
    itemInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    itemLabels: { gap: 2 },
    itemTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
    itemSubtitle: { fontSize: 12, color: '#64748b' }
});

export default Settings;
