import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

const Reports = () => {
    // Mock Data parity with web
    const [reports, setReports] = useState([
        { id: 1, type: 'Job', subject: 'Easy Money Home Work', reporter: 'john.doe@email.com', reason: 'Scam / Phishing', status: 'Pending' },
        { id: 2, type: 'Company', subject: 'Fake Corp Ltd', reporter: 'sarah.smith@email.com', reason: 'Fake company data', status: 'Pending' },
        { id: 3, type: 'Job', subject: 'Data Entry', reporter: 'mike.check@email.com', reason: 'Asking for payment', status: 'Resolved' },
    ]);

    const handleAction = (id, action) => {
        Alert.alert(
            "Resolve Report",
            `Are you sure you want to ${action} this reported item?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm", 
                    onPress: () => {
                        setReports(reports.map(report =>
                            report.id === id ? { ...report, status: 'Resolved' } : report
                        ));
                    }
                }
            ]
        );
    };

    const renderReport = ({ item }) => (
        <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'Job' ? '#dbeafe' : '#f3e8ff' }]}>
                    <Text style={[styles.typeText, { color: item.type === 'Job' ? '#1e40af' : '#6b21a8' }]}>{item.type}</Text>
                </View>
                <Text style={styles.reportStatus}>{item.status}</Text>
            </View>
            
            <Text style={styles.subject}>{item.subject}</Text>
            <View style={styles.metaRow}>
                <Feather name="user" size={12} color="#94a3b8" />
                <Text style={styles.metaText}>{item.reporter}</Text>
            </View>
            <Text style={styles.reason}>{item.reason}</Text>

            {item.status !== 'Resolved' && (
                <View style={styles.actionRow}>
                    {item.type === 'Job' ? (
                        <TouchableOpacity style={[styles.actionBtn, styles.redBtn]} onPress={() => handleAction(item.id, 'remove')}>
                            <Feather name="trash-2" size={14} color="#b91c1c" />
                            <Text style={styles.redBtnText}>Remove Job</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={[styles.actionBtn, styles.orangeBtn]} onPress={() => handleAction(item.id, 'suspend')}>
                            <Feather name="slash" size={14} color="#9a3412" />
                            <Text style={styles.orangeBtnText}>Suspend Company</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Reports & Complaints</Text>
            </View>

            <FlatList
                data={reports}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderReport}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 24, paddingTop: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    listContent: { padding: 16 },
    reportCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
    reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    typeText: { fontSize: 10, fontWeight: 'bold' },
    reportStatus: { fontSize: 12, color: '#64748b' },
    subject: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    metaText: { fontSize: 13, color: '#64748b' },
    reason: { fontSize: 14, color: '#ef4444', marginTop: 12, fontStyle: 'italic' },
    actionRow: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: 12 },
    redBtn: { backgroundColor: '#fee2e2' },
    redBtnText: { color: '#b91c1c', fontWeight: 'bold', fontSize: 13 },
    orangeBtn: { backgroundColor: '#ffedd5' },
    orangeBtnText: { color: '#9a3412', fontWeight: 'bold', fontSize: 13 }
});

export default Reports;
