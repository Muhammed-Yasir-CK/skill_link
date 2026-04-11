import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../api/axios';

const UserItem = ({ user, onToggleStatus }) => (
    <View style={styles.userCard}>
        <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.username}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userDate}>Joined: {new Date(user.date_joining || user.date_joined).toLocaleDateString()}</Text>
        </View>
        <View style={styles.userActions}>
            <View style={[styles.statusBadge, { backgroundColor: user.is_active ? '#dcfce7' : '#fee2e2' }]}>
                <Text style={[styles.statusText, { color: user.is_active ? '#15803d' : '#b91c1c' }]}>
                    {user.is_active ? 'Active' : 'Blocked'}
                </Text>
            </View>
            <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: user.is_active ? '#fee2e2' : '#dcfce7' }]}
                onPress={() => onToggleStatus(user.id, user.is_active)}
            >
                <Feather name={user.is_active ? "slash" : "check-circle"} size={16} color={user.is_active ? "#b91c1c" : "#15803d"} />
            </TouchableOpacity>
        </View>
    </View>
);

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await api.get('accounts/admin/users/');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to load users");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUsers();
    }, []);

    const toggleStatus = async (id, isActive) => {
        const action = isActive ? "Block" : "Unblock";
        Alert.alert(
            `${action} User`,
            `Are you sure you want to ${action.toLowerCase()} this user?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm", 
                    onPress: async () => {
                        try {
                            await api.post(`accounts/admin/users/${id}/status/`);
                            fetchUsers();
                        } catch (err) {
                            Alert.alert("Error", "Failed to update status");
                        }
                    } 
                }
            ]
        );
    };

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0f172a" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>User Management</Text>
                <View style={styles.searchBox}>
                    <Feather name="search" size={18} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                </View>
            </View>

            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <UserItem user={item} onToggleStatus={toggleStatus} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No users found</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 24,
        paddingTop: 40,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        gap: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#1e293b',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    userCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    userEmail: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 4,
    },
    userDate: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 4,
    },
    userActions: {
        alignItems: 'flex-end',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 14,
    }
});

export default UserManagement;
