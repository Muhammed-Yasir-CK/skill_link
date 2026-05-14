import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        if (!user) return;
        try {
            const response = await api.get('accounts/notifications/');
            const notifications = response.data.notifications || [];
            const unread = notifications.filter(n => !n.is_read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            // Poll every 30 seconds for new notifications
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        } else {
            setUnreadCount(0);
        }
    }, [user]);

    return (
        <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
