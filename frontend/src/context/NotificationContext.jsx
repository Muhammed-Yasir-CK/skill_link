import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        const token = localStorage.getItem('access');
        if (!token) return;
        
        try {
            const response = await api.get('accounts/notifications/');
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 10000); // 10 seconds
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    return (
        <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
