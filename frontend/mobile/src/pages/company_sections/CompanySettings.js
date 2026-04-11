import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform, Alert, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../api/axios';

const CustomInput = ({ label, value, onChangeText, placeholder, icon, multiline, type }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputWrapper, multiline && styles.textAreaWrapper]}>
            {icon && <Feather name={icon} size={18} color="#94a3b8" style={styles.inputIcon} />}
            <TextInput
                style={[styles.input, multiline && styles.textArea]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                multiline={multiline}
                keyboardType={type || 'default'}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
        </View>
    </View>
);

const CompanySettings = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        company_name: '',
        email: '',
        brandLogoUrl: null,
        companyLegalName: '',
        brandName: '',
        companyType: 'Private',
        industry: 'Technology',
        companySize: '1-10',
        foundedYear: '',
        description: '',
        headquarters: '',
        officialEmail: '',
        phoneNumber: '',
        website: '',
        supportEmail: '',
        linkedinUrl: '',
        twitterUrl: '',
        careersPageUrl: '',
        registeredAddress: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        branchLocations: '',
        isRemoteFriendly: false,
        registrationNumber: '',
        businessType: 'LLP',
        taxId: '',
        registrationDate: '',
        registeredCountry: '',
        verificationStatus: 'pending',
        rejectionReason: '',
        docRegistration: false,
        docTax: false,
        docProof: false,
        docSignatory: false
    });

    const fetchProfile = async () => {
        try {
            setFetching(true);
            const res = await api.get('accounts/company/profile/');
            const data = res.data;

            setFormData(prev => ({
                ...prev,
                brandLogoUrl: data.brand_logo || null,
                email: data.email || '',
                company_name: data.company_name || '',
                companyLegalName: data.company_legal_name || '',
                brandName: data.brand_name || '',
                companyType: data.company_type || 'Private',
                industry: data.industry || 'Technology',
                companySize: data.company_size || '1-10',
                foundedYear: data.founded_year ? String(data.founded_year) : '',
                description: data.description || '',
                headquarters: data.headquarters || '',
                officialEmail: data.official_email || '',
                supportEmail: data.support_email || '',
                phoneNumber: data.phone_number || '',
                website: data.website || '',
                linkedinUrl: data.linkedin_url || '',
                twitter_url: data.twitter_url || '',
                careers_page_url: data.careers_page_url || '',
                registeredAddress: data.registered_address || '',
                city: data.city || '',
                state: data.state || '',
                country: data.country || '',
                postalCode: data.postal_code || '',
                branchLocations: data.branch_locations || '',
                isRemoteFriendly: data.is_remote_friendly || false,
                registrationNumber: data.registration_number || '',
                businessType: data.business_type || 'LLP',
                taxId: data.tax_id || '',
                registrationDate: data.registration_date || '',
                registeredCountry: data.registered_country || '',
                verificationStatus: data.verification_status || 'pending',
                rejectionReason: data.rejection_reason || '',
            }));
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setFetching(false);
        }
    };

    const fetchDocuments = async () => {
        try {
            const res = await api.get('/accounts/company/documents/');
            const docs = res.data;

            const docState = {
                docRegistration: false,
                docTax: false,
                docProof: false,
                docSignatory: false,
            };

            docs.forEach((doc) => {
                if (doc.document_key === "registration") docState.docRegistration = true;
                if (doc.document_key === "tax") docState.docTax = true;
                if (doc.document_key === "proof") docState.docProof = true;
                if (doc.document_key === "signatory") docState.docSignatory = true;
            });

            setFormData(prev => ({ ...prev, ...docState }));
        } catch (err) {
            console.error("Failed to fetch documents", err);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchDocuments();
    }, []);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            let payload = {};

            if (activeSection === "profile") {
                payload = {
                    company_legal_name: formData.companyLegalName,
                    brand_name: formData.brandName,
                    company_type: formData.companyType,
                    industry: formData.industry,
                    company_size: formData.companySize,
                    founded_year: formData.foundedYear,
                    description: formData.description,
                    headquarters: formData.headquarters,
                };
            } else if (activeSection === "contact") {
                payload = {
                    official_email: formData.officialEmail,
                    support_email: formData.supportEmail,
                    phone_number: formData.phoneNumber,
                    website: formData.website,
                    linkedin_url: formData.linkedinUrl,
                    twitter_url: formData.twitterUrl,
                    careers_page_url: formData.careersPageUrl,
                };
            } else if (activeSection === "location") {
                payload = {
                    registered_address: formData.registeredAddress,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    postal_code: formData.postalCode,
                    branch_locations: formData.branchLocations,
                    is_remote_friendly: formData.isRemoteFriendly,
                };
            } else if (activeSection === "verification") {
                payload = {
                    registration_number: formData.registrationNumber,
                    business_type: formData.businessType,
                    tax_id: formData.taxId,
                    registration_date: formData.registrationDate,
                    registered_country: formData.registeredCountry,
                };
            }

            await api.patch('/accounts/company/profile/', payload);
            Alert.alert("Success", "Settings saved successfully");
            fetchProfile(); // Refresh
        } catch (err) {
            console.error("Failed to save profile", err);
            Alert.alert("Error", "Failed to save settings");
        } finally {
            setIsLoading(false);
        }
    };

    const navItems = [
        { id: 'profile', label: 'Profile', icon: 'briefcase' },
        { id: 'contact', label: 'Contact', icon: 'mail' },
        { id: 'location', label: 'Address', icon: 'map-pin' },
        { id: 'verification', label: 'Legal', icon: 'shield' },
    ];

    const renderHeader = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navBar}>
            {navItems.map(item => (
                <TouchableOpacity
                    key={item.id}
                    onPress={() => setActiveSection(item.id)}
                    style={[styles.navItem, activeSection === item.id && styles.navItemActive]}
                >
                    <Feather name={item.icon} size={16} color={activeSection === item.id ? '#fff' : '#64748b'} />
                    <Text style={[styles.navText, activeSection === item.id && styles.navTextActive]}>
                        {item.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <View style={styles.section}>
                        <View style={styles.logoSection}>
                            <TouchableOpacity 
                                style={styles.logoContainer}
                                onPress={() => Alert.alert("Coming Soon", "Logo upload will be enabled soon.")}
                            >
                                {formData.brandLogoUrl ? (
                                    <Image source={{ uri: formData.brandLogoUrl }} style={styles.logo} />
                                ) : (
                                    <View style={styles.logoPlaceholder}>
                                        <Text style={styles.logoText}>{formData.brandName?.[0] || formData.company_name?.[0] || 'C'}</Text>
                                    </View>
                                )}
                                <View style={styles.cameraIcon}>
                                    <Feather name="camera" size={14} color="#fff" />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.logoHint}>Tap to change logo</Text>
                        </View>

                        <CustomInput
                            label="Company Legal Name"
                            value={formData.companyLegalName}
                            onChangeText={(val) => setFormData({ ...formData, companyLegalName: val })}
                            placeholder="e.g. TechFlow Solutions Pvt. Ltd."
                        />
                        <CustomInput
                            label="Brand / Display Name"
                            value={formData.brandName}
                            onChangeText={(val) => setFormData({ ...formData, brandName: val })}
                            placeholder="e.g. TechFlow"
                        />
                        <CustomInput
                            label="Founded Year"
                            value={formData.foundedYear}
                            onChangeText={(val) => setFormData({ ...formData, foundedYear: val })}
                            placeholder="YYYY"
                        />
                        <CustomInput
                            label="Headquarters"
                            value={formData.headquarters}
                            onChangeText={(val) => setFormData({ ...formData, headquarters: val })}
                            placeholder="e.g. San Francisco, CA"
                            icon="map-pin"
                        />
                        <CustomInput
                            label="Description"
                            value={formData.description}
                            onChangeText={(val) => setFormData({ ...formData, description: val })}
                            placeholder="Brief overview of your company..."
                            multiline
                        />
                    </View>
                );
            case 'contact':
                return (
                    <View style={styles.section}>
                        <CustomInput
                            label="Official Company Email"
                            value={formData.officialEmail}
                            onChangeText={(val) => setFormData({ ...formData, officialEmail: val })}
                            placeholder="contact@company.com"
                            icon="mail"
                            type="email-address"
                        />
                        <CustomInput
                            label="Support / HR Email"
                            value={formData.supportEmail}
                            onChangeText={(val) => setFormData({ ...formData, supportEmail: val })}
                            placeholder="hr@company.com"
                            icon="mail"
                        />
                        <CustomInput
                            label="Phone Number"
                            value={formData.phoneNumber}
                            onChangeText={(val) => setFormData({ ...formData, phoneNumber: val })}
                            placeholder="+1 (555) 000-0000"
                            icon="phone"
                            type="phone-pad"
                        />
                        <CustomInput
                            label="Website URL"
                            value={formData.website}
                            onChangeText={(val) => setFormData({ ...formData, website: val })}
                            placeholder="https://company.com"
                            icon="globe"
                        />
                    </View>
                );
            case 'location':
                return (
                    <View style={styles.section}>
                        <CustomInput
                            label="Registered Office Address"
                            value={formData.registeredAddress}
                            onChangeText={(val) => setFormData({ ...formData, registeredAddress: val })}
                            placeholder="Street address, Floor, Building"
                        />
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <CustomInput
                                    label="City"
                                    value={formData.city}
                                    onChangeText={(val) => setFormData({ ...formData, city: val })}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <CustomInput
                                    label="State"
                                    value={formData.state}
                                    onChangeText={(val) => setFormData({ ...formData, state: val })}
                                />
                            </View>
                        </View>
                        <CustomInput
                            label="Country"
                            value={formData.country}
                            onChangeText={(val) => setFormData({ ...formData, country: val })}
                        />
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Remote Friendly Company</Text>
                            <Switch
                                value={formData.isRemoteFriendly}
                                onValueChange={(val) => setFormData({ ...formData, isRemoteFriendly: val })}
                                trackColor={{ false: '#e2e8f0', true: '#1e1b4b' }}
                            />
                        </View>
                    </View>
                );
            case 'verification':
                return (
                    <View style={styles.section}>
                        <View style={[styles.statusBanner, formData.verificationStatus === 'verified' ? styles.verifiedBanner : styles.pendingBanner]}>
                            <Feather
                                name={formData.verificationStatus === 'verified' ? "check-circle" : "clock"}
                                size={20}
                                color={formData.verificationStatus === 'verified' ? "#10b981" : "#f59e0b"}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.statusTitle}>
                                    Status: {formData.verificationStatus.charAt(0).toUpperCase() + formData.verificationStatus.slice(1)}
                                </Text>
                                <Text style={styles.statusDesc}>
                                    {formData.verificationStatus === 'verified'
                                        ? "Your company is verified. You can post jobs."
                                        : "Verification pending. Review usually takes 24-48h."}
                                </Text>
                            </View>
                        </View>
                        <CustomInput
                            label="Registration Number"
                            value={formData.registrationNumber}
                            onChangeText={(val) => setFormData({ ...formData, registrationNumber: val })}
                            placeholder="e.g. CIN, CRN"
                        />
                        <CustomInput
                            label="Tax ID"
                            value={formData.taxId}
                            onChangeText={(val) => setFormData({ ...formData, taxId: val })}
                        />
                    </View>
                );
            default:
                return null;
        }
    };

    if (fetching) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#1e1b4b" />
                <Text style={styles.loaderText}>Loading Settings...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
                <Text style={styles.heroTitle}>Company Settings</Text>
                <Text style={styles.heroSub}>Manage your professional identity</Text>
            </View>

            <View style={styles.navBarContainer}>
                {renderHeader()}
            </View>

            <View style={styles.content}>
                {renderContent()}

                <TouchableOpacity
                    style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Feather name="save" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    hero: { backgroundColor: '#1e1b4b', padding: 24, paddingBottom: 32 },
    heroTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    heroSub: { fontSize: 14, color: '#94a3b8' },
    navBarContainer: { backgroundColor: '#f8fafc', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    navBar: { paddingHorizontal: 16 },
    navItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
    navItemActive: { backgroundColor: '#1e1b4b', borderColor: '#1e1b4b' },
    navText: { fontSize: 13, fontWeight: '600', color: '#64748b', marginLeft: 6 },
    navTextActive: { color: '#fff' },
    content: { padding: 20 },
    section: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
    logoSection: { alignItems: 'center', marginBottom: 24 },
    logoContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    logo: { width: 100, height: 100, borderRadius: 50 },
    logoPlaceholder: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
    logoText: { fontSize: 32, fontWeight: 'bold', color: '#94a3b8' },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4338ca', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
    logoHint: { fontSize: 12, color: '#94a3b8', marginTop: 8 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12, height: 50 },
    textAreaWrapper: { height: 100, alignItems: 'flex-start', paddingVertical: 12 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '500' },
    textArea: { height: '100%' },
    row: { flexDirection: 'row' },
    saveButton: { backgroundColor: '#f59e0b', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    saveButtonDisabled: { opacity: 0.7 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    statusBanner: { flexDirection: 'row', padding: 16, borderRadius: 12, borderStatus: 1, marginBottom: 24, gap: 12, borderWidth: 1 },
    pendingBanner: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
    verifiedBanner: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
    statusTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
    statusDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    loaderText: { marginTop: 12, color: '#64748b', fontWeight: '500' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingVertical: 8 },
    switchLabel: { fontSize: 14, fontWeight: '700', color: '#475569' }
});


export default CompanySettings;

