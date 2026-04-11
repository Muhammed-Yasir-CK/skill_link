import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const JobSeekerDashboard = () => (
    <View style={styles.container}>
        <Text style={styles.text}>JobSeekerDashboard Page Placeholder</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    text: { fontSize: 18, fontWeight: 'bold', color: '#4338ca' }
});

export default JobSeekerDashboard;
