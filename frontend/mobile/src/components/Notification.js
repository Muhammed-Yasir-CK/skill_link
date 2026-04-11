import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * Notification component for mobile
 * Adapted from web logic: Features auto-hide, type-based styling, and slide-in animations.
 */
const Notification = ({ type = 'success', message, isVisible, onClose, duration = 3000 }) => {
    const slideAnim = useRef(new Animated.Value(-100)).current; // Start above the screen

    useEffect(() => {
        if (isVisible) {
            // Slide In
            Animated.spring(slideAnim, {
                toValue: Platform.OS === 'ios' ? 60 : 40, // Top margin
                useNativeDriver: true,
                tension: 40,
                friction: 8
            }).start();

            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            // Reset position when not visible
            slideAnim.setValue(-100);
        }
    }, [isVisible, duration]);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true
        }).start(() => onClose());
    };

    if (!isVisible) return null;

    const getStyles = () => {
        switch (type) {
            case 'error': return styles.error;
            case 'info': return styles.info;
            default: return styles.success;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'error': return <Feather name="x-circle" size={20} color="#ef4444" />;
            case 'info': return <Feather name="info" size={20} color="#3b82f6" />;
            default: return <Feather name="check-circle" size={20} color="#10b981" />;
        }
    };

    return (
        <Animated.View style={[styles.container, getStyles(), { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.content}>
                {getIcon()}
                <Text style={styles.message} numberOfLines={2}>{message}</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Feather name="x" size={16} color="#64748b" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 9999,
        borderRadius: 12,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 10,
            }
        })
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    success: {
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0',
    },
    error: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
    },
    info: {
        backgroundColor: '#eff6ff',
        borderColor: '#bfdbfe',
    },
    closeButton: {
        padding: 4,
    }
});

export default Notification;
