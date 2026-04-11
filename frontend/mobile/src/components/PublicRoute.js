import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

/**
 * PublicRoute component for mobile
 * Adapted from web logic: Redirects logged-in users to their respective dashboards.
 */
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const navigation = useNavigation();

    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'company') {
                // Equivalent to <Navigate to="/company/dashboard" replace />
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'CompanyDashboard' }],
                });
            } else {
                // Equivalent to <Navigate to="/seeker/dashboard" replace />
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Seeker' }],
                });
            }
        }
    }, [user, loading, navigation]);

    if (loading) return null;

    // If user is already logged in, we return null while the redirect happens
    if (user) return null;

    return children;
};

export default PublicRoute;
