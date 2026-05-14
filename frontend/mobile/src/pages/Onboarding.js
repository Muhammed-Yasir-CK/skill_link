import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Onboarding = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1e1b4b" />
            
            {/* Abstract Background Elements */}
            <View style={styles.orb1} />
            <View style={styles.orb2} />

            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('../assets/logo.png')} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.textSection}>
                    <Text style={styles.title}>
                        Unlock Your{"\n"}
                        <Text style={styles.titleAccent}>Professional Potential</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        The ultimate bridge between talented professionals and top-tier companies. Your next chapter starts here.
                    </Text>
                </View>

                <View style={styles.buttonSection}>
                    <TouchableOpacity 
                        style={styles.primaryButton}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Signup')}
                    >
                        <Text style={styles.primaryButtonText}>Get Started</Text>
                        <Feather name="arrow-right" size={20} color="#1e1b4b" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.secondaryButton}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.secondaryButtonText}>Sign In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.guestButton}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.guestButtonText}>Explore as Guest</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <View style={styles.footerLine} />
                    <Text style={styles.footerText}>Built for the modern workforce</Text>
                    <View style={styles.footerLine} />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1b4b',
    },
    orb1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
    },
    orb2: {
        position: 'absolute',
        bottom: -50,
        left: -100,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
    },
    content: {
        flex: 1,
        paddingHorizontal: 32,
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: height * 0.05,
    },
    logo: {
        width: width * 0.5,
        height: 60,
    },
    textSection: {
        marginTop: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
        lineHeight: 44,
    },
    titleAccent: {
        color: '#f59e0b',
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        lineHeight: 24,
        marginTop: 16,
    },
    buttonSection: {
        gap: 16,
        marginTop: 40,
    },
    primaryButton: {
        backgroundColor: '#f59e0b',
        height: 60,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    primaryButtonText: {
        color: '#1e1b4b',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    secondaryButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    guestButton: {
        alignItems: 'center',
        marginTop: 8,
    },
    guestButtonText: {
        color: '#64748b',
        fontSize: 15,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    footerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    footerText: {
        color: '#475569',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});

export default Onboarding;
