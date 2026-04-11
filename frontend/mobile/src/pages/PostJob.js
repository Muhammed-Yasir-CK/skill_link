import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Header from '../components/Header';


const { width } = Dimensions.get('window');

const PostJob = ({ navigation }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        duration: '1-4 weeks',
        description: '',
        deliverables: '',
        responsibilities: '',
        tools: '',
        skills: [],
        currentSkill: '',
        experienceLevel: 'Intermediate',
        paymentType: 'Fixed Price',
        budgetMin: '',
        budgetMax: '',
        currency: 'USD',
        paymentMethod: 'Platform Escrow',
        startDate: '',
        completionTime: '',
        deadline: '',
        portfolioRequired: 'Yes',
        sampleWorkLink: '',
        language: 'English',
        visibility: 'Public'
    });

    const [activeSection, setActiveSection] = useState(0);
    const [errors, setErrors] = useState({});

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name] || errors.form) {
            setErrors(prev => ({ ...prev, [name]: '', form: '' }));
        }
    };

    const validateStep = (step) => {
        const newErrors = {};
        let isValid = true;

        if (step === 0) {
            if (!formData.title.trim()) newErrors.title = true;
            if (!formData.category) newErrors.category = true;
            if (Object.keys(newErrors).length > 0) {
                isValid = false;
                setErrors({ form: 'Please fill in all required fields.' });
            }
        }

        if (step === 1) {
            if (!formData.description.trim()) {
                isValid = false;
                setErrors({ form: 'Project Description is required.' });
            }
        }

        if (step === 3) {
            if (!formData.deadline) {
                isValid = false;
                setErrors({ form: 'Application deadline is required.' });
            }
        }

        return isValid;
    };

    const handleNext = () => {
        if (validateStep(activeSection)) {
            if (activeSection < sections.length - 1) {
                setActiveSection(prev => prev + 1);
            } else {
                console.log('Submitting:', formData);
                alert('Job Posted Successfully! (Mock)');
                navigation.navigate('Home');
            }
        }
    };

    const handleSkillAdd = () => {
        if (formData.currentSkill.trim()) {
            if (!formData.skills.includes(formData.currentSkill.trim())) {
                setFormData(prev => ({
                    ...prev,
                    skills: [...prev.skills, prev.currentSkill.trim()],
                    currentSkill: ''
                }));
            }
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const categories = [
        'Web Development', 'Design', 'Data / ML', 'Writing', 'Marketing', 'Virtual Assistant', 'Other'
    ];

    const sections = [
        { id: 'basic', label: 'Basic', icon: 'briefcase' },
        { id: 'details', label: 'Details', icon: 'file-text' },
        { id: 'payment', label: 'Payment', icon: 'dollar-sign' },
        { id: 'finalize', label: 'Finalize', icon: 'check-circle' }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1e1b4b" />
            <Header user={{ name: 'Muhammed Yasir', role: 'Job Seeker', email: 'yasir@example.com' }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Hero Section */}
                    <View style={styles.hero}>
                        <Text style={styles.heroTitle}>Post a Freelance Gig</Text>
                        <Text style={styles.heroSubtitle}>Connect with top talent for your remote projects. Fill in the details below to get started.</Text>
                    </View>

                    <View style={styles.formCard}>
                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressRow}>
                                {sections.map((section, index) => (
                                    <View key={section.id} style={styles.progressItem}>
                                        <View style={styles.progressStepWrapper}>
                                            <View style={[
                                                styles.stepIcon,
                                                index <= activeSection ? styles.stepIconActive : styles.stepIconInactive
                                            ]}>
                                                <Feather name={section.icon} size={18} color={index <= activeSection ? '#f59e0b' : '#94a3b8'} />
                                            </View>
                                            <Text style={[
                                                styles.stepLabel,
                                                index <= activeSection ? styles.stepLabelActive : styles.stepLabelInactive
                                            ]}>{section.label}</Text>
                                        </View>
                                        {index < sections.length - 1 && (
                                            <View style={[
                                                styles.progressLine,
                                                index < activeSection ? styles.progressLineActive : styles.progressLineInactive
                                            ]} />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.formBody}>
                            {/* Section 0: Basic Info */}
                            {activeSection === 0 && (
                                <View style={styles.formSection}>
                                    <Text style={styles.sectionTitle}>Basic Info</Text>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Gig Title *</Text>
                                        <TextInput
                                            style={[styles.textInput, errors.title && styles.inputErrorBorder]}
                                            placeholder="e.g. React Developer needed"
                                            value={formData.title}
                                            onChangeText={(v) => handleInputChange('title', v)}
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Category *</Text>
                                        <View style={[styles.selectContainer, errors.category && styles.inputErrorBorder]}>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                                                {categories.map(cat => (
                                                    <TouchableOpacity
                                                        key={cat}
                                                        onPress={() => handleInputChange('category', cat)}
                                                        style={[styles.categoryPill, formData.category === cat && styles.categoryPillActive]}
                                                    >
                                                        <Text style={[styles.categoryText, formData.category === cat && styles.categoryTextActive]}>{cat}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Duration</Text>
                                        <View style={styles.selectWrapper}>
                                            {['1-7 days', '1-4 weeks', '1-3 months', '3-6 months', '6+ months'].map(d => (
                                                <TouchableOpacity
                                                    key={d}
                                                    onPress={() => handleInputChange('duration', d)}
                                                    style={[styles.choicePill, formData.duration === d && styles.choicePillActive]}
                                                >
                                                    <Text style={[styles.choiceText, formData.duration === d && styles.choiceTextActive]}>{d}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Section 1: Details */}
                            {activeSection === 1 && (
                                <View style={styles.formSection}>
                                    <Text style={styles.sectionTitle}>Description & Skills</Text>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Project Description *</Text>
                                        <TextInput
                                            style={[styles.textArea, errors.description && styles.inputErrorBorder]}
                                            placeholder="Detailed overview..."
                                            multiline
                                            numberOfLines={4}
                                            value={formData.description}
                                            onChangeText={(v) => handleInputChange('description', v)}
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Skills Required</Text>
                                        <View style={styles.skillInputWrapper}>
                                            <TextInput
                                                style={styles.skillInput}
                                                placeholder="Type skill & hit +"
                                                value={formData.currentSkill}
                                                onChangeText={(v) => handleInputChange('currentSkill', v)}
                                                returnKeyType="done"
                                                onSubmitEditing={handleSkillAdd}
                                            />
                                            <TouchableOpacity onPress={handleSkillAdd} style={styles.addSkillBtn}>
                                                <Feather name="plus" size={20} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.skillsList}>
                                            {formData.skills.map(skill => (
                                                <View key={skill} style={styles.skillPill}>
                                                    <Text style={styles.skillText}>{skill}</Text>
                                                    <TouchableOpacity onPress={() => removeSkill(skill)}>
                                                        <Feather name="x" size={14} color="white" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Section 2: Payment */}
                            {activeSection === 2 && (
                                <View style={styles.formSection}>
                                    <Text style={styles.sectionTitle}>Payment & Budget</Text>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Payment Type</Text>
                                        <View style={styles.typeToggle}>
                                            {['Fixed Price', 'Hourly'].map(type => (
                                                <TouchableOpacity
                                                    key={type}
                                                    style={[styles.typeBtn, formData.paymentType === type && styles.typeBtnActive]}
                                                    onPress={() => handleInputChange('paymentType', type)}
                                                >
                                                    <Text style={[styles.typeText, formData.paymentType === type && styles.typeTextActive]}>{type}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Budget Range ({formData.currency})</Text>
                                        <View style={styles.budgetRow}>
                                            <TextInput
                                                style={styles.budgetInput}
                                                placeholder="Min"
                                                keyboardType="numeric"
                                                value={formData.budgetMin}
                                                onChangeText={(v) => handleInputChange('budgetMin', v)}
                                            />
                                            <Text style={styles.budgetSeparator}>-</Text>
                                            <TextInput
                                                style={styles.budgetInput}
                                                placeholder="Max"
                                                keyboardType="numeric"
                                                value={formData.budgetMax}
                                                onChangeText={(v) => handleInputChange('budgetMax', v)}
                                            />
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Section 3: Finalize */}
                            {activeSection === 3 && (
                                <View style={styles.formSection}>
                                    <Text style={styles.sectionTitle}>Timeline & Requirements</Text>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Application Deadline</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="YYYY-MM-DD"
                                            value={formData.deadline}
                                            onChangeText={(v) => handleInputChange('deadline', v)}
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Job Visibility</Text>
                                        <View style={styles.visibilityContainer}>
                                            <TouchableOpacity
                                                style={[styles.radioItem, formData.visibility === 'Public' && styles.radioItemActive]}
                                                onPress={() => handleInputChange('visibility', 'Public')}
                                            >
                                                <Feather name={formData.visibility === 'Public' ? 'check-circle' : 'circle'} size={18} color={formData.visibility === 'Public' ? '#1e1b4b' : '#94a3b8'} />
                                                <View>
                                                    <Text style={styles.radioLabel}>Public</Text>
                                                    <Text style={styles.radioHint}>Visible to all freelancers</Text>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.radioItem, formData.visibility === 'Invite' && styles.radioItemActive]}
                                                onPress={() => handleInputChange('visibility', 'Invite')}
                                            >
                                                <Feather name={formData.visibility === 'Invite' ? 'check-circle' : 'circle'} size={18} color={formData.visibility === 'Invite' ? '#1e1b4b' : '#94a3b8'} />
                                                <View>
                                                    <Text style={styles.radioLabel}>Invite Only</Text>
                                                    <Text style={styles.radioHint}>Only invited freelancers</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Footer Actions */}
                            <View style={styles.actionFooter}>
                                {errors.form && (
                                    <View style={styles.errorBanner}>
                                        <Feather name="x-circle" size={14} color="#ef4444" />
                                        <Text style={styles.errorText}>{errors.form}</Text>
                                    </View>
                                )}
                                <View style={styles.btnRow}>
                                    <TouchableOpacity
                                        style={styles.backBtn}
                                        onPress={() => activeSection === 0 ? navigation.goBack() : setActiveSection(prev => prev - 1)}
                                    >
                                        <Text style={styles.backBtnText}>{activeSection === 0 ? 'Cancel' : 'Back'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.nextBtn, activeSection === 3 && styles.submitBtn]}
                                        onPress={handleNext}
                                    >
                                        <Text style={[styles.nextBtnText, activeSection === 3 && styles.submitBtnText]}>
                                            {activeSection < 3 ? 'Next Step' : 'Post Job Now'}
                                        </Text>
                                        <Feather
                                            name={activeSection < 3 ? 'chevron-right' : 'check'}
                                            size={18}
                                            color={activeSection === 3 ? '#1e1b4b' : 'white'}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContent: { flexGrow: 1 },
    hero: { backgroundColor: '#1e1b4b', paddingHorizontal: 24, paddingTop: 40, paddingBottom: 80, alignItems: 'center' },
    heroTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 12 },
    heroSubtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', lineHeight: 24, maxWidth: 300 },
    formCard: { marginHorizontal: 16, marginTop: -40, backgroundColor: 'white', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10, overflow: 'hidden' },
    progressContainer: { backgroundColor: '#f8fafc', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    progressItem: { flexDirection: 'row', alignItems: 'center' },
    progressStepWrapper: { alignItems: 'center', gap: 6 },
    stepIcon: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    stepIconActive: { backgroundColor: '#1e1b4b', borderColor: '#f59e0b' },
    stepIconInactive: { backgroundColor: 'white', borderColor: '#e2e8f0' },
    stepLabel: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
    stepLabelActive: { color: '#f59e0b' },
    stepLabelInactive: { color: '#94a3b8' },
    progressLine: { width: width * 0.08, height: 2, marginHorizontal: 8 },
    progressLineActive: { backgroundColor: '#f59e0b' },
    progressLineInactive: { backgroundColor: '#e2e8f0' },
    formBody: { padding: 24 },
    formSection: { gap: 24 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 12 },
    inputGroup: { gap: 8 },
    inputLabel: { fontSize: 14, fontWeight: 'bold', color: '#475569', marginLeft: 4 },
    textInput: { backgroundColor: 'white', borderWith: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1e293b' },
    textArea: { backgroundColor: 'white', borderWith: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1e293b', minHeight: 100, textAlignVertical: 'top' },
    inputErrorBorder: { borderColor: '#ef4444' },
    selectContainer: { height: 50 },
    categoryScroll: { flexDirection: 'row' },
    categoryPill: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f1f5f9', borderRadius: 12, marginRight: 8, height: 40 },
    categoryPillActive: { backgroundColor: '#1e1b4b' },
    categoryText: { color: '#475569', fontWeight: '600' },
    categoryTextActive: { color: '#f59e0b' },
    selectWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    choicePill: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12 },
    choicePillActive: { backgroundColor: '#1e1b4b', borderColor: '#1e1b4b' },
    choiceText: { color: '#475569', fontWeight: '500' },
    choiceTextActive: { color: '#f59e0b' },
    skillInputWrapper: { flexDirection: 'row', gap: 8 },
    skillInput: { flex: 1, backgroundColor: 'white', borderWith: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16 },
    addSkillBtn: { backgroundColor: '#1e1b4b', width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    skillsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    skillPill: { backgroundColor: '#1e1b4b', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    skillText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
    typeToggle: { flexDirection: 'row', backgroundColor: '#f1f5f9', pading: 6, borderRadius: 12 },
    typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
    typeBtnActive: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
    typeText: { fontSize: 14, fontWeight: 'bold', color: '#64748b' },
    typeTextActive: { color: '#1e1b4b' },
    budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    budgetInput: { flex: 1, backgroundColor: 'white', borderWith: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16 },
    budgetSeparator: { color: '#94a3b8', fontSize: 20 },
    visibilityContainer: { gap: 12 },
    radioItem: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderWith: 1, borderColor: '#e2e8f0', borderRadius: 16 },
    radioItemActive: { backgroundColor: '#f8fafc', borderColor: '#1e1b4b' },
    radioLabel: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    radioHint: { fontSize: 12, color: '#64748b', marginTop: 2 },
    actionFooter: { marginTop: 40, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', padding: 12, borderRadius: 10, marginBottom: 20 },
    errorText: { color: '#ef4444', fontSize: 14, fontWeight: 'bold' },
    btnRow: { flexDirection: 'row', gap: 16 },
    backBtn: { flex: 1, height: 56, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    backBtnText: { fontSize: 16, fontWeight: 'bold', color: '#64748b' },
    nextBtn: { flex: 2, height: 56, backgroundColor: '#1e1b4b', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    nextBtnText: { fontSize: 16, fontWeight: 'bold', color: 'white' },
    submitBtn: { backgroundColor: '#f59e0b' },
    submitBtnText: { color: '#1e1b4b' }
});

export default PostJob;
