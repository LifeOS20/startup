import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { SmartHomeData } from '../stores/lifeOSStore';

interface SmartHomeOverviewCardProps {
  smartHomeData: SmartHomeData | null;
  onPress: () => void;
}

const SmartHomeOverviewCard: React.FC<SmartHomeOverviewCardProps> = ({
  smartHomeData,
  onPress,
}) => {
  const isConnected = !!smartHomeData;
  const deviceCount = smartHomeData?.devices?.length ?? 0;
  const onlineDevices = smartHomeData?.devices?.filter(d => d.status === 'online').length ?? 0;
  const offlineDevices = smartHomeData?.devices?.filter(d => d.status === 'offline').length ?? 0;
  const energyUsage = smartHomeData?.energyUsage?.current ?? 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.title}>🏡 Smart Home</Text>
      <Text style={styles.subtitle}>{isConnected ? 'Connected' : 'Not connected'}</Text>
      {isConnected && (
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{deviceCount}</Text>
            <Text style={styles.statLabel}>Devices</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{onlineDevices}</Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{offlineDevices}</Text>
            <Text style={styles.statLabel}>Offline</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{energyUsage} kWh</Text>
            <Text style={styles.statLabel}>Current Usage</Text>
          </View>
        </View>
      )}
      {!isConnected && (
        <Text style={styles.connectHint}>Connect your smart home hub to get started.</Text>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  connectHint: {
    marginTop: 8,
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SmartHomeOverviewCard; 