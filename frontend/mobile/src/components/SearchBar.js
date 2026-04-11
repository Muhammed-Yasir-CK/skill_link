import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

const CustomPicker = ({ label, value, options, onSelect, icon }) => {
    const [visible, setVisible] = useState(false);

    return (
        <View style={styles.pickerWrapper}>
            <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setVisible(true)}
                activeOpacity={0.7}
            >
                <Feather name={icon} size={18} color="#94a3b8" style={styles.inputIcon} />
                <Text style={[styles.pickerValue, !value && styles.pickerPlaceholder]}>
                    {value || label}
                </Text>
                <Feather name="chevron-down" size={16} color="#94a3b8" />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select {label}</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Feather name="x" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            <TouchableOpacity
                                style={styles.optionItem}
                                onPress={() => { onSelect(""); setVisible(false); }}
                            >
                                <Text style={styles.optionText}>All {label}s</Text>
                            </TouchableOpacity>
                            {options.map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={styles.optionItem}
                                    onPress={() => { onSelect(opt); setVisible(false); }}
                                >
                                    <Text style={[styles.optionText, value === opt && styles.optionTextActive]}>
                                        {opt}
                                    </Text>
                                    {value === opt && <Feather name="check" size={18} color="#4338ca" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const SearchBar = ({ onSearch, filters, setFilters, categories = [] }) => {
    const updateFilter = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.mainContainer}>
                {/* Query Input */}
                <View style={styles.inputGroup}>
                    <Feather name="search" size={20} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                        placeholder="Job title, keywords, or company"
                        placeholderTextColor="#94a3b8"
                        style={styles.textInput}
                        value={filters.query}
                        onChangeText={(text) => updateFilter('query', text)}
                    />
                </View>

                {/* Location Input */}
                <View style={styles.inputGroup}>
                    <Feather name="map-pin" size={20} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                        placeholder="City, state, or zip"
                        placeholderTextColor="#94a3b8"
                        style={styles.textInput}
                        value={filters.location}
                        onChangeText={(text) => updateFilter('location', text)}
                    />
                </View>

                {/* Category Dropdown */}
                <CustomPicker
                    label="Category"
                    value={filters.category}
                    options={categories}
                    onSelect={(val) => updateFilter('category', val)}
                    icon="filter"
                />

                {/* Search Button */}
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={onSearch}
                    activeOpacity={0.8}
                >
                    <Text style={styles.searchButtonText}>Find Jobs</Text>
                </TouchableOpacity>
            </View>

            {/* Advanced Filters */}
            <View style={styles.advancedFiltersContainer}>
                <Text style={styles.filterLabel}>Filters:</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.advancedFiltersScroll}
                >
                    <CustomPicker
                        label="Job Type"
                        value={filters.type}
                        options={['Full-time', 'Part-time', 'Contract']}
                        onSelect={(val) => updateFilter('type', val)}
                        icon="briefcase"
                    />
                    <CustomPicker
                        label="Work Style"
                        value={filters.workType}
                        options={['Remote', 'Hybrid', 'Onsite']}
                        onSelect={(val) => updateFilter('workType', val)}
                        icon="home"
                    />
                    <CustomPicker
                        label="Experience"
                        value={filters.experience}
                        options={['Junior', 'Mid', 'Senior']}
                        onSelect={(val) => updateFilter('experience', val)}
                        icon="activity"
                    />
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        ...Platform.select({
            ios: {
                shadowColor: '#64748b',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            }
        })
    },
    mainContainer: {
        gap: 12,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#334155',
    },
    pickerWrapper: {
        marginRight: 8,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 16,
        height: 56,
    },
    pickerValue: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#334155',
    },
    pickerPlaceholder: {
        color: '#94a3b8',
    },
    searchButton: {
        backgroundColor: '#1e1b4b',
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        ...Platform.select({
            ios: {
                shadowColor: '#1e1b4b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            }
        })
    },
    searchButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    advancedFiltersContainer: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94a3b8',
        marginRight: 12,
    },
    advancedFiltersScroll: {
        paddingRight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    optionText: {
        fontSize: 16,
        color: '#475569',
        fontWeight: '500',
    },
    optionTextActive: {
        color: '#4338ca',
        fontWeight: 'bold',
    }
});

export default SearchBar;
