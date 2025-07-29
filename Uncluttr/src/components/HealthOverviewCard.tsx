import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface HealthOverviewCardProps {
  healthProfile: any;
  onPress: () => void;
  onConnect: () => void;
}

const HealthOverviewCard: React.FC<HealthOverviewCardProps> = ({
  healthProfile,
  onPress,
  onConnect,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.title}>❤️ Health</Text>
      <Text style={styles.subtitle}>
        {healthProfile ? 'Connected' : 'Not connected'}
      </Text>
      {!healthProfile && (
        <TouchableOpacity style={styles.connectButton} onPress={onConnect}>
          <Text style={styles.connectText}>Connect HealthKit</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  connectButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    alignItems: 'center',
  },
  connectText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default HealthOverviewCard; 