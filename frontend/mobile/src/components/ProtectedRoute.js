import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

/**
 * ProtectedRoute component for mobile
 * Adapted from web logic: Ensures users are authenticated and have the correct role.
 */
const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();
    const navigation = useNavigation();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Equivalent to <Navigate to="/" replace />
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
                return;
            }

            if (role && user.role !== role) {
                if (user.role === 'company') {
                    // Equivalent to <Navigate to="/company/dashboard" replace />
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'CompanyDashboard' }],
                    });
                } else if (user.role === 'seeker') {
                    // Equivalent to <Navigate to="/seeker/dashboard" replace />
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Seeker' }],
                    });
                }
            }
        }
    }, [user, loading, role, navigation]);

    if (loading) return null;

    // If unauthorized, return null while redirecting
    if (!user || (role && user.role !== role)) return null;

    return children;
};

export default ProtectedRoute;
