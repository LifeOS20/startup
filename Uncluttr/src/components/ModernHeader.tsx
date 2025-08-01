import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface ModernHeaderProps {
    title: string;
    subtitle?: string;
    rightAction?: {
        icon: string;
        onPress: () => void;
    };
}

const ModernHeader: React.FC<ModernHeaderProps> = ({
    title,
    subtitle,
    rightAction
}) => {
    const navigation = useNavigation();

    const openDrawer = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>

                {rightAction ? (
                    <TouchableOpacity style={styles.actionButton} onPress={rightAction.onPress}>
                        <Text style={styles.actionIcon}>{rightAction.icon}</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.spacer} />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        minHeight: 60,
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuIcon: {
        fontSize: 18,
        color: '#374151',
        fontWeight: '600',
    },
    titleContainer: {
        flex: 1,
        marginLeft: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionIcon: {
        fontSize: 16,
        color: '#374151',
    },
    spacer: {
        width: 40,
    },
});

export default ModernHeader;
