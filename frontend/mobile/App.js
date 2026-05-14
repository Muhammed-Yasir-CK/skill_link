import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';

// Import All Pages (Paths adjusted for Mobile src/ structure)
import Home from './src/pages/Home';
import JobDetails from './src/pages/JobDetails';
import Company from './src/pages/Company';
import Login from './src/pages/Login';
import Signup from './src/pages/Signup';
import Onboarding from './src/pages/Onboarding';
import CompanyDashboard from './src/pages/CompanyDashboard';
import PostJob from './src/pages/PostJob';
import CompanyPostJob from './src/pages/CompanyPostJob';

// Admin Imports
import AdminLogin from './src/pages/admin/AdminLogin';
import AdminDashboard from './src/pages/admin/AdminDashboard';
import UserManagement from './src/pages/admin/UserManagement';
import CompanyManagement from './src/pages/admin/CompanyManagement';
import JobModeration from './src/pages/admin/JobModeration';
import Reports from './src/pages/admin/Reports';
import AdminSettings from './src/pages/admin/Settings';

// Work Section Imports
import WorkDashboard from './src/pages/work_section/WorkDashboard';
import MyWorks from './src/pages/work_section/MyWorks';
import PostWork from './src/pages/work_section/PostWork';
import CompletedWorks from './src/pages/work_section/CompletedWorks';
import ReceivedApplications from './src/pages/work_section/ReceivedApplications';

// User (Seeker) Section Imports
import Dashboard from './src/pages/user_section/Dashboard';
import ProfileOverview from './src/pages/user_section/ProfileOverview';
import MyApplications from './src/pages/user_section/MyApplications';
import SavedJobs from './src/pages/user_section/SavedJobs';
import Notifications from './src/pages/user_section/Notifications';
import Settings from './src/pages/user_section/Settings';
import Wallet from './src/pages/user_section/Wallet';
import AgreementDetails from './src/pages/work_section/AgreementDetails';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * LOGIC PARITY:
 * In the web code, layouts (Seeker, Work, Admin) wrap nested routes.
 * In React Native, we use TabNavigators as these Layout containers for parity.
 */

function SeekerTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#4338ca',
                headerShown: false,
                tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
                tabBarStyle: { height: 65, paddingBottom: 10, paddingTop: 5 }
            }}
        >
            <Tab.Screen
                name="SeekerDashboard"
                component={Dashboard}
                options={{ tabBarLabel: 'Dashboard', tabBarIcon: ({ color }) => <Feather name="grid" size={20} color={color} /> }}
            />
            <Tab.Screen
                name="SeekerApplications"
                component={MyApplications}
                options={{ tabBarLabel: 'Apps', tabBarIcon: ({ color }) => <Feather name="file-text" size={20} color={color} /> }}
            />
            <Tab.Screen
                name="SeekerSaved"
                component={SavedJobs}
                options={{ tabBarLabel: 'Saved', tabBarIcon: ({ color }) => <Feather name="bookmark" size={20} color={color} /> }}
            />
            <Tab.Screen
                name="SeekerWallet"
                component={Wallet}
                options={{ tabBarLabel: 'Wallet', tabBarIcon: ({ color }) => <Feather name="credit-card" size={20} color={color} /> }}
            />
        </Tab.Navigator>
    );
}

function WorkTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#059669',
                headerShown: false,
                tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
                tabBarStyle: { height: 65, paddingBottom: 10, paddingTop: 5 }
            }}
        >
            <Tab.Screen name="WorkDashboard" component={WorkDashboard} options={{ tabBarLabel: 'Stats', tabBarIcon: ({ color }) => <Feather name="bar-chart-2" size={20} color={color} /> }} />
            <Tab.Screen name="MyWorks" component={MyWorks} options={{ tabBarLabel: 'Works', tabBarIcon: ({ color }) => <Feather name="list" size={20} color={color} /> }} />
            <Tab.Screen name="PostWork" component={PostWork} options={{ tabBarLabel: 'Post', tabBarIcon: ({ color }) => <Feather name="plus-circle" size={20} color={color} /> }} />
            <Tab.Screen name="CompletedWorks" component={CompletedWorks} options={{ tabBarLabel: 'Done', tabBarIcon: ({ color }) => <Feather name="check-circle" size={20} color={color} /> }} />
            <Tab.Screen name="ReceivedApps" component={ReceivedApplications} options={{ tabBarLabel: 'Apps', tabBarIcon: ({ color }) => <Feather name="users" size={20} color={color} /> }} />
        </Tab.Navigator>
    );
}

