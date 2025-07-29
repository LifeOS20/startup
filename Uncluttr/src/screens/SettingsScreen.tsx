import React, { useState } from 'react';
import { View, Text, TextInput, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLifeOSStore } from '../stores/lifeOSStore';
import LoadingSpinner from '../components/LoadingSpinner';

const SettingsScreen: React.FC = () => {
  const { user, isLoading, setUser } = useLifeOSStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState(user?.preferences.notifications ?? true);
  const [theme, setTheme] = useState(user?.preferences.theme || 'light');

  if (isLoading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  const handleSave = () => {
    if (!user) return;
    setUser({
      ...user,
      name,
      email,
      preferences: {
        ...user.preferences,
        notifications,
        theme,
      },
    });
    Alert.alert('Settings updated', 'Your preferences have been saved.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <View style={styles.row}>
          <Text style={styles.label}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Theme</Text>
          <TouchableOpacity
            style={[styles.themeButton, theme === 'light' && styles.themeButtonActive]}
            onPress={() => setTheme('light')}
          >
            <Text style={styles.themeButtonText}>Light</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.themeButton, theme === 'dark' && styles.themeButtonActive]}
            onPress={() => setTheme('dark')}
          >
            <Text style={styles.themeButtonText}>Dark</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.themeButton, theme === 'auto' && styles.themeButtonActive]}
            onPress={() => setTheme('auto')}
          >
            <Text style={styles.themeButtonText}>Auto</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  label: {
    fontSize: 16,
    color: '#212529',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f1f3f4',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeButton: {
    backgroundColor: '#f1f3f4',
    borderRadius: 6,
    padding: 10,
    marginHorizontal: 4,
  },
  themeButtonActive: {
    backgroundColor: '#007AFF',
  },
  themeButtonText: {
    color: '#212529',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen; 