import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService } from '../services/DatabaseService';

interface AuthScreenProps {
    onAuthSuccess: (user: any) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: '',
    });

    useEffect(() => {
        // Initialize auth service
        databaseService.initialize().catch(console.error);
    }, []);

    const validateForm = (): string | null => {
        if (!formData.email || !formData.password) {
            return 'Please fill in all required fields';
        }

        if (!formData.email.includes('@') || !formData.email.includes('.')) {
            return 'Please enter a valid email address';
        }

        if (formData.password.length < 6) {
            return 'Password must be at least 6 characters long';
        }

        if (!isLogin) {
            if (!formData.name.trim()) {
                return 'Please enter your full name';
            }
            if (formData.password !== formData.confirmPassword) {
                return 'Passwords do not match';
            }
        }

        return null;
    };

    const handleSubmit = async () => {
        const error = validateForm();
        if (error) {
            Alert.alert('Validation Error', error);
            return;
        }

        setLoading(true);

        try {
            let result;
            if (isLogin) {
                result = await databaseService.signInUser(formData.email, formData.password);
            } else {
                result = await databaseService.registerUser(formData.email, formData.password, formData.name);
            }

            if (result.success && result.user) {
                onAuthSuccess(result.user);
            } else {
                Alert.alert('Error', result.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Auth error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({ email: '', password: '', name: '', confirmPassword: '' });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.logo}>Uncluttr</Text>
                        <Text style={styles.subtitle}>
                            {isLogin ? 'Welcome back' : 'Create your account'}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {!isLogin && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Full Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    autoCapitalize="words"
                                    textContentType="name"
                                />
                            </View>
                        )}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#9CA3AF"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text.toLowerCase() })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="emailAddress"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#9CA3AF"
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                secureTextEntry
                                textContentType="password"
                            />
                        </View>

                        {!isLogin && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                    secureTextEntry
                                    textContentType="password"
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            </Text>
                            <TouchableOpacity onPress={toggleMode} disabled={loading}>
                                <Text style={styles.footerLink}>
                                    {isLogin ? 'Sign Up' : 'Sign In'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        fontSize: 36,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -1,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    submitButton: {
        backgroundColor: '#111827',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#6B7280',
    },
    footerLink: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '600',
    },
});

export default AuthScreen;
