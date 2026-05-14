import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axios';
import Loading from '../../components/Loading'; 
import Header from '../../components/Header';

const PostWork = () => {
    const navigation = useNavigation();
    const [activeSection, setActiveSection] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false); // Added loading state for overall component
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        workNature: '', // 'Professional' or 'Local'
        category: '',
        title: '',
        description: '',
        urgency: 'Flexible',
        paymentType: 'Fixed',
        budgetMin: '',
        budgetMax: '',
        currency: 'USD',
        contactMethod: 'Chat',
        showProfile: true,

        // Professional Specific
        skills: [],
        currentSkill: '',
        experienceLevel: 'Intermediate',
        portfolioRequired: false,
        keywords: [],
        professionalDuration: '1-4 weeks',
        deliverables: '',

        // Local Specific
        city: '',
        area: '',
        pincode: '',
        distancePreference: '5km',
        workLocationType: 'Home',
        toolsProvidedBy: 'Worker',
        localTimeEstimate: 'Half Day',
        preferredDate: '',
        preferredTimeSlot: '',
        certificationRequired: false
    });

    const WORK_NATURES = [
        { id: 'Professional', label: 'Professional / Digital Work', icon: 'monitor', desc: 'Software, Design, Writing, Admin...' },
        { id: 'Local', label: 'Local / Physical Work', icon: 'tool', desc: 'Plumbing, Electrical, Cleaning, Repair...' }
    ];

    const PROFESSIONAL_CATEGORIES = ['Software Development', 'Design', 'Writing / Content', 'Marketing', 'Data / Admin', 'Other Digital Work'];
    const LOCAL_CATEGORIES = ['Plumbing', 'Electrical', 'CCTV / Hardware', 'Cleaning', 'Painting', 'Repair', 'Delivery', 'Other Local Work'];

    const SECTIONS = [
        { id: 'classify', label: 'Classify', icon: 'grid' },
        { id: 'basics', label: 'Basics', icon: 'file-text' },
        { id: 'details', label: 'Details', icon: 'briefcase' },
        { id: 'payment', label: 'Payment', icon: 'dollar-sign' },
        { id: 'review', label: 'Review', icon: 'check-circle' }
    ];

    const handleNatureSelect = (nature) => {
        setFormData(prev => ({
            ...prev,
            workNature: nature,
            category: '',
            skills: nature === 'Professional' ? prev.skills : [],
            city: nature === 'Local' ? prev.city : '',
            area: nature === 'Local' ? prev.area : '',
        }));
        setErrors({});
    };

    const handleSkillAdd = () => {
        if (formData.currentSkill.trim() && !formData.skills.includes(formData.currentSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, prev.currentSkill.trim()],
                currentSkill: ''
            }));
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    const validateStep = (step) => {
        let isValid = true;
        const newErrors = {};

        if (step === 0) {
            if (!formData.workNature) newErrors.workNature = true;
            if (!formData.category) newErrors.category = true;
            if (Object.keys(newErrors).length > 0) {
                isValid = false;
                setErrors({ form: 'Select both nature and category' });
            }
        }
        if (step === 1) {
            if (!formData.title.trim() || !formData.description.trim()) {
                isValid = false;
                setErrors({ form: 'Title and description are required' });
            }
        }
        if (step === 2) {
            if (formData.workNature === 'Local') {
                if (!formData.city.trim() || !formData.area.trim() || !formData.pincode.trim() || !formData.preferredDate) {
                    isValid = false;
                    setErrors({ form: 'Location & Date details required' });
                }
            }
            if (formData.workNature === 'Professional' && formData.skills.length === 0) {
                isValid = false;
                setErrors({ form: 'Add at least one skill' });
            }
        }
        if (step === 3) {
            if (formData.budgetMin && formData.budgetMax && Number(formData.budgetMax) < Number(formData.budgetMin)) {
                isValid = false;
                setErrors({ form: 'Maximum budget must be > min budget' });
            }
        }
        return isValid;
    };

    const transformData = () => ({
        work_nature: formData.workNature,
        category: formData.category,
        title: formData.title.trim(),
        description: formData.description.trim(),
        urgency: formData.urgency,
        skills: formData.skills,
        experience_level: formData.experienceLevel,
        portfolio_required: formData.portfolioRequired,
        deliverables: formData.deliverables,
        professional_duration: formData.professionalDuration,
        city: formData.city,
        area: formData.area,
        pincode: formData.pincode,
        distance_preference: formData.distancePreference,
        work_location_type: formData.workLocationType,
        tools_provided_by: formData.toolsProvidedBy,
        local_time_estimate: formData.localTimeEstimate,
        preferred_date: formData.preferredDate || null,
        preferred_time_slot: formData.preferredTimeSlot || null,
        certification_required: formData.certificationRequired,
        payment_type: formData.paymentType,
        budget_min: formData.budgetMin || null,
        budget_max: formData.budgetMax || null,
        currency: formData.currency,
        contact_method: formData.contactMethod,
        show_profile: formData.showProfile
    });

    const handleNext = async () => {
        setErrors({});
        if (!validateStep(activeSection)) return;

        if (activeSection < SECTIONS.length - 1) {
            setActiveSection(prev => prev + 1);
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/work-posts/', transformData());
            Alert.alert("Success", "Work Posted Successfully!");
            navigation.navigate("WorkDashboard");
        } catch (error) {
            setErrors({ form: "Something went wrong. Please try again." });
            Alert.alert("Post Failed", error.response?.data?.detail || "Could not post your work request.");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStepContent = () => {
        if (loading) return <Loading message="Loading form data..." />; // Example usage of overall loading state

        if (activeSection === 0) {
            return (
                <View style={styles.stepContainer}>
                    <Text style={styles.stepTitle}>1. What is the nature of the work?</Text>
                    {WORK_NATURES.map(nature => (
                        <TouchableOpacity 
                            key={nature.id}
                            style={[styles.natureCard, formData.workNature === nature.id && styles.activeNatureCard]}
                            onPress={() => handleNatureSelect(nature.id)}
                        >
                            <View style={styles.natureIconBlock}>
                                <Feather name={nature.icon} size={24} color={formData.workNature === nature.id ? '#4f46e5' : '#64748b'} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.natureTitle, formData.workNature === nature.id && styles.activeNatureTitle]}>{nature.label}</Text>
                                <Text style={styles.natureDesc}>{nature.desc}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                    {formData.workNature !== '' && (
                        <View style={{ marginTop: 24 }}>
                            <Text style={styles.stepTitle}>2. Select a Category</Text>
                            <View style={styles.categoryGrid}>
                                {(formData.workNature === 'Professional' ? PROFESSIONAL_CATEGORIES : LOCAL_CATEGORIES).map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.catBadge, formData.category === cat && styles.activeCatBadge]}
                                        onPress={() => setFormData(prev => ({ ...prev, category: cat }))}
                                    >
                                        <Text style={[styles.catBadgeText, formData.category === cat && styles.activeCatBadgeText]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            );
        }

        if (activeSection === 1) {
            return (
                <View style={styles.stepContainer}>
                    <Text style={styles.inputLabel}>Work Title *</Text>
                    <TextInput style={styles.input} placeholder="e.g. Broken Kitchen Sink Pipe Repair" value={formData.title} onChangeText={t => setFormData({ ...formData, title: t })} />

                    <Text style={styles.inputLabel}>Short Description *</Text>
                    <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={5} placeholder="Describe exactly what needs to be done..." value={formData.description} onChangeText={t => setFormData({ ...formData, description: t })} />

                    <Text style={styles.inputLabel}>Urgency</Text>
                    <View style={styles.tabRow}>
                        {['Immediate', 'Flexible', 'Scheduled'].map(opt => (
                            <TouchableOpacity key={opt} style={[styles.tabBtn, formData.urgency === opt && styles.activeTabBtn]} onPress={() => setFormData({ ...formData, urgency: opt })}>
                                <Text style={[styles.tabBtnText, formData.urgency === opt && styles.activeTabBtnText]}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        }

        if (activeSection === 2) {
            if (formData.workNature === 'Professional') {
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.inputLabel}>Required Skills *</Text>
                        <View style={styles.addSkillRow}>
                            <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="e.g. React" value={formData.currentSkill} onChangeText={t => setFormData({ ...formData, currentSkill: t })} />
                            <TouchableOpacity style={styles.addBtn} onPress={handleSkillAdd}>
                                <Feather name="plus" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.skillsList}>
                            {formData.skills.map(skill => (
                                <View key={skill} style={styles.skillBadge}>
                                    <Text style={styles.skillBadgeText}>{skill}</Text>
                                    <TouchableOpacity onPress={() => removeSkill(skill)}><Feather name="x" size={14} color="#4f46e5" /></TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Experience Level</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectionRow}>
                            {['Beginner', 'Intermediate', 'Experienced', 'Expert'].map(opt => (
                                <TouchableOpacity key={opt} style={[styles.pill, formData.experienceLevel === opt && styles.selectedPill]} onPress={() => setFormData({ ...formData, experienceLevel: opt })}>
                                    <Text style={[styles.pillText, formData.experienceLevel === opt && styles.selectedPillText]}>{opt}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.inputLabel}>Deliverables</Text>
                        <TextInput style={styles.input} placeholder="e.g. Source code, Design files" value={formData.deliverables} onChangeText={t => setFormData({ ...formData, deliverables: t })} />
                        
                        <TouchableOpacity style={[styles.checkboxRow, formData.portfolioRequired && styles.checkboxActive]} onPress={() => setFormData({ ...formData, portfolioRequired: !formData.portfolioRequired })}>
                            <Feather name={formData.portfolioRequired ? 'check-square' : 'square'} size={20} color={formData.portfolioRequired ? '#4f46e5' : '#94a3b8'} />
                            <Text style={styles.checkboxText}>Require previous work / portfolio</Text>
                        </TouchableOpacity>
                    </View>
                );
            } else {
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.inputLabel}>City *</Text>
                        <TextInput style={styles.input} placeholder="e.g. New York" value={formData.city} onChangeText={t => setFormData({ ...formData, city: t })} />

                        <Text style={styles.inputLabel}>Area / Locality *</Text>
                        <TextInput style={styles.input} placeholder="e.g. Brooklyn" value={formData.area} onChangeText={t => setFormData({ ...formData, area: t })} />

                        <Text style={styles.inputLabel}>Pincode *</Text>
                        <TextInput style={styles.input} placeholder="11001" keyboardType="numeric" value={formData.pincode} onChangeText={t => setFormData({ ...formData, pincode: t })} />

                        <Text style={styles.inputLabel}>Preferred Date *</Text>
                        <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.preferredDate} onChangeText={t => setFormData({ ...formData, preferredDate: t })} />

                        <Text style={styles.inputLabel}>Estimated Time</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectionRow}>
                            {['1-2 Hours', 'Half Day (4 hrs)', 'Full Day', 'Multiple Days'].map(opt => (
                                <TouchableOpacity key={opt} style={[styles.pill, formData.localTimeEstimate === opt && styles.selectedPill]} onPress={() => setFormData({ ...formData, localTimeEstimate: opt })}>
                                    <Text style={[styles.pillText, formData.localTimeEstimate === opt && styles.selectedPillText]}>{opt}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity style={[styles.checkboxRow, formData.certificationRequired && styles.checkboxActive]} onPress={() => setFormData({ ...formData, certificationRequired: !formData.certificationRequired })}>
                            <Feather name={formData.certificationRequired ? 'check-square' : 'square'} size={20} color={formData.certificationRequired ? '#4f46e5' : '#94a3b8'} />
                            <Text style={styles.checkboxText}>Require Certification / ID</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
        }

        if (activeSection === 3) {
            return (
                <View style={styles.stepContainer}>
                    <Text style={styles.inputLabel}>Payment Type</Text>
                    <View style={styles.tabRow}>
                        {['Fixed', 'Hourly'].map(opt => (
                            <TouchableOpacity key={opt} style={[styles.tabBtn, formData.paymentType === opt && styles.activeTabBtn]} onPress={() => setFormData({ ...formData, paymentType: opt })}>
                                <Text style={[styles.tabBtnText, formData.paymentType === opt && styles.activeTabBtnText]}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.inputLabel}>Currency</Text>
                    <View style={styles.tabRow}>
                        {['USD', 'EUR', 'GBP', 'INR'].map(opt => (
                            <TouchableOpacity key={opt} style={[styles.tabBtn, formData.currency === opt && styles.activeTabBtn]} onPress={() => setFormData({ ...formData, currency: opt })}>
                                <Text style={[styles.tabBtnText, formData.currency === opt && styles.activeTabBtnText]}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Budget (Min)</Text>
                            <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={formData.budgetMin} onChangeText={t => setFormData({ ...formData, budgetMin: t })} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Budget (Max)</Text>
                            <TextInput style={styles.input} placeholder="1000" keyboardType="numeric" value={formData.budgetMax} onChangeText={t => setFormData({ ...formData, budgetMax: t })} />
                        </View>
                    </View>
                </View>
            );
        }

        if (activeSection === 4) {
            return (
                <View style={styles.stepContainer}>
                    <View style={styles.reviewCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.reviewTitle}>{formData.title}</Text>
                                <Text style={styles.reviewDesc}>{formData.description}</Text>
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{formData.workNature}</Text>
                            </View>
                        </View>
                        <View style={styles.reviewGrid}>
                            <View style={styles.reviewCol}>
                                <Text style={styles.reviewLabel}>Category</Text>
                                <Text style={styles.reviewVal}>{formData.category}</Text>
                            </View>
                            <View style={styles.reviewCol}>
                                <Text style={styles.reviewLabel}>Budget</Text>
                                <Text style={styles.reviewVal}>{formData.currency} {formData.budgetMax || 'N/A'}</Text>
                            </View>
                        </View>
                        {formData.workNature === 'Local' && (
                            <View style={{ marginTop: 12 }}>
                                <Text style={styles.reviewLabel}>Location</Text>
                                <Text style={styles.reviewVal}>{formData.city}, {formData.area} ({formData.pincode})</Text>
                            </View>
                        )}
                    </View>
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <View style={styles.subHeader}>
                <Text style={styles.headerTitle}>Post Work</Text>
            </View>

            <View style={styles.stepperContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepper}>
                    {SECTIONS.map((sec, idx) => (
                        <View key={sec.id} style={styles.stepIndicator}>
                            <View style={[styles.stepCircle, idx <= activeSection && styles.activeStepCircle]}>
                                <Feather name={sec.icon} size={16} color={idx <= activeSection ? '#fff' : '#94a3b8'} />
                            </View>
                            <Text style={[styles.stepIconLabel, idx <= activeSection && styles.activeStepIconLabel]}>{sec.label}</Text>
                            {idx < SECTIONS.length - 1 && <View style={[styles.stepLine, idx < activeSection && styles.activeStepLine]} />}
                        </View>
                    ))}
                </ScrollView>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
                    {errors.form && (
                        <View style={styles.errorBox}>
                            <Feather name="alert-circle" size={16} color="#ef4444" />
                            <Text style={styles.errorText}>{errors.form}</Text>
                        </View>
                    )}
                    
                    {renderStepContent()}

                    <View style={styles.actionRow}>
                        {activeSection > 0 && (
                            <TouchableOpacity style={styles.actionBtnBack} onPress={() => setActiveSection(prev => prev - 1)}>
                                <Text style={styles.actionBtnBackText}>Back</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.actionBtnNext, activeSection === 0 && { flex: 1 }]} onPress={handleNext} disabled={submitting}>
                            {submitting ? <ActivityIndicator color="#fff" /> : (
                                <Text style={styles.actionBtnNextText}>{activeSection === SECTIONS.length - 1 ? 'Post Work' : 'Next Step'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 60 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    subHeader: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#f8fafc' },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    stepperContainer: { backgroundColor: '#fff', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    stepper: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    stepIndicator: { flexDirection: 'row', alignItems: 'center' },
    stepCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#e2e8f0' },
    activeStepCircle: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
    stepIconLabel: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', marginLeft: 6, textTransform: 'uppercase' },
    activeStepIconLabel: { color: '#4f46e5' },
    stepLine: { width: 24, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 10 },
    activeStepLine: { backgroundColor: '#4f46e5' },
    errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#fecaca', gap: 8 },
    errorText: { color: '#ef4444', fontWeight: 'bold', fontSize: 13 },
    stepContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24 },
    stepTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
    natureCard: { padding: 16, borderRadius: 16, borderWidth: 2, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
    activeNatureCard: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
    natureIconBlock: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
    natureTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
    activeNatureTitle: { color: '#312e81' },
    natureDesc: { fontSize: 13, color: '#64748b' },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    catBadge: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
    activeCatBadge: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
    catBadgeText: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },
    activeCatBadgeText: { color: '#fff' },
    inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 14 : 10, fontSize: 15, color: '#0f172a', fontWeight: '500' },
    textArea: { height: 100, textAlignVertical: 'top' },
    tabRow: { flexDirection: 'row', backgroundColor: '#f1f5f9', p: 4, borderRadius: 12 },
    tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeTabBtn: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
    tabBtnText: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },
    activeTabBtnText: { color: '#4f46e5' },
    addSkillRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    addBtn: { width: 48, height: 48, backgroundColor: '#4f46e5', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    skillsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    skillBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#c7d2fe', gap: 6 },
    skillBadgeText: { fontSize: 13, fontWeight: 'bold', color: '#4f46e5' },
    selectionRow: { marginBottom: 16 },
    pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8 },
    selectedPill: { backgroundColor: '#eef2ff', borderColor: '#4f46e5' },
    pillText: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },
    selectedPillText: { color: '#4f46e5' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 16 },
    checkboxActive: { backgroundColor: '#eef2ff', borderColor: '#4f46e5' },
    checkboxText: { fontSize: 14, fontWeight: 'bold', color: '#334155' },
    reviewCard: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    reviewTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
    reviewDesc: { fontSize: 14, color: '#64748b', marginBottom: 16 },
    badge: { backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 11, fontWeight: 'bold', color: '#4f46e5', textTransform: 'uppercase' },
    reviewGrid: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12 },
    reviewCol: { flex: 1 },
    reviewLabel: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
    reviewVal: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
    actionRow: { flexDirection: 'row', gap: 12 },
    actionBtnBack: { flex: 1, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center' },
    actionBtnBackText: { fontSize: 15, fontWeight: 'bold', color: '#475569' },
    actionBtnNext: { flex: 2, backgroundColor: '#4f46e5', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    actionBtnNextText: { fontSize: 15, fontWeight: 'bold', color: '#fff' }
});

export default PostWork;
