import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLifeOSStore } from '../stores/lifeOSStore';
import LoadingSpinner from '../components/LoadingSpinner';

const SmartHomeScreen: React.FC = () => {
  const { smartHomeData, isLoading } = useLifeOSStore();

  if (isLoading) {
    return <LoadingSpinner message="Loading smart home data..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Smart Home Devices</Text>
      <FlatList
        data={smartHomeData?.devices || []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.deviceCard}>
            <Text style={styles.deviceName}>{item.name}</Text>
            <Text style={styles.deviceType}>{item.type}</Text>
            <Text style={styles.deviceStatus}>
              {item.status === 'online' ? '🟢 Online' : item.status === 'offline' ? '🔴 Offline' : '⚠️ Error'}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No smart home devices found.</Text>}
        contentContainerStyle={(!smartHomeData || smartHomeData.devices.length === 0) ? styles.emptyContainer : undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#111827',
    marginBottom: 24,
    letterSpacing: -1,
  },
  deviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  deviceStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default SmartHomeScreen; 