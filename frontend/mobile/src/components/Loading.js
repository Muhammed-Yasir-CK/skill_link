import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

const Loading = ({ message = "Loading..." }) => (
    <View style={styles.container}>
        <ActivityIndicator size="large" color="#4338ca" />
        {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    }
});

export default Loading;
