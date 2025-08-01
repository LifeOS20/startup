import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ModernMetricCardProps {
    title: string;
    value: string;
    subtitle: string;
    color: string;
    onPress?: () => void;
    isConnected?: boolean;
    connectText?: string;
    onConnect?: () => void;
}

const ModernMetricCard: React.FC<ModernMetricCardProps> = ({
    title,
    value,
    subtitle,
    color,
    onPress,
    isConnected = true,
    connectText = 'Connect',
    onConnect,
}) => {
    return (
        <TouchableOpacity
            style={[styles.container, { borderLeftColor: color }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>

                {isConnected ? (
                    <View style={styles.dataContainer}>
                        <Text style={styles.value}>{value}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    </View>
                ) : (
                    <View style={styles.disconnectedContainer}>
                        <Text style={styles.disconnectedText}>Not connected</Text>
                        {onConnect && (
                            <TouchableOpacity style={styles.connectButton} onPress={onConnect}>
                                <Text style={styles.connectButtonText}>{connectText}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            <View style={[styles.indicator, { backgroundColor: color }]} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        marginHorizontal: 8,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        position: 'relative',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dataContainer: {
        alignItems: 'flex-start',
    },
    value: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    disconnectedContainer: {
        alignItems: 'flex-start',
    },
    disconnectedText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    connectButton: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    connectButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    indicator: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});

export default ModernMetricCard;
