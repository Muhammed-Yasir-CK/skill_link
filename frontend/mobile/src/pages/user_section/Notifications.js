import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../api/axios';
import { useNotifications } from '../../context/NotificationContext';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { fetchUnreadCount } = useNotifications();

    const fetchNotifications = async () => {
        try {
            const response = await api.get('accounts/notifications/');
            setNotifications(response.data.notifications || []);
            fetchUnreadCount();
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`accounts/notifications/${id}/`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'application': return 'briefcase';
            case 'agreement': return 'file-text';
            case 'payment': return 'credit-card';
            case 'match': return 'check-circle';
            default: return 'bell';
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4338ca" />
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4338ca']} />
            }
        >
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Notifications</Text>
                {notifications.some(n => !n.is_read) && (
                    <TouchableOpacity onPress={fetchNotifications}>
                        <Text style={styles.markAll}>Refresh</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.feed}>
                {notifications.length > 0 ? (
                    notifications.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.notificationItem,
                                !item.is_read && styles.unreadItem,
                                index === notifications.length - 1 && styles.lastItem
                            ]}
                            activeOpacity={0.7}
                            onPress={() => !item.is_read && markAsRead(item.id)}
                        >
                            <View style={[styles.iconContainer, !item.is_read && styles.unreadIcon]}>
                                <Feather 
                                    name={getIcon(item.type)} 
                                    size={20} 
                                    color={item.is_read ? "#64748b" : "#4338ca"} 
                                />
                            </View>
                            <View style={styles.content}>
                                <View style={styles.titleRow}>
                                    <Text style={[styles.message, !item.is_read && styles.unreadText]}>
                                        {item.title}
                                    </Text>
                                    {!item.is_read && <View style={styles.unreadDot} />}
                                </View>
                                <Text style={styles.subMessage}>{item.message}</Text>
                                <Text style={styles.timestamp}>
                                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Feather name="bell-off" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                )}
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    markAll: {
        fontSize: 14,
        color: '#4338ca',
        fontWeight: '600',
    },
    feed: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
        marginBottom: 40,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    unreadItem: {
        backgroundColor: '#f8fafc',
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadIcon: {
        backgroundColor: '#eff6ff',
    },
    content: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    message: {
        fontSize: 15,
        fontWeight: '500',
        color: '#475569',
        lineHeight: 20,
        flex: 1,
    },
    unreadText: {
        fontWeight: 'bold',
        color: '#0f172a',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4338ca',
        marginLeft: 8,
        marginTop: 6,
    },
    subMessage: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 4,
        lineHeight: 18,
    },
    timestamp: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 8,
    },
    emptyState: {
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '500',
    }
});

export default Notifications;
