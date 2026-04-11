import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useNavigationState } from '@react-navigation/native';

const Header = () => {
    const { user, logout } = useAuth();
    const navigation = useNavigation();

    // Get current route to show/hide certain elements if needed
    const state = useNavigationState(state => state);
    const currentRoute = state?.routes[state.index]?.name;

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: async () => await logout() }
            ]
        );
    };

    const navigateToProfile = () => {
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
                                <View style={styles.badge} />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.profileBtn}
                                onPress={navigateToProfile}
                            >
                                <View style={styles.avatarContainer}>
                                    {user.avatar ? (
                                        <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                                    ) : (
                                        <Text style={styles.avatarText}>{user.name?.[0] || 'U'}</Text>
                                    )}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.iconBtn}
                                onPress={handleLogout}
                            >
                                <Feather name="log-out" size={22} color="#ef4444" />
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44, // 44 is standard iOS status bar height
    },
    header: {
        height: 50,
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
        height: 30,
        width: 90,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBtn: {
        position: 'relative',
        padding: 4,
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        borderWidth: 1,
        borderColor: '#ffffff',
    },
    profileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        color: '#64748b',
        fontSize: 14,
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
});

export default Header;