function AdminLayout() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#dc2626',
                headerShown: false,
                tabBarLabelStyle: { fontSize: 9, fontWeight: '700' },
                tabBarStyle: { height: 65, paddingBottom: 10, paddingTop: 5 }
            }}
        >
            <Tab.Screen name="AdminDashboard" component={AdminDashboard} options={{ tabBarLabel: 'Dash', tabBarIcon: ({ color }) => <Feather name="activity" size={20} color={color} /> }} />
            <Tab.Screen name="UserManagement" component={UserManagement} options={{ tabBarLabel: 'Users', tabBarIcon: ({ color }) => <Feather name="users" size={20} color={color} /> }} />
            <Tab.Screen name="CompanyManagement" component={CompanyManagement} options={{ tabBarLabel: 'Companies', tabBarIcon: ({ color }) => <Feather name="briefcase" size={20} color={color} /> }} />
            <Tab.Screen name="JobModeration" component={JobModeration} options={{ tabBarLabel: 'Jobs', tabBarIcon: ({ color }) => <Feather name="shield" size={20} color={color} /> }} />
            <Tab.Screen name="Reports" component={Reports} options={{ tabBarLabel: 'Reports', tabBarIcon: ({ color }) => <Feather name="alert-triangle" size={20} color={color} /> }} />
            <Tab.Screen name="AdminSettings" component={AdminSettings} options={{ tabBarLabel: 'Config', tabBarIcon: ({ color }) => <Feather name="settings" size={20} color={color} /> }} />
        </Tab.Navigator>
    );
}

// --- Main App Navigator (Role-Based Routing Parity) ---

function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user) {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Onboarding" component={Onboarding} />
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Signup" component={Signup} />
                <Stack.Screen name="JobDetails" component={JobDetails} />
                <Stack.Screen name="Companies" component={Company} />
                <Stack.Screen name="PostJob" component={PostJob} />
                <Stack.Screen name="AdminLogin" component={AdminLogin} />
                <Stack.Screen name="AgreementDetails" component={AgreementDetails} />
            </Stack.Navigator>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user.role === 'company' ? (
                <>
                    <Stack.Screen name="CompanyDashboard" component={CompanyDashboard} />
                    <Stack.Screen name="CompanyPostJob" component={CompanyPostJob} />
                </>
            ) : user.role === 'admin' ? (
                <Stack.Screen name="AdminPanel" component={AdminLayout} />
            ) : (
                <>
                    <Stack.Screen name="Seeker" component={SeekerTabNavigator} />
                    <Stack.Screen name="Work" component={WorkTabNavigator} />
                    <Stack.Screen name="Notifications" component={Notifications} />
                    <Stack.Screen name="Settings" component={Settings} />
                    <Stack.Screen name="SeekerProfile" component={ProfileOverview} />
                </>
            )}

            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="JobDetails" component={JobDetails} />
            <Stack.Screen name="Companies" component={Company} />
            <Stack.Screen name="PostJob" component={PostJob} />
            <Stack.Screen name="AdminLogin" component={AdminLogin} />
            <Stack.Screen name="AdminPanel" component={AdminLayout} />
            <Stack.Screen name="AgreementDetails" component={AgreementDetails} />
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <NavigationContainer>
                    <AppNavigator />
                </NavigationContainer>
            </NotificationProvider>
        </AuthProvider>
    );
}
