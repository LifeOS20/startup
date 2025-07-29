import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import { aiService } from '../services/AIService';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [securityTip, setSecurityTip] = useState('');
  const [isGeneratingTip, setIsGeneratingTip] = useState(false);
  
  const { isLoading, error, login, loginWithGoogle, loginWithApple, loginAttempts } = useAuthStore();

  // Generate security tip on component mount
  useEffect(() => {
    generateSecurityTip();
  }, []);

  // Generate a new security tip when login attempts increase
  useEffect(() => {
    if (loginAttempts > 0) {
      generateSecurityTip();
    }
  }, [loginAttempts]);

  const generateSecurityTip = async () => {
    setIsGeneratingTip(true);
    try {
      // Use the security agent to generate a security tip
      const securityData = {
        loginAttempts,
        deviceInfo: Platform.OS,
        timeOfDay: new Date().getHours(),
      };
      
      const prompt = `Generate a brief security tip for a user logging into a personal life management app. Consider:
      - Login attempts: ${loginAttempts}
      - Device: ${Platform.OS}
      - Time: ${new Date().toLocaleTimeString()}
      
      Provide a concise, helpful tip about password security, account protection, or safe login practices.`;
      
      const response = await aiService.generateText(prompt, 100);
      setSecurityTip(response || 'Use a strong, unique password and enable two-factor authentication when available.');
    } catch (error) {
      console.error('Failed to generate security tip:', error);
      setSecurityTip('Use a strong, unique password and enable two-factor authentication when available.');
    } finally {
      setIsGeneratingTip(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Log login attempt for security analysis
    try {
      const loginContext = {
        email: email.toLowerCase(),
        timestamp: new Date(),
        device: Platform.OS,
        previousAttempts: loginAttempts
      };
      
      // In a real app, we would analyze this with AI
      // For now, just log it
      console.log('Login attempt:', loginContext);
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }

    const success = await login(email, password);
    if (success) {
      // Navigation is handled by the AppNavigator in App.tsx
    }
  };

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      // Navigation is handled by the AppNavigator in App.tsx
    }
  };

  const handleAppleLogin = async () => {
    const success = await loginWithApple();
    if (success) {
      // Navigation is handled by the AppNavigator in App.tsx
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Logging in..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>LifeOS</Text>
            <Text style={styles.tagline}>Your Personal Life CEO</Text>
          </View>

          <View style={styles.formContainer}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            {securityTip && (
              <View style={styles.securityTipContainer}>
                <Text style={styles.securityTipTitle}>Security Tip:</Text>
                <Text style={styles.securityTipText}>{securityTip}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.divider} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                onPress={handleGoogleLogin}
              >
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton]}
                  onPress={handleAppleLogin}
                >
                  <Text style={styles.socialButtonText}>Apple</Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6c757d',
  },
  formContainer: {
    width: '100%',
  },
  errorText: {
    color: '#dc3545',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ced4da',
  },
  orText: {
    marginHorizontal: 16,
    color: '#6c757d',
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  socialButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  securityTipContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  securityTipTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    color: '#343a40',
  },
  securityTipText: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18,
  },
});

export default LoginScreen;