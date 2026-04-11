import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const FooterSection = ({ title, links }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {links.map((link, index) => (
                <TouchableOpacity key={index} style={styles.linkItem}>
                    <Text style={styles.linkText}>{link}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View style={styles.footer}>
            <View style={styles.topSection}>
                <View style={styles.brandContainer}>
                    <View style={styles.logoAndTitle}>
                        <View style={styles.logoBg}>
                            <Image
                                source={require('../assets/logo.png')}
                                style={styles.logoImg}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.brandTitle}>SkillLink</Text>
                    </View>
                    <Text style={styles.description}>
                        Connecting the world's best talent with the world's best companies.
                    </Text>
                </View>

                <View style={styles.gridContainer}>
                    <View style={styles.row}>
                        <FooterSection
                            title="For Candidates"
                            links={['Browse Jobs', 'Browse Companies', 'Salary Calculator']}
                        />
                        <FooterSection
                            title="For Employers"
                            links={['Post a Job', 'Pricing', 'Hiring Advice']}
                        />
                    </View>
                    <View style={styles.row}>
                        <FooterSection
                            title="Company"
                            links={['About Us', 'Careers', 'Contact']}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.bottomSection}>
                <View style={styles.divider} />
                <Text style={styles.copyright}>
                    © {currentYear} SkillLink. All rights reserved.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        backgroundColor: '#0f172a', // slate-900
        paddingVertical: 48,
        paddingHorizontal: 24,
        marginTop: 'auto',
    },
    topSection: {
        gap: 32,
    },
    brandContainer: {
        marginBottom: 8,
    },
    logoAndTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    logoBg: {
        backgroundColor: 'white',
        borderRadius: 4,
        padding: 4,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImg: {
        width: '100%',
        height: '100%',
    },
    brandTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    description: {
        fontSize: 14,
        color: '#94a3b8', // slate-400
        lineHeight: 22,
    },
    gridContainer: {
        gap: 32,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 24,
    },
    section: {
        minWidth: '40%',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 16,
    },
    linkItem: {
        marginBottom: 12,
    },
    linkText: {
        fontSize: 14,
        color: '#cbd5e1', // slate-300
    },
    bottomSection: {
        marginTop: 48,
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#1e293b', // slate-800
        width: '100%',
        marginBottom: 32,
    },
    copyright: {
        fontSize: 14,
        color: '#64748b', // slate-500
        textAlign: 'center',
    },
});

export default Footer;
