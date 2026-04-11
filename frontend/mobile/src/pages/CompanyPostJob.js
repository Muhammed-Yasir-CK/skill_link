import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Loading from '../components/Loading';

import api from '../api/axios';

// Local Notification Component to mirror web behavior
const Notification = ({ type, message, isVisible, onClose }) => {
    if (!isVisible) return null;
    return (
        <View style={[styles.notificationContainer, type === 'error' ? styles.notificationError : styles.notificationSuccess]}>
            <Text style={styles.notificationText}>{message}</Text>
            <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={18} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const CompanyPostJob = ({ navigation }) => {
    const { user, loading } = useAuth();
    const [formData, setFormData] = useState({
        // 1. Basic Job Information
        jobTitle: '',
        category: '',
        employmentType: '',
        seniorityLevel: '',
        location: '',
        remoteOption: 'On-site',

        // 2. Details & Skills
        description: '',
        skills: [],
        currentSkill: '',
        education: '',
        experience: '',
        certifications: '',

        // 3. Compensation & Benefits
        salaryMin: '',
        salaryMax: '',
        currency: 'INR',
        salaryPeriod: 'Yearly',
        benefits: [],
        currentBenefit: '',

        // 4. Application Details & Tags
        deadline: '',
        applicationMethod: 'Via App',
        applicationLink: '',
        openings: '1',
        tags: [],
        currentTag: '',

        // Optional
        shortSummary: '',
        questions: [],
        currentQuestion: '',
    });

    const [activeSection, setActiveSection] = useState(0);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (loading) return <Loading message="Preparing workspace..." />;

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name] || errors.form) {
            setErrors(prev => ({ ...prev, [name]: '', form: '' }));
        }
    };

    const handleArrayAdd = (field, currentField) => {
        const val = formData[currentField]?.trim();
        if (val && !formData[field].includes(val)) {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], val],
                [currentField]: ''
            }));
        }
    };

    const handleArrayRemove = (field, itemToRemove) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(item => item !== itemToRemove)
        }));
    };

    const categories = ['IT & Software', 'Marketing', 'Finance', 'Design', 'Sales', 'HR', 'Engineering', 'Operations', 'Other'];
    const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
    const seniorityLevels = ['Entry-level', 'Junior', 'Mid-level', 'Senior', 'Manager', 'Director', 'Executive'];
    const remoteOptions = ['On-site', 'Remote', 'Hybrid'];

    const sections = [
        { id: 'basics', label: 'Basics', icon: 'briefcase' },
        { id: 'details', label: 'Details', icon: 'file-text' },
        { id: 'rewards', label: 'Rewards', icon: 'dollar-sign' },
        { id: 'finalize', label: 'Finalize', icon: 'check-circle' }
    ];

    const validateStep = (step) => {
        const newErrors = {};
        let isValid = true;

        if (step === 0) {
            if (!formData.jobTitle.trim()) newErrors.jobTitle = true;
            if (!formData.category) newErrors.category = true;
            if (!formData.employmentType) newErrors.employmentType = true;
            if (!formData.seniorityLevel) newErrors.seniorityLevel = true;
            if (!formData.location.trim() && formData.remoteOption !== 'Remote') newErrors.location = true;
        }

        if (step === 1) {
            if (!formData.description.trim()) newErrors.description = true;
            if (formData.skills.length === 0) newErrors.skills = true;
        }

        if (step === 2) {
            if (formData.salaryMin && formData.salaryMax && Number(formData.salaryMin) > Number(formData.salaryMax)) {
                newErrors.salary = 'Min salary cannot be greater than Max salary';
                isValid = false;
            }
        }

        if (step === 3) {
            if (!formData.deadline) newErrors.deadline = true;
        }

        if (Object.keys(newErrors).length > 0 && !newErrors.salary) {
            isValid = false;
            setErrors({ ...newErrors, form: 'Please fill in all required fields.' });
        } else if (newErrors.salary) {
            setErrors({ ...newErrors });
        }

        return isValid;
    };

    const handleSubmitJob = async () => {
        setIsSubmitting(true);
        const workModeMap = { 'On-site': 'on_site', 'Remote': 'remote', 'Hybrid': 'hybrid' };
        const salaryPeriodMap = { 'Yearly': 'yearly', 'Monthly': 'monthly', 'Hourly': 'hourly' };

        const payload = {
            title: formData.jobTitle,
            category: formData.category,
            employment_type: formData.employmentType.toLowerCase().replace('-', '_'),
            seniority_level: formData.seniorityLevel.toLowerCase().replace('-', '_'),
            location: formData.location,
            work_mode: workModeMap[formData.remoteOption],
            description: formData.description,
            skills: formData.skills,
            education: formData.education,
            experience: formData.experience,
            certifications: formData.certifications,
            salary_min: formData.salaryMin || null,
            salary_max: formData.salaryMax || null,
            salary_currency: formData.currency,
            salary_period: salaryPeriodMap[formData.salaryPeriod],
            benefits: formData.benefits,
            application_deadline: formData.deadline,
            application_method: formData.applicationMethod === 'Via App' ? 'in_app' : 'external',
            application_link: formData.applicationLink,
            openings: Number(formData.openings),
            tags: formData.tags,
            short_summary: formData.shortSummary,
            screening_questions: formData.questions,
        };

        try {
            const response = await api.post('company/jobs/', payload);
            if (response.status === 201) {
                setNotification({
                    show: true,
                    message: 'Job Posted Successfully! Redirecting...',
                    type: 'success'
                });
                setTimeout(() => {
                    navigation.navigate('CompanyDashboard');
                }, 3000);
            }
        } catch (err) {
            console.error('Error posting job:', err.response?.data || err.message);
            if (err.response?.data) {
                const backendErrors = err.response.data;
                const fieldErrors = {};
                Object.keys(backendErrors).forEach(key => {
                    fieldErrors[key] = true;
                });
                setErrors(prev => ({ ...prev, ...fieldErrors, form: 'Please fix highlighted fields.' }));
            } else {
                setErrors(prev => ({ ...prev, form: 'Failed to post job. Please try again.' }));
            }
            setNotification({
                show: true,
                message: 'Failed to post job. Please try again.',
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (validateStep(activeSection)) {
            if (activeSection < sections.length - 1) {
                setActiveSection(prev => prev + 1);
            } else {
                handleSubmitJob();
            }
        }
    };

    const renderPicker = (name, options, label, value) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.pickerContainer, errors[name] && styles.inputError]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {options.map(opt => (
                        <TouchableOpacity
                            key={opt}
                            onPress={() => handleInputChange(name, opt)}
                            style={[styles.pickerItem, value === opt && styles.pickerItemActive]}
                        >
                            <Text style={[styles.pickerText, value === opt && styles.pickerTextActive]}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );

    const renderStepContent = () => {
        switch (activeSection) {
            case 0:
                return (
                    <View style={styles.stepContent}>
                        <View style={styles.sectionHeader}>
                            <Feather name="briefcase" size={24} color="#f59e0b" />
                            <Text style={styles.sectionTitle}>Basic Job Information</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Job Title *</Text>
                            <TextInput
                                style={[styles.input, errors.jobTitle && styles.inputError]}
                                value={formData.jobTitle}
                                onChangeText={(val) => handleInputChange('jobTitle', val)}
                                placeholder="e.g. Senior Python Developer"
                            />
                            <Text style={styles.helperText}>Make it clear and descriptive.</Text>
                        </View>

                        {renderPicker('category', categories, 'Job Category *', formData.category)}
                        {renderPicker('employmentType', employmentTypes, 'Employment Type *', formData.employmentType)}
                        {renderPicker('seniorityLevel', seniorityLevels, 'Seniority Level *', formData.seniorityLevel)}
                        {renderPicker('remoteOption', remoteOptions, 'Remote Option *', formData.remoteOption)}

                        {formData.remoteOption !== 'Remote' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Work Location *</Text>
                                <View style={styles.inputWithIcon}>
                                    <Feather name="map-pin" size={18} color="#94a3b8" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }, errors.location && styles.inputError]}
                                        value={formData.location}
                                        onChangeText={(val) => handleInputChange('location', val)}
                                        placeholder="e.g. Bangalore, India"
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                );
            case 1:
                return (
                    <View style={styles.stepContent}>
                        <View style={styles.sectionHeader}>
                            <Feather name="file-text" size={24} color="#f59e0b" />
                            <Text style={styles.sectionTitle}>Description & Requirements</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Job Description *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                                value={formData.description}
                                onChangeText={(val) => handleInputChange('description', val)}
                                placeholder="Detailed description..."
                                multiline
                                numberOfLines={6}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Required Skills *</Text>
                            <View style={[styles.arrayInput, errors.skills && styles.inputError]}>
                                <View style={styles.chipContainer}>
                                    {formData.skills.map(skill => (
                                        <View key={skill} style={styles.chip}>
                                            <Text style={styles.chipText}>{skill}</Text>
                                            <TouchableOpacity onPress={() => handleArrayRemove('skills', skill)}>
                                                <Feather name="x" size={12} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    <TextInput
                                        style={styles.arrayTextInput}
                                        value={formData.currentSkill}
                                        onChangeText={(val) => handleInputChange('currentSkill', val)}
                                        onSubmitEditing={() => handleArrayAdd('skills', 'currentSkill')}
                                        placeholder="Add skill..."
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Experience</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.experience}
                                    onChangeText={(val) => handleInputChange('experience', val)}
                                    placeholder="3+ Years"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                                <Text style={styles.label}>Education</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.education}
                                    onChangeText={(val) => handleInputChange('education', val)}
                                    placeholder="B.Tech"
                                />
                            </View>
                        </View>
                    </View>
                );
            case 2:
                return (
                    <View style={styles.stepContent}>
                        <View style={styles.sectionHeader}>
                            <Feather name="dollar-sign" size={24} color="#f59e0b" />
                            <Text style={styles.sectionTitle}>Compensation & Benefits</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Salary Range ({formData.currency})</Text>
                            <View style={styles.row}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={formData.salaryMin}
                                    onChangeText={(val) => handleInputChange('salaryMin', val)}
                                    keyboardType="numeric"
                                    placeholder="Min"
                                />
                                <Text style={styles.dash}>-</Text>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={formData.salaryMax}
                                    onChangeText={(val) => handleInputChange('salaryMax', val)}
                                    keyboardType="numeric"
                                    placeholder="Max"
                                />
                            </View>
                            {errors.salary && <Text style={styles.errorTextSmall}>{errors.salary}</Text>}
                        </View>

                        {renderPicker('salaryPeriod', ['Yearly', 'Monthly', 'Hourly'], 'Salary Period', formData.salaryPeriod)}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Benefits & Perks</Text>
                            <View style={styles.arrayInputRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={formData.currentBenefit}
                                    onChangeText={(val) => handleInputChange('currentBenefit', val)}
                                    placeholder="Add benefit..."
                                />
                                <TouchableOpacity style={styles.addButtonCircle} onPress={() => handleArrayAdd('benefits', 'currentBenefit')}>
                                    <Feather name="plus" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.chipContainer}>
                                {formData.benefits.map(benefit => (
                                    <View key={benefit} style={styles.benefitChip}>
                                        <Feather name="check-circle" size={12} color="#10b981" />
                                        <Text style={styles.benefitChipText}>{benefit}</Text>
                                        <TouchableOpacity onPress={() => handleArrayRemove('benefits', benefit)}>
                                            <Feather name="x" size={12} color="#10b981" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                );
            case 3:
                return (
                    <View style={styles.stepContent}>
                        <View style={styles.sectionHeader}>
                            <Feather name="check-circle" size={24} color="#f59e0b" />
                            <Text style={styles.sectionTitle}>Application & Review</Text>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Deadline *</Text>
                                <TextInput
                                    style={[styles.input, errors.deadline && styles.inputError]}
                                    value={formData.deadline}
                                    onChangeText={(val) => handleInputChange('deadline', val)}
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                                <Text style={styles.label}>Openings</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.openings}
                                    onChangeText={(val) => handleInputChange('openings', val)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Search Tags</Text>
                            <View style={styles.arrayInput}>
                                <View style={styles.chipContainer}>
                                    {formData.tags.map(tag => (
                                        <View key={tag} style={styles.tagChip}>
                                            <Text style={styles.tagChipText}>#{tag}</Text>
                                            <TouchableOpacity onPress={() => handleArrayRemove('tags', tag)}>
                                                <Feather name="x" size={12} color="#64748b" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    <TextInput
                                        style={styles.arrayTextInput}
                                        value={formData.currentTag}
                                        onChangeText={(val) => handleInputChange('currentTag', val)}
                                        onSubmitEditing={() => handleArrayAdd('tags', 'currentTag')}
                                        placeholder="Add tag..."
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.reviewCard}>
                            <Text style={styles.reviewHeading}>Posting as:</Text>
                            <View style={styles.reviewRow}>
                                <View style={styles.reviewAvatar}>
                                    <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
                                </View>
                                <View>
                                    <Text style={styles.reviewName}>{user?.name}</Text>
                                    <Text style={styles.reviewEmail}>{user?.email}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            default: return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1e1b4b" />
            <Notification
                type={notification.type}
                message={notification.message}
                isVisible={notification.show}
                onClose={() => setNotification(p => ({ ...p, show: false }))}
            />
            <Header />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.hero}>
                        <Text style={styles.heroTitle}>Post a New Job</Text>
                        <Text style={styles.heroSubtitle}>Find the perfect candidate for your team.</Text>
                    </View>

                    <View style={styles.stepperContainer}>
                        <View style={styles.stepper}>
                            {sections.map((section, index) => (
                                <View key={section.id} style={styles.stepItem}>
                                    <View style={[styles.stepIcon, index <= activeSection && styles.stepIconActive]}>
                                        <Feather name={section.icon} size={18} color={index <= activeSection ? '#f59e0b' : '#94a3b8'} />
                                    </View>
                                    <Text style={[styles.stepLabel, index <= activeSection && styles.stepLabelActive]}>{section.label}</Text>
                                    {index < sections.length - 1 && (
                                        <View style={[styles.stepLine, index < activeSection && styles.stepLineActive]} />
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.formCard}>
                        {renderStepContent()}

                        <View style={styles.footer}>
                            {errors.form && (
                                <View style={styles.formError}>
                                    <Feather name="x-circle" size={16} color="#ef4444" />
                                    <Text style={styles.formErrorText}>{errors.form}</Text>
                                </View>
                            )}

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={() => activeSection === 0 ? navigation.goBack() : setActiveSection(prev => prev - 1)}
                                >
                                    <Text style={styles.backButtonText}>{activeSection === 0 ? 'Cancel' : 'Back'}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.nextButton, isSubmitting && styles.disabledButton]}
                                    onPress={handleNext}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.nextButtonText}>
                                        {isSubmitting ? 'Posting...' : activeSection === sections.length - 1 ? 'Post Job Now' : 'Next Step'}
                                    </Text>
                                    {!isSubmitting && <Feather name={activeSection === sections.length - 1 ? 'check' : 'chevron-right'} size={18} color="#1e1b4b" />}
                                </TouchableOpacity>
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { flexGrow: 1 },
    hero: { backgroundColor: '#1e1b4b', padding: 30, paddingBottom: 80, alignItems: 'center' },
    heroTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
    heroSubtitle: { color: '#cbd5e1', fontSize: 16, marginTop: 8, textAlign: 'center' },
    stepperContainer: { marginTop: -40, paddingHorizontal: 20 },
    stepper: { backgroundColor: 'white', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    stepItem: { alignItems: 'center', flex: 1 },
    stepIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    stepIconActive: { backgroundColor: '#1e1b4b', borderColor: '#f59e0b' },
    stepLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginTop: 4, textTransform: 'uppercase' },
    stepLabelActive: { color: '#1e1b4b' },
    stepLine: { position: 'absolute', top: 20, left: '70%', width: '60%', height: 2, backgroundColor: '#f1f5f9', zIndex: -1 },
    stepLineActive: { backgroundColor: '#f59e0b' },
    formCard: { backgroundColor: 'white', margin: 20, borderRadius: 16, padding: 20, elevation: 2 },
    stepContent: { gap: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#475569' },
    input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 16, color: '#1e293b' },
    inputError: { borderColor: '#ef4444' },
    helperText: { fontSize: 12, color: '#94a3b8' },
    pickerContainer: { flexDirection: 'row', gap: 10 },
    pickerItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWith: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
    pickerItemActive: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
    pickerText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
    pickerTextActive: { color: '#1e1b4b', fontWeight: 'bold' },
    inputWithIcon: { flexDirection: 'row', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: 12, zIndex: 1 },
    textArea: { height: 120, textAlignVertical: 'top' },
    arrayInput: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 8, minHeight: 48 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1b4b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 6 },
    chipText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    arrayTextInput: { flex: 1, minWidth: 100, fontSize: 14, padding: 4 },
    row: { flexDirection: 'row', gap: 12 },
    dash: { alignSelf: 'center', color: '#cbd5e1', fontWeight: 'bold' },
    errorTextSmall: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },
    arrayInputRow: { flexDirection: 'row', gap: 10 },
    addButtonCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1e1b4b', alignItems: 'center', justifyContent: 'center' },
    benefitChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6, borderWidth: 1, borderColor: '#dcfce7' },
    benefitChipText: { color: '#16a34a', fontSize: 12, fontWeight: 'bold' },
    tagChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 6 },
    tagChipText: { color: '#64748b', fontSize: 12, fontWeight: 'bold' },
    reviewCard: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 16, borderWith: 1, borderColor: '#e2e8f0' },
    reviewHeading: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 12 },
    reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    reviewAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWith: 1, borderColor: '#e2e8f0' },
    avatarText: { fontSize: 20, fontWeight: 'bold', color: '#1e1b4b' },
    reviewName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    reviewEmail: { fontSize: 14, color: '#3b82f6' },
    footer: { marginTop: 24, pt: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    formError: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', padding: 12, borderRadius: 10, marginBottom: 16 },
    formErrorText: { color: '#ef4444', fontSize: 14, fontWeight: 'bold' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    backButton: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
    backButtonText: { color: '#64748b', fontWeight: 'bold', fontSize: 16 },
    nextButton: { flex: 2, backgroundColor: '#f59e0b', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    nextButtonText: { color: '#1e1b4b', fontWeight: 'bold', fontSize: 16 },
    disabledButton: { opacity: 0.5 },
    notificationContainer: { position: 'absolute', top: 40, left: 20, right: 20, zIndex: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, elevation: 10 },
    notificationSuccess: { backgroundColor: '#10b981' },
    notificationError: { backgroundColor: '#ef4444' },
    notificationText: { color: 'white', fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 10 }
});

export default CompanyPostJob;
