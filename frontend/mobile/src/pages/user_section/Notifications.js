import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const Notifications = () => {
    const notifications = [1, 2, 3];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.headerTitle}>Notifications</Text>

            <View style={styles.feed}>
                {notifications.map((item, index) => (
                    <TouchableOpacity
                        key={item}
                        style={[
                            styles.notificationItem,
                            index === notifications.length - 1 && styles.lastItem
                        ]}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            <Feather name="bell" size={20} color="#2563eb" />
                        </View>
                        <View style={styles.content}>
                            <Text style={styles.message}>
                                New job alert: Senior React Developer at TechCorp
                            </Text>
                            <Text style={styles.timestamp}>2 hours ago</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 20,
    },
    feed: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 1 }
        })
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 20,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    message: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1e293b',
        lineHeight: 22,
    },
    timestamp: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 4,
    }
});

export default Notifications;
