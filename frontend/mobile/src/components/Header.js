import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, StatusBar, Alert, Modal, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigation, useNavigationState } from '@react-navigation/native';

const Header = () => {
    const { user, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const navigation = useNavigation();
    const [menuVisible, setMenuVisible] = useState(false);

    const state = useNavigationState(s => s);
    
    // Robust detection: Check if we are in 'Work' or 'Seeker' sections
    // We check the current navigator and its parent to be sure
    const isWorkSection = state?.routes.some(r => r.name === 'Work' || r.name === 'WorkDashboard' || r.name === 'MyWorks' || r.name === 'PostWork');

    const handleLogout = () => {
        setMenuVisible(false);
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: async () => await logout() }
            ]
        );
    };

    const toggleSection = () => {
        setMenuVisible(false);
        if (isWorkSection) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Seeker' }],
            });
        } else {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Work' }],
            });
        }
    };

    const navigateToProfile = () => {
        setMenuVisible(false);
        if (user?.role === 'company') {
            navigation.navigate('CompanyDashboard');
        } else {
            navigation.navigate('SeekerProfile');
        }
    };

    const handleLogoPress = () => {
        if (user) {
            if (user.role === 'company') {
                navigation.navigate('CompanyDashboard');
            } else {
                navigation.navigate('Seeker');
            }
        } else {
            navigation.navigate('Home');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={handleLogoPress} 
                    style={styles.logoContainer}
                    activeOpacity={0.7}
                >
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.logoImg}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                <View style={styles.rightActions}>
                    {user ? (
                        <>
                            <TouchableOpacity 
                                style={styles.iconBtn}
                                onPress={() => navigation.navigate('Notifications')}
                            >
                                <Feather name="bell" size={22} color="#64748b" />
                                {unreadCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.profileBtn}
                                onPress={() => setMenuVisible(true)}
                            >
                                <View style={styles.avatarContainer}>
                                    {user.avatar ? (
                                        <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                                    ) : (
                                        <Text style={styles.avatarText}>{user.name?.[0] || 'U'}</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity 
                            style={styles.loginBtn}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginText}>Log In</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Profile Menu Modal */}
            <Modal
                visible={menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable 
                    style={styles.modalOverlay} 
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.menuContainer}>
                        <View style={styles.userInfo}>
                            <View style={styles.largeAvatar}>
                                {user?.avatar ? (
                                    <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                                ) : (
                                    <Text style={styles.largeAvatarText}>{user?.name?.[0] || 'U'}</Text>
                                )}
                            </View>
                            <View>
                                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                                <Text style={styles.userRole}>{user?.role || 'Member'}</Text>
                            </View>
                        </View>

                        <View style={styles.menuDivider} />

                        {user?.role !== 'company' && (
                            <TouchableOpacity style={styles.menuItem} onPress={toggleSection}>
                                <View style={[styles.menuIcon, { backgroundColor: isWorkSection ? '#eff6ff' : '#ecfdf5' }]}>
                                    <Feather 
                                        name={isWorkSection ? "briefcase" : "plus-circle"} 
                                        size={18} 
                                        color={isWorkSection ? "#3b82f6" : "#10b981"} 
                                    />
                                </View>
                                <Text style={styles.menuText}>
                                    {isWorkSection ? 'Switch to Seeker' : 'Switch to Post Work'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.menuItem} onPress={navigateToProfile}>
                            <View style={[styles.menuIcon, { backgroundColor: '#f8fafc' }]}>
                                <Feather name="user" size={18} color="#64748b" />
                            </View>
                            <Text style={styles.menuText}>My Profile</Text>
                        </TouchableOpacity>

                        <View style={styles.menuDivider} />

                        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
                            <View style={[styles.menuIcon, { backgroundColor: '#fef2f2' }]}>
                                <Feather name="log-out" size={18} color="#ef4444" />
                            </View>
                            <Text style={[styles.menuText, { color: '#ef4444' }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    logoContainer: {
        height: '100%',
        justifyContent: 'center',
    },
    logoImg: {
        height: 28,
        width: 100,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBtn: {
        position: 'relative',
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
        paddingHorizontal: 2,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    profileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#4338ca',
    },
    loginText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 60 : 104,
        paddingRight: 16,
    },
    menuContainer: {
        width: 240,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    largeAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    largeAvatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4338ca',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    userRole: {
        fontSize: 12,
        color: '#64748b',
        textTransform: 'capitalize',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginHorizontal: -16,
        marginBottom: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#475569',
    },
    logoutItem: {
        marginTop: 4,
    }
});

export default Header;
