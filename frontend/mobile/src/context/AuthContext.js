import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import { setLogoutHandler } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('access');
            await AsyncStorage.removeItem('refresh');
            await AsyncStorage.removeItem('user_type');
            // delete api.defaults.headers.common.Authorization;
            setUser(null);
        } catch (e) {
            console.error("Logout error", e);
        }
    };

    const loadUser = async () => {
        try {
            const token = await AsyncStorage.getItem('access');
            const userType = await AsyncStorage.getItem('user_type');

            if (!token || !userType) {
                setUser(null);
                setLoading(false);
                return;
            }

            // Set the authorization header if it exists
            // api.defaults.headers.common.Authorization = `Bearer ${token}`;

            let response;
            if (userType === 'company') {
                response = await api.get('accounts/company/me/');
            } else {
                response = await api.get('accounts/me/');
            }

            // Normalize backend response to match web version
            setUser({
                ...response.data,
                role: response.data.user_type,
                name: response.data.full_name || response.data.company_name || response.data.username,
                avatar: response.data.profile_picture || response.data.brand_logo || null
            });
        } catch (error) {
            console.error("Error loading user:", error);
            await logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLogoutHandler(logout);
        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, logout, loadUser, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
