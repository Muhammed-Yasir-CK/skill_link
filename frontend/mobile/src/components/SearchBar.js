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
    const [showFilters, setShowFilters] = useState(false);

    const updateFilter = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.searchRow}>
                <View style={styles.searchField}>
                    <Feather name="search" size={18} color="#64748b" />
                    <TextInput
                        placeholder="Search skills, jobs..."
                        placeholderTextColor="#94a3b8"
                        style={styles.textInput}
                        value={filters.query}
                        onChangeText={(text) => updateFilter('query', text)}
                    />
                </View>
                <TouchableOpacity 
                    style={[styles.filterToggle, showFilters && styles.filterToggleActive]} 
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Feather name="sliders" size={18} color={showFilters ? "#fff" : "#64748b"} />
                </TouchableOpacity>
            </View>

            {showFilters && (
                <View style={styles.expandedFilters}>
                    <View style={styles.filterGrid}>
                        <TextInput
                            placeholder="Location"
                            placeholderTextColor="#94a3b8"
                            style={styles.inlineInput}
                            value={filters.location}
                            onChangeText={(text) => updateFilter('location', text)}
                        />
                        <CustomPicker
                            label="Category"
                            value={filters.category}
                            options={categories}
                            onSelect={(val) => updateFilter('category', val)}
                            icon="tag"
                        />
                    </View>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                        {['Full-time', 'Part-time', 'Contract'].map(type => (
                            <TouchableOpacity 
                                key={type}
                                style={[styles.chip, filters.type === type && styles.chipActive]}
                                onPress={() => updateFilter('type', filters.type === type ? '' : type)}
                            >
                                <Text style={[styles.chipText, filters.type === type && styles.chipTextActive]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 12,
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            }
        })
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchField: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 50,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#334155',
        marginLeft: 10,
    },
    filterToggle: {
        width: 50,
        height: 50,
        backgroundColor: '#f1f5f9',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterToggleActive: {
        backgroundColor: '#1e1b4b',
    },
    expandedFilters: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    filterGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    inlineInput: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        fontSize: 14,
        color: '#334155',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    pickerWrapper: {
        flex: 1,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 12,
        height: 44,
    },
    pickerValue: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
        marginLeft: 8,
    },
    pickerPlaceholder: {
        color: '#94a3b8',
    },
    chipScroll: {
        marginHorizontal: -4,
    },
    chip: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 4,
    },
    chipActive: {
        backgroundColor: '#1e1b4b',
    },
    chipText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
    },
    chipTextActive: {
        color: '#fff',
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
